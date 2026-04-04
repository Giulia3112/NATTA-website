/**
 * MiniMax LLM client — primary LLM for scraper classification and extraction.
 *
 * MiniMax is OpenAI-API-compatible and significantly cheaper than GPT-4 / Claude.
 * API docs: https://www.minimaxi.com/document/guides/chat-model/V2
 * Base URL (international): https://api.minimaxi.chat/v1/chat/completions
 */

import { ENV } from "../../_core/env";

const MINIMAX_BASE_URL = "https://api.minimaxi.chat/v1/chat/completions";
const MINIMAX_MODEL = "MiniMax-Text-01"; // fast + cheap; supports structured JSON output

export interface MinimaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MinimaxOptions {
  messages: MinimaxMessage[];
  maxTokens?: number;
}

export interface MinimaxResult {
  content: string;
}

/**
 * Call MiniMax with automatic JSON extraction.
 * Throws if the API key is not configured or the request fails.
 */
export async function callMinimax(opts: MinimaxOptions): Promise<MinimaxResult> {
  if (!ENV.minimaxApiKey) {
    throw new Error("[MiniMax] MINIMAX_API_KEY is not configured");
  }

  const payload: Record<string, unknown> = {
    model: MINIMAX_MODEL,
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: 0.1,
    // MiniMax does NOT support response_format — JSON is enforced via system prompt
  };

  const response = await fetch(MINIMAX_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.minimaxApiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[MiniMax] API error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("[MiniMax] Empty or invalid response");
  }

  return { content };
}

/**
 * Parse JSON from MiniMax response, stripping any markdown code fences if present.
 */
export function parseMinimaxJson<T>(content: string): T {
  const cleaned = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(cleaned) as T;
}
