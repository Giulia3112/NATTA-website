/**
 * Unified LLM client for the scraper.
 *
 * Priority (first available wins):
 *   1. Google Gemini  — free tier: 1 500 req/day via GEMINI_API_KEY
 *   2. MiniMax        — cheap paid via MINIMAX_API_KEY
 *   3. Forge/Gemini   — Cursor IDE proxy, dev-only (BUILT_IN_FORGE_API_KEY)
 *
 * All providers share the same OpenAI-compatible chat format so the call
 * site is identical regardless of which backend is used.
 *
 * HOW TO GET A FREE GEMINI KEY:
 *   1. Go to https://aistudio.google.com/apikey
 *   2. Click "Create API key" (Google account required)
 *   3. Add GEMINI_API_KEY to .env and to Render environment variables
 */

import { ENV } from "../../_core/env";

// Gemini via its OpenAI-compatible endpoint (free tier)
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";

// MiniMax international endpoint
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
    "[ScraperLLM] No LLM API key configured. Set GEMINI_API_KEY (free) in .env and Render."
  );
}

/**
 * Call the best available LLM with the given messages.
 * Returns the raw text content of the model's response.
 */
export async function callScraperLlm(opts: ScraperLlmOptions): Promise<string> {
  const provider = getProvider();

  const payload: Record<string, unknown> = {
    model: provider.model,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: 0.1,
  };

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.key}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });

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
