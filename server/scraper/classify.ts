/**
 * Phase 1 of the scraping pipeline: classification.
 *
 * Before spending tokens on full structured extraction, we first ask the LLM:
 * "Is this page actually an opportunity?" — a cheap, fast yes/no + confidence.
 *
 * Primary LLM: MiniMax (cheap)
 * Fallback:    invokeLLM (Forge/Gemini)
 */

import { callMinimax, parseMinimaxJson } from "./llm/minimaxClient";
import { ENV } from "../_core/env";
import { invokeLLM } from "../_core/llm";

export interface ClassificationResult {
  isOpportunity: boolean;
  confidence: number;
  opportunityTypeGuess: string;
  reason: string;
}

const SYSTEM_PROMPT = `You are an expert at identifying opportunity pages (scholarships, fellowships, accelerators, grants, competitions, internships, exchanges, conferences).

Your job is to decide if the provided text contains a REAL, SPECIFIC opportunity with application details.

Rules:
- Return JSON only — no extra text.
- Set is_opportunity to true ONLY if the page describes a concrete opportunity with at least some application info (deadline, eligibility, or application link).
- A generic article, blog post, or list of opportunities is NOT an opportunity itself.
- Do not invent information. Base your answer entirely on the provided text.
- confidence: 0.0–1.0 (how certain you are in your classification)
- opportunity_type_guess: scholarship | fellowship | accelerator | incubator | competition | grant | conference | internship | exchange | other
- reason: one sentence explaining your decision

Return format (strict JSON, no markdown):
{"is_opportunity":true,"confidence":0.91,"opportunity_type_guess":"fellowship","reason":"Page describes a fellowship with deadline, eligibility criteria, and application link."}`;

function buildUserPrompt(content: string): string {
  return `Classify this page content (first 4000 chars):\n\n${content.slice(0, 4000)}`;
}

/** Classify using MiniMax with invokeLLM as fallback */
export async function classifyPage(
  content: string
): Promise<ClassificationResult> {
  // Try MiniMax first
  try {
    const result = await callMinimax({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(content) },
      ],
      responseSchemaName: "classification",
      maxTokens: 256,
    });

    const parsed = parseMinimaxJson<any>(result.content);
    return {
      isOpportunity: Boolean(parsed.is_opportunity),
      confidence: Number(parsed.confidence) || 0,
      opportunityTypeGuess: parsed.opportunity_type_guess ?? "other",
      reason: parsed.reason ?? "",
    };
  } catch (minimaxErr) {
    console.warn(`[classify] MiniMax failed, falling back: ${minimaxErr instanceof Error ? minimaxErr.message : minimaxErr}`);
  }

  // Fallback: invokeLLM (Forge/Gemini) — only available in dev/Cursor IDE
  if (ENV.forgeApiKey) {
    try {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(content) },
        ],
        response_format: { type: "json_object" },
        max_tokens: 256,
      });
      const raw = result.choices[0]?.message?.content ?? "{}";
      const parsed = typeof raw === "string" ? JSON.parse(raw) : {};
      return {
        isOpportunity: Boolean(parsed.is_opportunity),
        confidence: Number(parsed.confidence) || 0,
        opportunityTypeGuess: parsed.opportunity_type_guess ?? "other",
        reason: parsed.reason ?? "",
      };
    } catch (fallbackErr) {
      console.error(`[classify] Fallback also failed: ${fallbackErr}`);
    }
  }

  return {
    isOpportunity: false,
    confidence: 0,
    opportunityTypeGuess: "other",
    reason: "Classification failed — no LLM available",
  };
}
