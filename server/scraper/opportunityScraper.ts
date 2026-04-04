import { invokeLLM } from "../_core/llm";

/**
 * AI-Powered Opportunity Scraper
 *
 * Scrapes trustworthy opportunity websites in parallel and uses LLM to
 * extract structured data from the raw HTML pages.
 */

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

const TARGET_WEBSITES = [
  { name: "OpportunityDesk", baseUrl: "https://opportunitydesk.org", listingPath: "/" },
  { name: "Opportunities For All", baseUrl: "https://opportunitiesforall.com", listingPath: "/opportunities/" },
  { name: "Scholarship Positions", baseUrl: "https://scholarship-positions.com", listingPath: "/scholarships/" },
  { name: "Partiu Intercambio", baseUrl: "https://partiuintercambio.org", listingPath: "/bolsas-de-estudo/" },
  { name: "Fulbright Brazil", baseUrl: "https://fulbright.org.br", listingPath: "/bolsas-para-brasileiros/" },
  { name: "Sebrae Startups", baseUrl: "https://programas.sebraestartups.com.br", listingPath: "/" },
  { name: "F6S Programs", baseUrl: "https://www.f6s.com", listingPath: "/programs" },
  { name: "Station F", baseUrl: "https://stationf.co", listingPath: "/programs/all" },
  { name: "FindAMasters", baseUrl: "https://www.findamasters.com", listingPath: "/funding/" },
  { name: "Opportunities Corners", baseUrl: "https://opportunitiescorners.com", listingPath: "/" },
  { name: "Opportunities Plus", baseUrl: "https://www.opportunitiesplus.com", listingPath: "/opportunities/" },
  { name: "Opportunity Tracker", baseUrl: "https://opportunitytracker.ug", listingPath: "/" },
];

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.text();
}

async function extractOpportunityData(html: string, url: string): Promise<ScrapedOpportunity | null> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured opportunity data from web pages.
Extract the following information from the HTML and return it as JSON.
If the page doesn't contain a valid, specific opportunity, return null for confidence (< 0.6).

Fields:
- title (string, required)
- description (string, brief summary, optional)
- organizer (string, required)
- deadline (ISO date string or null if rolling/unknown)
- opportunityType: one of [Scholarship, Fellowship, Accelerator, Incubator, Competition, Internship, Grant, Conference, Exchange Program]
- stage: one of [High school, Undergraduate, Graduate, Startup idea, MVP, Revenue, Scale, Multi-stage]
- regions: array of strings e.g. ["Global", "Brazil", "Africa", "Europe", "Latin America", "North America", "Asia"]
- mode: one of [Online, In-person, Hybrid]
- fields: array from [Tech, Engineering, AI/ML, Data Science, Business, Finance, Entrepreneurship, Social Impact, Climate, Sustainability, Health, Medicine, Arts, Education, Law, Agriculture, Architecture, Sciences, Mathematics, Languages, Policy]
- funding: one of [Fully funded, Partial, Stipend, Equity-based, Not certain]
- fee: one of [No-fee, Paid] — whether there is an application fee
- requirements (string describing eligibility, optional)
- benefits (string describing what is offered, optional)
- programStartDate (ISO date string, optional)
- programEndDate (ISO date string, optional)
- fundingAmount (string like "$10,000" or "R$5.000", optional)
- applicationLink (URL string, optional)
- confidence (number 0-1)`,
        },
        {
          role: "user",
          content: `Extract opportunity data from this page (URL: ${url}):\n\n${html.substring(0, 10000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "opportunity_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              organizer: { type: "string" },
              deadline: { type: ["string", "null"] },
              opportunityType: { type: "string", enum: ["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program"] },
              stage: { type: "string", enum: ["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage"] },
              regions: { type: "array", items: { type: "string" } },
              mode: { type: "string", enum: ["Online", "In-person", "Hybrid"] },
              fields: { type: "array", items: { type: "string" } },
              funding: { type: "string", enum: ["Fully funded", "Partial", "Stipend", "Equity-based", "Not certain"] },
              fee: { type: "string", enum: ["No-fee", "Paid"] },
              requirements: { type: "string" },
              benefits: { type: "string" },
              programStartDate: { type: ["string", "null"] },
              programEndDate: { type: ["string", "null"] },
              fundingAmount: { type: "string" },
              applicationLink: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["title", "organizer", "opportunityType", "stage", "regions", "mode", "fields", "funding", "fee", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") return null;

    const data = JSON.parse(content);
    if (data.confidence < 0.6) {
      console.warn(`[Scraper] Low confidence (${data.confidence}) for ${url}`);
      return null;
    }

    return {
      ...data,
      url,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      programStartDate: data.programStartDate ? new Date(data.programStartDate) : undefined,
      programEndDate: data.programEndDate ? new Date(data.programEndDate) : undefined,
      fee: data.fee ?? "No-fee",
    };
  } catch (error) {
    console.error(`[Scraper] Failed to extract data from ${url}:`, error);
    return null;
  }
}

async function scrapeWebsite(site: typeof TARGET_WEBSITES[0]): Promise<ScrapedOpportunity[]> {
  const results: ScrapedOpportunity[] = [];
  try {
    console.log(`[Scraper] Fetching listing: ${site.name}`);
    const listingUrl = `${site.baseUrl}${site.listingPath}`;
    const listingHTML = await fetchHTML(listingUrl);

    const urlResponse = await invokeLLM({
      messages: [
        { role: "system", content: "Extract up to 5 individual opportunity page URLs from this HTML listing page. Return as JSON." },
        { role: "user", content: `Find opportunity URLs from ${site.baseUrl}:\n\n${listingHTML.substring(0, 8000)}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "url_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: { urls: { type: "array", items: { type: "string" } } },
            required: ["urls"],
            additionalProperties: false,
          },
        },
      },
    });

    const urlContent = urlResponse.choices[0]?.message?.content;
    const { urls = [] } = JSON.parse(typeof urlContent === "string" ? urlContent : '{"urls":[]}');
    const limitedUrls: string[] = (urls as string[]).slice(0, 5);

    console.log(`[Scraper] ${site.name}: found ${limitedUrls.length} URLs to scrape`);

    // Scrape each opportunity page in parallel (with a concurrency limit of 3)
    const chunks: string[][] = [];
    for (let i = 0; i < limitedUrls.length; i += 3) {
      chunks.push(limitedUrls.slice(i, i + 3));
    }

    for (const chunk of chunks) {
      const settled = await Promise.allSettled(
        chunk.map(async (url) => {
          const fullUrl = url.startsWith("http") ? url : `${site.baseUrl}${url}`;
          const html = await fetchHTML(fullUrl);
          return extractOpportunityData(html, fullUrl);
        })
      );

      for (const result of settled) {
        if (result.status === "fulfilled" && result.value) {
          results.push(result.value);
          console.log(`[Scraper] ✓ ${result.value.title}`);
        }
      }

      // Small delay between chunks to be polite to servers
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  } catch (error) {
    console.error(`[Scraper] Failed to scrape ${site.name}:`, error);
  }

  return results;
}

/**
 * Scrape all configured websites in parallel (site-level parallelism,
 * URL-level within each site is also parallel in chunks of 3).
 */
export async function scrapeAllWebsites(): Promise<ScrapedOpportunity[]> {
  console.log(`[Scraper] Starting parallel scrape of ${TARGET_WEBSITES.length} websites...`);

  const settled = await Promise.allSettled(TARGET_WEBSITES.map(scrapeWebsite));

  const all: ScrapedOpportunity[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled") {
      all.push(...result.value);
    }
  }

  console.log(`[Scraper] Total scraped: ${all.length} opportunities`);
  return all;
}

export function deduplicateOpportunities(opps: ScrapedOpportunity[]): ScrapedOpportunity[] {
  const seen = new Set<string>();
  const unique: ScrapedOpportunity[] = [];
  for (const opp of opps) {
    const key = `${opp.title.toLowerCase()}|${opp.organizer.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(opp);
    }
  }
  return unique;
}
