/**
 * Main scraping pipeline.
 *
 * Flow per source:
 *   1. Discover opportunity URLs (LLM extracts links from listing page)
 *   2. Fetch each URL (HTTP or Firecrawl depending on source strategy)
 *   3. Classify — is this actually an opportunity? (MiniMax, cheap, fast)
 *   4. Extract — structured data extraction (MiniMax → Forge/Gemini fallback)
 *   5. Deduplicate and return results
 *
 * The caller (scraperRouter or scheduler) is responsible for storing results.
 */

import { fetchHtml } from "./fetchers/httpFetcher";
import { firecrawlScrape } from "./fetchers/firecrawlFetcher";
import { classifyPage } from "./classify";
import { extractOpportunity } from "./extract";
import { callScraperLlm, parseScraperJson } from "./llm/scraperLlm";
import type { OpportunitySource } from "./sources";
import { getSortedSources } from "./sources";

export interface ScrapedOpportunity {
  url: string;
  title: string;
  description?: string;
  organizer: string;
  deadline?: Date;
  opportunityType: "Scholarship" | "Fellowship" | "Accelerator" | "Incubator" | "Competition" | "Internship" | "Grant" | "Conference" | "Exchange Program";
  stage: "High school" | "Undergraduate" | "Graduate" | "Startup idea" | "MVP" | "Revenue" | "Scale" | "Multi-stage";
  regions: string[];
  mode: "Online" | "In-person" | "Hybrid";
  fields: string[];
  funding: "Fully funded" | "Partial" | "Stipend" | "Equity-based" | "Not certain";
  fee: "No-fee" | "Paid";
  requirements?: string;
  benefits?: string;
  programStartDate?: Date;
  programEndDate?: Date;
  fundingAmount?: string;
  applicationLink?: string;
  confidence: number;
}

/** Confidence threshold — below this, opportunity goes to pending for admin review */
const CONFIDENCE_THRESHOLD = 0.75;

/** Delay between individual page fetches to be polite to servers */
const FETCH_DELAY_MS = 1500;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Discover opportunity URLs from a source's listing page.
 * Uses simple LLM prompt on the raw HTML/markdown.
 */
async function discoverUrls(source: OpportunitySource): Promise<string[]> {
  const listingUrl = `${source.baseUrl}${source.listingPath}`;
  console.log(`[Scraper] Discovering URLs from ${source.name} (${listingUrl})`);

  let content = "";

  if (source.fetchStrategy === "firecrawl") {
    const { markdown, ok } = await firecrawlScrape(listingUrl);
    if (ok) content = markdown;
  }

  // Always fall back to HTTP if Firecrawl didn't work or isn't configured
  if (!content) {
    const { html, ok } = await fetchHtml(listingUrl);
    if (!ok || !html) {
      console.warn(`[Scraper] Could not fetch listing page for ${source.name}`);
      return [];
    }
    content = html;
  }

  // Use MiniMax to extract opportunity links from the listing
  try {
    const raw = await callScraperLlm({
      messages: [
        {
          role: "system",
          content:
            'Extract up to 10 individual opportunity page URLs from this content. Return ONLY valid JSON like {"urls":["https://..."]}. Include only links to specific opportunity/program pages, not category or index pages. No markdown, no explanation, no extra text.',
        },
        {
          role: "user",
          content: `Base URL: ${source.baseUrl}\nContent:\n${content.slice(0, 8000)}`,
        },
      ],
      maxTokens: 512,
    });

    const data = parseScraperJson<{ urls?: string[] }>(raw);
    const urls: string[] = Array.isArray(data.urls) ? data.urls : [];

    return urls
      .filter((u) => typeof u === "string" && u.length > 0)
      .map((u) => (u.startsWith("http") ? u : `${source.baseUrl}${u.startsWith("/") ? u : "/" + u}`))
      .slice(0, source.maxLinks);
  } catch (err) {
    console.warn(`[Scraper] URL discovery failed for ${source.name}: ${err}`);
    return [];
  }
}

/**
 * Fetch page content (HTML or markdown via Firecrawl).
 * Returns clean text for LLM consumption.
 */
async function fetchPageContent(
  url: string,
  strategy: "http" | "firecrawl"
): Promise<string> {
  if (strategy === "firecrawl") {
    const { markdown, ok } = await firecrawlScrape(url);
    if (ok && markdown) return markdown;
    // Fall through to HTTP on failure
  }

  const { html, ok } = await fetchHtml(url);
  if (!ok || !html) return "";

  // Strip most HTML tags for cleaner LLM input
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{3,}/g, "\n")
    .trim();
}

/**
 * Process a single source: discover → fetch → classify → extract.
 */
async function processSource(source: OpportunitySource): Promise<ScrapedOpportunity[]> {
  const results: ScrapedOpportunity[] = [];

  const urls = await discoverUrls(source);
  console.log(`[Scraper] ${source.name}: ${urls.length} URLs to process`);

  for (const url of urls) {
    try {
      await sleep(FETCH_DELAY_MS);

      const content = await fetchPageContent(url, source.fetchStrategy);
      if (!content) {
        console.warn(`[Scraper] Empty content at ${url}`);
        continue;
      }

      // Phase 1: classify (cheap — decides if we should spend more tokens)
      const classification = await classifyPage(content);

      if (!classification.isOpportunity || classification.confidence < CONFIDENCE_THRESHOLD - 0.2) {
        console.log(`[Scraper] ✗ Skipped (${Math.round(classification.confidence * 100)}% confidence): ${url}`);
        continue;
      }

      // Phase 2: extract structured data
      const opportunity = await extractOpportunity(content, url);

      if (opportunity) {
        results.push(opportunity);
        console.log(`[Scraper] ✓ Extracted (${Math.round(opportunity.confidence * 100)}%): ${opportunity.title}`);
      }
    } catch (err) {
      console.error(`[Scraper] Error processing ${url}: ${err}`);
    }
  }

  return results;
}

/**
 * Run the full scraping pipeline across all (or selected) sources.
 * Sources are processed in parallel batches of up to 3 at once.
 */
export async function scrapeAllWebsites(
  sources = getSortedSources()
): Promise<ScrapedOpportunity[]> {
  console.log(`[Scraper] Starting pipeline across ${sources.length} sources...`);
  const all: ScrapedOpportunity[] = [];

  // Process sources in batches of 3 (avoid overwhelming servers or rate limits)
  const BATCH_SIZE = 3;
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(batch.map(processSource));

    for (const result of settled) {
      if (result.status === "fulfilled") {
        all.push(...result.value);
      }
    }
  }

  console.log(`[Scraper] Pipeline complete. Total scraped: ${all.length}`);
  return all;
}

/**
 * Remove duplicates by title+organizer (case-insensitive).
 */
export function deduplicateOpportunities(opps: ScrapedOpportunity[]): ScrapedOpportunity[] {
  const seen = new Set<string>();
  const unique: ScrapedOpportunity[] = [];

  for (const opp of opps) {
    const key = `${opp.title.toLowerCase().trim()}|${opp.organizer.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(opp);
    }
  }

  return unique;
}
