/**
 * Simple HTTP fetcher — used for static/server-rendered pages.
 * Includes retry logic with exponential backoff.
 */

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface FetchResult {
  html: string;
  url: string;
  ok: boolean;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchHtml(url: string, retries = 2): Promise<FetchResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_UA,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5,pt-BR;q=0.3",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      const html = await response.text();
      return { html, url, ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1)); // 1s, 2s backoff
      }
    }
  }

  console.warn(`[httpFetcher] Failed after ${retries + 1} attempts: ${url} — ${lastError?.message}`);
  return { html: "", url, ok: false };
}
