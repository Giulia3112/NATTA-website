/**
 * Firecrawl fetcher — for JS-rendered pages that simple fetch can't access.
 *
 * Free tier: 500 credits/month (1 credit per page scrape).
 * Docs: https://docs.firecrawl.dev/api-reference/endpoint/scrape
 *
 * CONNECT YOUR API KEY:
 *   1. Sign up at https://firecrawl.dev
 *   2. Set FIRECRAWL_API_KEY in .env and in Render environment variables
 */

import { ENV } from "../../_core/env";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v1";

export interface FirecrawlResult {
  markdown: string;
  url: string;
  ok: boolean;
}

export async function firecrawlScrape(url: string): Promise<FirecrawlResult> {
  if (!ENV.firecrawlApiKey) {
    console.warn("[Firecrawl] FIRECRAWL_API_KEY not set, falling back to simple fetch");
    return { markdown: "", url, ok: false };
  }

  try {
    const response = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Firecrawl API ${response.status}: ${text}`);
    }

    const data = (await response.json()) as any;

    if (!data?.success || !data?.data?.markdown) {
      throw new Error("Firecrawl returned empty content");
    }

    return { markdown: data.data.markdown, url, ok: true };
  } catch (err) {
    console.warn(`[Firecrawl] Failed for ${url}: ${err instanceof Error ? err.message : err}`);
    return { markdown: "", url, ok: false };
  }
}

/**
 * Crawl a listing page and return up to `maxLinks` internal links.
 * Useful for discovering opportunity URLs from index pages.
 */
export async function firecrawlDiscoverLinks(
  baseUrl: string,
  listingPath: string,
  maxLinks = 8
): Promise<string[]> {
  if (!ENV.firecrawlApiKey) return [];

  try {
    const response = await fetch(`${FIRECRAWL_BASE}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: `${baseUrl}${listingPath}`,
        formats: ["links"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as any;
    const links: string[] = data?.data?.links ?? [];

    return links
      .filter((link) => link.startsWith(baseUrl) || link.startsWith("/"))
      .map((link) => (link.startsWith("/") ? `${baseUrl}${link}` : link))
      .slice(0, maxLinks);
  } catch {
    return [];
  }
}
