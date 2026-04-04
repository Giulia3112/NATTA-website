/**
 * Unified LLM client for the scraper.
 *
 * Priority (first available wins):
 *   1. Groq     — free: 30 RPM, 6000 RPD via GROQ_API_KEY (recommended)
 *   2. Gemini   — free: 15 RPM, 1500 RPD via GEMINI_API_KEY
 *   3. MiniMax  — paid via MINIMAX_API_KEY
 *   4. Forge    — Cursor IDE proxy, dev-only
 *
 * All providers share the OpenAI-compatible chat format.
 *
 * HOW TO GET A FREE GROQ KEY (recommended):
 *   1. Go to https://console.groq.com → API Keys
 *   2. Sign up (free) and create a key
 *   3. Add GROQ_API_KEY to .env and to Render environment variables
 */

import { ENV } from "../../_core/env";

// Groq — fastest free tier: 30 RPM, 6000 RPD
const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Gemini via its OpenAI-compatible endpoint (free tier: 15 RPM)
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";

// MiniMax international endpoint (paid)
const MINIMAX_BASE = "https://api.minimaxi.chat/v1/chat/completions";
const MINIMAX_MODEL = "MiniMax-Text-01";

export interface ScraperLlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ScraperLlmOptions {
  messages: ScraperLlmMessage[];
  maxTokens?: number;
}

interface Provider {
  name: string;
  url: string;
  model: string;
  key: string;
}

function getProvider(): Provider {
  if (ENV.groqApiKey) {
    return { name: "Groq", url: GROQ_BASE, model: GROQ_MODEL, key: ENV.groqApiKey };
  }
  if (ENV.geminiApiKey) {
    return { name: "Gemini", url: GEMINI_BASE, model: GEMINI_MODEL, key: ENV.geminiApiKey };
  }
  if (ENV.minimaxApiKey) {
    return { name: "MiniMax", url: MINIMAX_BASE, model: MINIMAX_MODEL, key: ENV.minimaxApiKey };
  }
  if (ENV.forgeApiKey && ENV.forgeApiUrl) {
    return {
      name: "Forge",
      url: `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`,
      model: "gemini-2.5-flash",
      key: ENV.forgeApiKey,
    };
  }
  throw new Error(
    "[ScraperLLM] No LLM configured. Set GROQ_API_KEY (free at console.groq.com) in Render environment variables."
  );
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Extract the retry-after delay (in ms) from a Gemini 429 response body.
 * Falls back to `defaultMs` if not found.
 */
function parseRetryDelay(body: string, defaultMs: number): number {
  try {
    const data = JSON.parse(body);
    const details: any[] = data?.[0]?.error?.details ?? data?.error?.details ?? [];
    const retryInfo = details.find((d: any) => d["@type"]?.includes("RetryInfo"));
    if (retryInfo?.retryDelay) {
      const seconds = parseFloat(retryInfo.retryDelay.replace("s", ""));
      if (!isNaN(seconds)) return Math.ceil(seconds * 1000) + 1000; // +1s buffer
    }
  } catch {
    // ignore parse errors
  }
  return defaultMs;
}

/**
 * Call the best available LLM with the given messages.
 * Automatically retries on 429 rate-limit responses (up to 3 times).
 */
export async function callScraperLlm(opts: ScraperLlmOptions): Promise<string> {
  const provider = getProvider();

  const payload: Record<string, unknown> = {
    model: provider.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: 0.1,
  };

  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });

    if (response.status === 429) {
      const body = await response.text();
      if (attempt === MAX_RETRIES) {
        throw new Error(`[${provider.name}] Rate limit exceeded after ${MAX_RETRIES} retries: ${body}`);
      }
      const delay = parseRetryDelay(body, 30_000 * (attempt + 1));
      console.log(`[ScraperLLM] Rate limited by ${provider.name}, waiting ${Math.round(delay / 1000)}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
      await sleep(delay);
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`[${provider.name}] API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as any;
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error(`[${provider.name}] Empty or invalid response`);
    }

    return content;
  }

  throw new Error(`[${provider.name}] Failed after ${MAX_RETRIES} retries`);
}

/**
 * Parse JSON from LLM response, stripping markdown code fences if present.
 */
export function parseScraperJson<T>(content: string): T {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}
