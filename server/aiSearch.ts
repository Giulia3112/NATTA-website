/**
 * AI-powered opportunity search.
 *
 * Flow:
 *   1. Load all opportunities from DB (compact representation)
 *   2. Send user query + opportunity list to LLM → returns ranked IDs + reasons
 *   3. If TAVILY_API_KEY is set, search the web for each top match to enrich details
 *   4. Return: NATTA matches (with AI reasons) + optional web snippets
 */

import { callScraperLlm, parseScraperJson } from "./scraper/llm/scraperLlm";
import { getOpportunities } from "./db";
import { ENV } from "./_core/env";

export interface AiSearchMatch {
  id: number;
  title: string;
  organizer: string;
  opportunityType: string;
  stage: string;
  regions: string[];
  fields: string[];
  funding: string;
  fee: string;
  mode: string;
  deadline: Date | null;
  description: string | null;
  applicationLink: string | null;
  aiReason: string;
  webSnippets?: WebSnippet[];
}

export interface WebSnippet {
  title: string;
  url: string;
  content: string;
}

export interface AiSearchResult {
  matches: AiSearchMatch[];
  summary: string;
  webSearched: boolean;
}

interface LlmMatch {
  id: number;
  reason: string;
}

interface LlmResponse {
  matches: LlmMatch[];
  summary: string;
}

async function searchWeb(query: string): Promise<WebSnippet[]> {
  if (!ENV.tavilyApiKey) return [];

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ENV.tavilyApiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as any;
    return (data.results ?? []).map((r: any) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: (r.content ?? "").substring(0, 300),
    }));
  } catch {
    return [];
  }
}

function buildOpportunityList(opps: any[]): string {
  return opps
    .map((opp) => {
      const regions =
        typeof opp.regions === "string"
          ? JSON.parse(opp.regions)
          : (opp.regions ?? []);
      const fields =
        typeof opp.fields === "string"
          ? JSON.parse(opp.fields)
          : (opp.fields ?? []);
      const desc = opp.description
        ? ` | ${opp.description.substring(0, 120)}`
        : "";
      return `[${opp.id}] ${opp.title} | ${opp.opportunityType} | ${opp.stage} | ${regions.slice(0, 3).join("/")} | ${fields.slice(0, 3).join("/")}${desc}`;
    })
    .join("\n");
}

export async function aiSearchOpportunities(
  query: string
): Promise<AiSearchResult> {
  const allOpps = await getOpportunities();

  if (allOpps.length === 0) {
    return {
      matches: [],
      summary: "Nenhuma oportunidade encontrada no banco de dados ainda.",
      webSearched: false,
    };
  }

  const oppList = buildOpportunityList(allOpps);

  const systemPrompt = `You are NATTA's AI assistant helping students and entrepreneurs find scholarships, fellowships, accelerators, competitions, grants, internships, and other opportunities.

NATTA's opportunity database (format: [ID] Title | Type | Stage | Regions | Fields | Description):
${oppList}

When the user describes what they're looking for, identify the most relevant opportunities.
Respond ONLY with valid JSON in this exact format:
{
  "matches": [
    {"id": <number>, "reason": "<1-2 sentence explanation in the user's language>"},
    ...
  ],
  "summary": "<2-3 sentence message to the user in their language, summarizing what you found>"
}

Rules:
- Return at most 8 matches, ranked by relevance (most relevant first)
- Only return genuinely relevant matches — quality over quantity
- Detect the user's language and respond entirely in that language
- If the query is in Portuguese, respond in Portuguese
- If no good matches exist, return empty matches array and explain in summary
- Do NOT invent IDs — only use IDs that exist in the list above`;

  let raw: string;
  try {
    raw = await callScraperLlm({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      maxTokens: 1500,
    });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    if (msg.includes("No LLM configured") || msg.includes("GROQ_API_KEY")) {
      throw new Error(
        "Nenhuma chave de IA configurada no servidor. Adicione GROQ_API_KEY nas variáveis de ambiente do Render (console.groq.com → API Keys → gratuito)."
      );
    }
    throw new Error(`Erro ao chamar a IA: ${msg}`);
  }

  let llmResult: LlmResponse;
  try {
    llmResult = parseScraperJson<LlmResponse>(raw);
    if (!Array.isArray(llmResult.matches)) llmResult.matches = [];
  } catch {
    return {
      matches: [],
      summary: "Não foi possível processar a busca. Tente novamente.",
      webSearched: false,
    };
  }

  // Map matched IDs back to full opportunity objects
  const oppById = new Map(allOpps.map((o) => [o.id, o]));

  const matches: AiSearchMatch[] = llmResult.matches
    .filter((m) => oppById.has(m.id))
    .map((m) => {
      const opp = oppById.get(m.id)!;
      const regions =
        typeof opp.regions === "string"
          ? JSON.parse(opp.regions)
          : (opp.regions ?? []);
      const fields =
        typeof opp.fields === "string"
          ? JSON.parse(opp.fields)
          : (opp.fields ?? []);
      return {
        id: opp.id,
        title: opp.title,
        organizer: opp.organizer,
        opportunityType: opp.opportunityType,
        stage: opp.stage,
        regions,
        fields,
        funding: opp.funding,
        fee: opp.fee,
        mode: opp.mode,
        deadline: opp.deadline ?? null,
        description: opp.description ?? null,
        applicationLink: opp.applicationLink ?? null,
        aiReason: m.reason,
      };
    });

  // Web enrichment via Tavily (top 4 matches only to save quota)
  let webSearched = false;
  if (ENV.tavilyApiKey && matches.length > 0) {
    webSearched = true;
    const topMatches = matches.slice(0, 4);

    await Promise.all(
      topMatches.map(async (match) => {
        const webQuery = `${match.title} ${match.organizer} opportunity application`;
        const snippets = await searchWeb(webQuery);
        if (snippets.length > 0) {
          match.webSnippets = snippets;
        }
      })
    );
  }

  return {
    matches,
    summary: llmResult.summary ?? "",
    webSearched,
  };
}
