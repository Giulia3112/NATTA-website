/**
 * Main scraping pipeline.
 *
 * Flow per source:
 *   1. Discover opportunity URLs (HTML link parsing; Firecrawl for JS listings)
 *   2. Fetch each URL (HTTP or Firecrawl depending on source strategy)
 *   3. Classify — is this actually an opportunity? (MiniMax, cheap, fast)
 *   4. Extract — structured data extraction (MiniMax → Forge/Gemini fallback)
 *   5. Deduplicate and return results
 *
 * The caller (scraperRouter or scheduler) is responsible for storing results.
 */

import { fetchHtml } from "./fetchers/httpFetcher";
import { firecrawlScrape, firecrawlDiscoverLinks } from "./fetchers/firecrawlFetcher";
import { classifyPage } from "./classify";
import { extractOpportunity } from "./extract";
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

// Paths that are clearly not individual opportunity pages
const SKIP_PATH_PATTERNS = [
  /\/(category|categories|tag|tags|author|page|search|feed|rss|sitemap|wp-content|wp-json)/i,
  /\/(about|contact|privacy|terms|login|register|faq|help|support)/i,
  /\.(jpg|jpeg|png|gif|pdf|svg|css|js|xml|json)$/i,
  /xmlrpc\.php/i,
];

/** Third-party snippets in pathname — often mis-linked as same-host paths */
const JUNK_PATH_SNIPPETS = [
  "googletagmanager",
  "google-analytics",
  "doubleclick",
  "facebook.net",
  "connect.facebook",
  "jquery.com",
  "code.jquery",
  "fonts.googleapis",
  "gstatic.com",
];

/**
 * Extract candidate opportunity URLs from raw HTML — no LLM cost.
 * Resolves hrefs with the URL API (handles protocol-relative //... correctly).
 */
function extractLinksFromHtml(html: string, baseUrl: string, maxLinks: number): string[] {
  let site: URL;
  try {
    site = new URL(baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl);
  } catch {
    return [];
  }

  const host = site.hostname.toLowerCase();
  const hrefRegex = /href=["']([^"'#\s]+)["']/gi;
  const seen = new Set<string>();
  const links: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw || raw === "#") continue;
    if (/^javascript:/i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) continue;

    let resolved: URL;
    try {
      if (raw.startsWith("//")) {
        resolved = new URL(`https:${raw}`);
      } else {
        resolved = new URL(raw, `${site.origin}/`);
      }
    } catch {
      continue;
    }

    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") continue;
    if (resolved.hostname.toLowerCase() !== host) continue;

    const pathLower = (resolved.pathname + resolved.search).toLowerCase();
    if (SKIP_PATH_PATTERNS.some((re) => re.test(pathLower))) continue;
    if (JUNK_PATH_SNIPPETS.some((s) => pathLower.includes(s))) continue;

    const canonical = resolved.href;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      links.push(canonical);
      if (links.length >= maxLinks) break;
    }
  }

  return links;
}

/**
 * Discover opportunity URLs from a source's listing page.
 * Uses HTML link parsing — no LLM calls, no rate limits.
 */
async function discoverUrls(source: OpportunitySource): Promise<string[]> {
  const listingUrl = `${source.baseUrl}${source.listingPath}`;
  console.log(`[Scraper] Discovering URLs from ${source.name} (${listingUrl})`);

  // Try Firecrawl first for JS pages (returns links array directly)
  if (source.fetchStrategy === "firecrawl") {
    const links = await firecrawlDiscoverLinks(source.baseUrl, source.listingPath, source.maxLinks);
    if (links.length > 0) {
      console.log(`[Scraper] ${source.name}: found ${links.length} links via Firecrawl`);
      return links;
    }
  }

  // Fall back to simple HTTP + HTML parsing
  const { html, ok } = await fetchHtml(listingUrl);
  if (!ok || !html) {
    console.warn(`[Scraper] Could not fetch listing page for ${source.name}`);
    return [];
  }

  const links = extractLinksFromHtml(html, source.baseUrl, source.maxLinks);
  console.log(`[Scraper] ${source.name}: found ${links.length} candidate links`);
  return links;
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
 *
 * Sources are processed ONE AT A TIME to stay within Gemini free tier limits
 * (15 req/min). Each source already has internal delays between page fetches.
 * This is intentionally conservative — quality over speed.
 */
export async function scrapeAllWebsites(
  sources = getSortedSources()
): Promise<ScrapedOpportunity[]> {
  console.log(`[Scraper] Starting pipeline across ${sources.length} sources...`);
  const all: ScrapedOpportunity[] = [];

  for (const source of sources) {
    try {
      const results = await processSource(source);
      all.push(...results);
    } catch (err) {
      console.error(`[Scraper] Unexpected error for ${source.name}: ${err}`);
    }
    // Small pause between sources to avoid hitting rate limits
    await new Promise((r) => setTimeout(r, 2000));
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
