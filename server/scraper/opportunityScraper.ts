import { invokeLLM } from "../_core/llm";
import type { InsertOpportunity } from "../../drizzle/schema";

/**
 * AI-Powered Opportunity Scraper
 * 
 * This module scrapes trustworthy opportunity websites and uses LLM to extract
 * structured data from unstructured web pages.
 */

export interface ScrapedOpportunity {
  url: string;
  title: string;
  description?: string;
  organizer: string;
  deadline: Date;
  opportunityType: "Scholarship" | "Fellowship" | "Accelerator" | "Incubator" | "Competition" | "Internship" | "Grant" | "Conference" | "Exchange Program";
  stage: "High school" | "Undergraduate" | "Graduate" | "Startup idea" | "MVP" | "Revenue" | "Scale" | "Multi-stage";
  regions: string[];
  mode: "Online" | "In-person" | "Hybrid";
  fields: string[];
  funding: "Fully funded" | "Partial" | "Stipend" | "Equity-based" | "Not certain";
  requirements?: string;
  benefits?: string;
  programStartDate?: Date;
  programEndDate?: Date;
  fundingAmount?: string;
  applicationLink?: string;
  confidence: number; // 0-1 score of extraction confidence
}

/**
 * Target websites for scraping
 */
const TARGET_WEBSITES = [
  {
    name: "Scholarship Positions",
    baseUrl: "https://scholarship-positions.com",
    listingPath: "/scholarships/",
  },
  {
    name: "FindAMasters",
    baseUrl: "https://www.findamasters.com",
    listingPath: "/funding/",
  },
  {
    name: "Opportunities For All",
    baseUrl: "https://opportunitiesforall.com",
    listingPath: "/opportunities/",
  },
  {
    name: "OpportunityDesk",
    baseUrl: "https://opportunitydesk.org",
    listingPath: "/",
  },
  {
    name: "F6S Programs",
    baseUrl: "https://www.f6s.com",
    listingPath: "/programs",
  },
  {
    name: "Opportunities Corners",
    baseUrl: "https://opportunitiescorners.com",
    listingPath: "/",
  },
  {
    name: "Partiu Intercambio",
    baseUrl: "https://partiuintercambio.org",
    listingPath: "/bolsas-de-estudo/",
  },
  {
    name: "Opportunity Tracker Uganda",
    baseUrl: "https://opportunitytracker.ug",
    listingPath: "/",
  },
  {
    name: "Sebrae Startups",
    baseUrl: "https://programas.sebraestartups.com.br",
    listingPath: "/",
  },
  {
    name: "Station F",
    baseUrl: "https://stationf.co",
    listingPath: "/programs/all",
  },
  {
    name: "Fulbright Brazil",
    baseUrl: "https://fulbright.org.br",
    listingPath: "/bolsas-para-brasileiros/",
  },
  {
    name: "Opportunities Plus",
    baseUrl: "https://www.opportunitiesplus.com",
    listingPath: "/opportunities/",
  },
];

/**
 * Fetch HTML content from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

/**
 * Extract opportunity data using LLM
 */
async function extractOpportunityData(html: string, url: string): Promise<ScrapedOpportunity | null> {
  try {
    // Use LLM to extract structured data from HTML
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting structured opportunity data from web pages. 
Extract the following information from the HTML and return it as JSON:
- title (string, required)
- description (string, optional)
- organizer (string, required)
- deadline (ISO date string, required)
- opportunityType (one of: Scholarship, Fellowship, Accelerator, Incubator, Competition, Internship, Grant, Conference, Exchange Program)
- stage (one of: High school, Undergraduate, Graduate, Startup idea, MVP, Revenue, Scale, Multi-stage)
- regions (array of strings like "Global", "Africa", "Europe", "North America", etc.)
- mode (one of: Online, In-person, Hybrid)
- fields (array of strings from: Tech, Engineering, AI/ML, Blockchain, Data Science, Cybersecurity, Robotics, Physics, Chemistry, Biology, Mathematics, Astronomy, Geology, Environmental Science, Health, Medicine, Nursing, Public Health, Pharmacy, Biotechnology, Neuroscience, Psychology, Sociology, Anthropology, Economics, Political Science, Geography, Literature, History, Philosophy, Languages, Arts, Music, Theater, Business, Finance, Entrepreneurship, Marketing, Management, Agriculture, Architecture, Urban Planning, Design, Climate, Sustainability, Energy, Transportation, Social Impact, Policy, Education, Law)
- funding (one of: Fully funded, Partial, Stipend, Equity-based, Not certain)
- requirements (string, optional)
- benefits (string, optional)
- programStartDate (ISO date string, optional)
- programEndDate (ISO date string, optional)
- fundingAmount (string like "$10,000", optional)
- applicationLink (string URL, optional)
- confidence (number 0-1, how confident you are in the extraction)

If the page doesn't contain a valid opportunity, return null.`,
        },
        {
          role: "user",
          content: `Extract opportunity data from this HTML:\n\n${html.substring(0, 8000)}`, // Limit to 8k chars
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
              deadline: { type: "string" },
              opportunityType: { 
                type: "string",
                enum: ["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program"]
              },
              stage: {
                type: "string",
                enum: ["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage"]
              },
              regions: {
                type: "array",
                items: { type: "string" }
              },
              mode: {
                type: "string",
                enum: ["Online", "In-person", "Hybrid"]
              },
              fields: {
                type: "array",
                items: { type: "string" }
              },
              funding: {
                type: "string",
                enum: ["Fully funded", "Partial", "Stipend", "Equity-based", "Not certain"]
              },
              requirements: { type: "string" },
              benefits: { type: "string" },
              programStartDate: { type: "string" },
              programEndDate: { type: "string" },
              fundingAmount: { type: "string" },
              applicationLink: { type: "string" },
              confidence: { type: "number" },
            },
            required: ["title", "organizer", "deadline", "opportunityType", "stage", "regions", "mode", "fields", "funding", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;

    const data = JSON.parse(content);
    
    // Validate confidence threshold
    if (data.confidence < 0.6) {
      console.warn(`Low confidence (${data.confidence}) for ${url}, skipping`);
      return null;
    }

    return {
      ...data,
      url,
      deadline: new Date(data.deadline),
      programStartDate: data.programStartDate ? new Date(data.programStartDate) : undefined,
      programEndDate: data.programEndDate ? new Date(data.programEndDate) : undefined,
    };
  } catch (error) {
    console.error(`Failed to extract data from ${url}:`, error);
    return null;
  }
}

/**
 * Scrape opportunities from a single website
 */
export async function scrapeWebsite(websiteConfig: typeof TARGET_WEBSITES[0]): Promise<ScrapedOpportunity[]> {
  const opportunities: ScrapedOpportunity[] = [];
  
  try {
    console.log(`Scraping ${websiteConfig.name}...`);
    
    // Fetch listing page
    const listingUrl = `${websiteConfig.baseUrl}${websiteConfig.listingPath}`;
    const listingHTML = await fetchHTML(listingUrl);
    
    // Extract opportunity URLs using LLM
    const urlExtractionResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Extract all opportunity/scholarship/fellowship URLs from this HTML. Return as JSON array of strings.",
        },
        {
          role: "user",
          content: `Extract opportunity URLs from:\n\n${listingHTML.substring(0, 8000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "url_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              urls: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["urls"],
            additionalProperties: false,
          },
        },
      },
    });

    const urlContent = urlExtractionResponse.choices[0]?.message?.content;
    const urlData = JSON.parse(typeof urlContent === 'string' ? urlContent : '{"urls":[]}');
    const urls = urlData.urls.slice(0, 5); // Limit to 5 opportunities per website for now

    console.log(`Found ${urls.length} opportunity URLs on ${websiteConfig.name}`);

    // Scrape each opportunity page
    for (const url of urls) {
      try {
        const fullUrl = url.startsWith('http') ? url : `${websiteConfig.baseUrl}${url}`;
        const html = await fetchHTML(fullUrl);
        const opportunity = await extractOpportunityData(html, fullUrl);
        
        if (opportunity) {
          opportunities.push(opportunity);
          console.log(`✓ Extracted: ${opportunity.title}`);
        }
        
        // Rate limiting: wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
      }
    }
  } catch (error) {
    console.error(`Failed to scrape ${websiteConfig.name}:`, error);
  }

  return opportunities;
}

/**
 * Scrape all configured websites
 */
export async function scrapeAllWebsites(): Promise<ScrapedOpportunity[]> {
  const allOpportunities: ScrapedOpportunity[] = [];

  for (const website of TARGET_WEBSITES) {
    const opportunities = await scrapeWebsite(website);
    allOpportunities.push(...opportunities);
  }

  console.log(`Total opportunities scraped: ${allOpportunities.length}`);
  return allOpportunities;
}

/**
 * Deduplicate opportunities based on title and organizer
 */
export function deduplicateOpportunities(opportunities: ScrapedOpportunity[]): ScrapedOpportunity[] {
  const seen = new Set<string>();
  const unique: ScrapedOpportunity[] = [];

  for (const opp of opportunities) {
    const key = `${opp.title.toLowerCase()}-${opp.organizer.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(opp);
    }
  }

  return unique;
}
