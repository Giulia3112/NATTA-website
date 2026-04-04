/**
 * Phase 2 of the scraping pipeline: structured data extraction.
 *
 * Only runs on pages that passed classification (isOpportunity = true, confidence >= threshold).
 * Extracts all relevant fields from the opportunity page.
 *
 * Primary LLM: MiniMax
 * Fallback:    invokeLLM (Forge/Gemini)
 */

import { callMinimax, parseMinimaxJson } from "./llm/minimaxClient";
import { ENV } from "../_core/env";
import { invokeLLM } from "../_core/llm";
import type { ScrapedOpportunity } from "./opportunityScraper";

const SYSTEM_PROMPT = `You are an expert at extracting structured opportunity data from web pages.

Rules (CRITICAL):
- Return ONLY valid JSON — no markdown, no code fences, no extra text.
- Extract ONLY what is explicitly stated or very strongly implied by the content.
- Use null for any field where there is no clear evidence.
- NEVER invent deadlines, fees, funding amounts, or eligibility criteria.
- If multiple deadlines exist, use the main application deadline.
- For funding: "Fully funded" means all costs covered; "Partial" means some costs; "Stipend" means living allowance only; "Equity-based" for accelerators taking equity; "Not certain" when unclear.
- For fee: "No-fee" if there is no application fee; "Paid" if there is one.

JSON schema (all fields required, use null when unknown):
{
  "title": string,
  "organizer": string,
  "description": string | null,
  "deadline": "YYYY-MM-DD" | null,
  "opportunityType": "Scholarship"|"Fellowship"|"Accelerator"|"Incubator"|"Competition"|"Internship"|"Grant"|"Conference"|"Exchange Program",
  "stage": "High school"|"Undergraduate"|"Graduate"|"Startup idea"|"MVP"|"Revenue"|"Scale"|"Multi-stage",
  "regions": string[],
  "mode": "Online"|"In-person"|"Hybrid",
  "fields": string[],
  "funding": "Fully funded"|"Partial"|"Stipend"|"Equity-based"|"Not certain",
  "fee": "No-fee"|"Paid",
  "fundingAmount": string | null,
  "applicationLink": string | null,
  "requirements": string | null,
  "benefits": string | null,
  "programStartDate": "YYYY-MM-DD" | null,
  "programEndDate": "YYYY-MM-DD" | null,
  "confidence": number
}

Available values for fields array: Tech, Engineering, AI/ML, Data Science, Business, Finance, Entrepreneurship, Social Impact, Climate, Sustainability, Health, Medicine, Arts, Education, Law, Agriculture, Architecture, Sciences, Mathematics, Languages, Policy, Robotics, Cybersecurity, Biotechnology, Economics.

Available values for regions array: Global, Brazil, Latin America, Africa, Europe, North America, Asia, Middle East, Oceania, Sub-Saharan Africa, Southeast Asia.`;

function buildUserPrompt(content: string, url: string): string {
  return `Extract opportunity data from this page.\nURL: ${url}\n\nContent:\n${content.slice(0, 8000)}`;
}

/** Extract structured data using MiniMax with invokeLLM as fallback */
export async function extractOpportunity(
  content: string,
  url: string
): Promise<ScrapedOpportunity | null> {
  let parsed: any = null;

  // Try MiniMax first
  try {
    const result = await callMinimax({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(content, url) },
      ],
      maxTokens: 1024,
    });
    parsed = parseMinimaxJson<any>(result.content);
  } catch (minimaxErr) {
    console.warn(`[extract] MiniMax failed, falling back: ${minimaxErr instanceof Error ? minimaxErr.message : minimaxErr}`);
  }

  // Fallback: invokeLLM (Forge/Gemini) — only available in dev/Cursor IDE
  if (!parsed && ENV.forgeApiKey) {
    try {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(content, url) },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1024,
      });
      const raw = result.choices[0]?.message?.content ?? "{}";
      parsed = typeof raw === "string" ? JSON.parse(raw) : {};
    } catch (fallbackErr) {
      console.error(`[extract] Fallback also failed for ${url}: ${fallbackErr}`);
    }
  }

  if (!parsed) return null;

  if (!parsed?.title || !parsed?.organizer) {
    console.warn(`[extract] Missing required fields from ${url}`);
    return null;
  }

  const confidence = Number(parsed.confidence) || 0;
  if (confidence < 0.5) {
    console.warn(`[extract] Confidence too low (${confidence}) for ${url}`);
    return null;
  }

  return {
    url,
    title: String(parsed.title),
    organizer: String(parsed.organizer),
    description: parsed.description ?? undefined,
    deadline: parsed.deadline ? new Date(parsed.deadline) : undefined,
    opportunityType: parsed.opportunityType ?? "Fellowship",
    stage: parsed.stage ?? "Multi-stage",
    regions: Array.isArray(parsed.regions) ? parsed.regions : ["Global"],
    mode: parsed.mode ?? "Online",
    fields: Array.isArray(parsed.fields) ? parsed.fields : [],
    funding: parsed.funding ?? "Not certain",
    fee: parsed.fee ?? "No-fee",
    fundingAmount: parsed.fundingAmount ?? undefined,
    applicationLink: parsed.applicationLink ?? url,
    requirements: parsed.requirements ?? undefined,
    benefits: parsed.benefits ?? undefined,
    programStartDate: parsed.programStartDate ? new Date(parsed.programStartDate) : undefined,
    programEndDate: parsed.programEndDate ? new Date(parsed.programEndDate) : undefined,
    confidence,
  };
}
