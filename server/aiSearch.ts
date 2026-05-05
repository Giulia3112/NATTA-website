/**
 * AI-powered opportunity search.
 *
 * Flow:
 *   1. Load all opportunities from DB (compact representation)
 *   2. Send user query + opportunity list to LLM → returns ranked IDs + reasons
 *   3. If TAVILY_API_KEY is set, search the web for each top match to enrich details
 *   4. Return: NATTA matches (with AI reasons) + optional web snippets
 */

import { parseScraperJson } from "./scraper/llm/scraperLlm";
import { getOpportunities } from "./db";
import { ENV } from "./_core/env";

/**
 * Dedicated LLM call for AI search.
 * Uses llama-3.1-8b-instant (500K TPD free) instead of 70b (100K TPD)
 * so the scraper's token budget is not shared with search.
 */
async function callSearchLlm(systemPrompt: string, userQuery: string): Promise<string> {
  const providers = [
    ENV.groqApiKey && {
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.1-8b-instant",
      key: ENV.groqApiKey,
    },
    ENV.minimaxApiKey && {
      name: "MiniMax",
      url: "https://api.minimaxi.chat/v1/chat/completions",
      model: "MiniMax-Text-01",
      key: ENV.minimaxApiKey,
    },
    ENV.geminiApiKey && {
      name: "Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      model: "gemini-2.0-flash",
      key: ENV.geminiApiKey,
    },
  ].filter(Boolean) as { name: string; url: string; model: string; key: string }[];

  if (providers.length === 0) {
    throw new Error(
      "Nenhuma chave de IA configurada. Adicione GROQ_API_KEY nas variáveis do Render (console.groq.com — gratuito)."
    );
  }

  for (const provider of providers) {
    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.status === 429) {
        const body = await res.text();
        console.warn(`[AISearch] ${provider.name} rate limited: ${body.substring(0, 200)}`);
        continue; // try next provider
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`[${provider.name}] ${res.status}: ${text.substring(0, 300)}`);
      }

      const data = (await res.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new Error(`[${provider.name}] Resposta vazia`);
      }
      return content;
    } catch (err: any) {
      if (err.message?.includes("rate limit") || err.message?.includes("429")) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    "Limite de tokens diários atingido em todos os provedores de IA. Tente novamente mais tarde ou adicione MINIMAX_API_KEY / GEMINI_API_KEY como backup."
  );
}

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

// Type abbreviations to save tokens
const TYPE_SHORT: Record<string, string> = {
  Scholarship: "Sch", Fellowship: "Fel", Accelerator: "Acc",
  Incubator: "Inc", Competition: "Comp", Internship: "Int",
  Grant: "Grant", Conference: "Conf", "Exchange Program": "Exch",
};
const STAGE_SHORT: Record<string, string> = {
  "High school": "HS", Undergraduate: "UG", Graduate: "Grad",
  "Startup idea": "Idea", MVP: "MVP", Revenue: "Rev", Scale: "Scale", "Multi-stage": "Multi",
};

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
      const type = TYPE_SHORT[opp.opportunityType] ?? opp.opportunityType;
      const stage = STAGE_SHORT[opp.stage] ?? opp.stage;
      const reg = regions.slice(0, 2).join("/");
      const fld = fields.slice(0, 2).join("/");
      return `${opp.id}:${opp.title}|${type}|${stage}|${reg}|${fld}`;
    })
    .join("\n");
}

/**
 * Keyword pre-filter: scores each opportunity against query words.
 * Returns up to maxResults relevant candidates. If too few keyword
 * matches, falls back to a random sample so the LLM always has options.
 */
function preFilter(query: string, opps: any[], maxResults = 150): any[] {
  const stopWords = new Set(["de", "do", "da", "para", "em", "com", "uma", "um", "que", "ou", "e", "the", "for", "in", "a", "an", "of"]);
  const words = query
    .toLowerCase()
    .split(/[\s,;.!?]+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (words.length === 0) return opps.slice(0, maxResults);

  const scored = opps.map((opp) => {
    const regions = typeof opp.regions === "string" ? JSON.parse(opp.regions) : (opp.regions ?? []);
    const fields = typeof opp.fields === "string" ? JSON.parse(opp.fields) : (opp.fields ?? []);
    const haystack = [
      opp.title,
      opp.organizer,
      opp.description ?? "",
      opp.opportunityType,
      opp.stage,
      opp.funding,
      opp.mode,
      ...regions,
      ...fields,
    ].join(" ").toLowerCase();

    const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
    return { opp, score };
  });

  const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  if (matched.length >= 10) {
    return matched.slice(0, maxResults).map((s) => s.opp);
  }

  // Few keyword hits — return top matches + broader sample to not miss semantic matches
  const matchedOpps = matched.map((s) => s.opp);
  const matchedIds = new Set(matchedOpps.map((o) => o.id));
  const others = opps.filter((o) => !matchedIds.has(o.id));
  // Shuffle others and take enough to fill up to maxResults
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, maxResults - matchedOpps.length);
  return [...matchedOpps, ...shuffled];
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

  const candidates = preFilter(query, allOpps, 150);
  const oppList = buildOpportunityList(candidates);

  const systemPrompt = `You are NATTA's AI assistant for finding opportunities (scholarships, fellowships, accelerators, competitions, grants, internships).

DB (format ID:Title|Type|Stage|Regions|Fields):
${oppList}

Return ONLY valid JSON:
{"matches":[{"id":<number>,"reason":"<1-2 sentences in user's language>"}...],"summary":"<2-3 sentences in user's language>"}

Rules: max 8 matches ranked by relevance; respond in user's language; only use IDs from the list; empty matches if nothing fits.`;

  let raw: string;
  try {
    raw = await callSearchLlm(systemPrompt, query);
  } catch (err: any) {
    throw new Error(`Erro ao chamar a IA: ${err?.message ?? String(err)}`);
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
