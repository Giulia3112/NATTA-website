/**
 * Curated list of opportunity sources.
 *
 * fetchStrategy:
 *   "http"      — simple HTTP fetch (fast, free, most sites)
 *   "firecrawl" — Firecrawl for JS-rendered pages (costs 1 credit/page)
 *
 * maxLinks: max individual opportunity pages to process per run.
 * priority: lower = processed first (1 is highest priority).
 */

export interface OpportunitySource {
  name: string;
  baseUrl: string;
  listingPath: string;
  fetchStrategy: "http" | "firecrawl";
  maxLinks: number;
  priority: number;
  locale: "global" | "brazil" | "africa" | "latam";
}

export const SOURCES: OpportunitySource[] = [
  // ─── High-volume global portals ───────────────────────────────────────────
  {
    name: "OpportunityDesk",
    baseUrl: "https://opportunitydesk.org",
    listingPath: "/",
    fetchStrategy: "http",
    maxLinks: 8,
    priority: 1,
    locale: "global",
  },
  {
    name: "Opportunities For Africans",
    baseUrl: "https://opportunitiesforafricans.com",
    listingPath: "/",
    fetchStrategy: "http",
    maxLinks: 8,
    priority: 1,
    locale: "africa",
  },
  {
    name: "Scholarship Positions",
    baseUrl: "https://scholarship-positions.com",
    listingPath: "/scholarships/",
    fetchStrategy: "http",
    maxLinks: 6,
    priority: 1,
    locale: "global",
  },
  {
    name: "FindAMasters Funding",
    baseUrl: "https://www.findamasters.com",
    listingPath: "/funding/",
    fetchStrategy: "http",
    maxLinks: 6,
    priority: 2,
    locale: "global",
  },
  {
    name: "Opportunities Corners",
    baseUrl: "https://opportunitiescorners.com",
    listingPath: "/",
    fetchStrategy: "http",
    maxLinks: 6,
    priority: 2,
    locale: "global",
  },
  {
    name: "Opportunity Tracker",
    baseUrl: "https://opportunitytracker.ug",
    listingPath: "/",
    fetchStrategy: "http",
    maxLinks: 5,
    priority: 3,
    locale: "africa",
  },
  {
    name: "Opportunities Plus",
    baseUrl: "https://www.opportunitiesplus.com",
    listingPath: "/opportunities/",
    fetchStrategy: "http",
    maxLinks: 5,
    priority: 3,
    locale: "global",
  },

  // ─── Brazilian / Latin American sources ──────────────────────────────────
  {
    name: "Partiu Intercâmbio",
    baseUrl: "https://partiuintercambio.org",
    listingPath: "/bolsas-de-estudo/",
    fetchStrategy: "http",
    maxLinks: 6,
    priority: 1,
    locale: "brazil",
  },
  {
    name: "Fulbright Brasil",
    baseUrl: "https://fulbright.org.br",
    listingPath: "/bolsas-para-brasileiros/",
    fetchStrategy: "http",
    maxLinks: 5,
    priority: 1,
    locale: "brazil",
  },
  {
    name: "CAPES Bolsas",
    baseUrl: "https://www.gov.br",
    listingPath: "/capes/pt-br/servicos-e-produtos/bolsas-e-auxilios",
    fetchStrategy: "http",
    maxLinks: 4,
    priority: 2,
    locale: "brazil",
  },
  {
    name: "Sebrae Startups",
    baseUrl: "https://programas.sebraestartups.com.br",
    listingPath: "/",
    fetchStrategy: "firecrawl",
    maxLinks: 5,
    priority: 2,
    locale: "brazil",
  },

  // ─── Startup & entrepreneurship ecosystems ───────────────────────────────
  {
    name: "F6S Programs",
    baseUrl: "https://www.f6s.com",
    listingPath: "/programs",
    fetchStrategy: "firecrawl",
    maxLinks: 8,
    priority: 1,
    locale: "global",
  },
  {
    name: "Station F",
    baseUrl: "https://stationf.co",
    listingPath: "/programs/all",
    fetchStrategy: "firecrawl",
    maxLinks: 6,
    priority: 2,
    locale: "global",
  },
  {
    name: "YCombinator Blog",
    baseUrl: "https://www.ycombinator.com",
    listingPath: "/blog",
    fetchStrategy: "http",
    maxLinks: 4,
    priority: 2,
    locale: "global",
  },
  {
    name: "Techstars Programs",
    baseUrl: "https://www.techstars.com",
    listingPath: "/accelerators",
    fetchStrategy: "firecrawl",
    maxLinks: 5,
    priority: 2,
    locale: "global",
  },

  // ─── Competitions & grants ────────────────────────────────────────────────
  {
    name: "UN Youth Programs",
    baseUrl: "https://www.un.org",
    listingPath: "/youth/",
    fetchStrategy: "http",
    maxLinks: 4,
    priority: 3,
    locale: "global",
  },
  {
    name: "Gates Foundation Grants",
    baseUrl: "https://www.gatesfoundation.org",
    listingPath: "/about/committed-grants",
    fetchStrategy: "http",
    maxLinks: 4,
    priority: 3,
    locale: "global",
  },
  {
    name: "Endeavor Brasil",
    baseUrl: "https://endeavor.org.br",
    listingPath: "/programas/",
    fetchStrategy: "http",
    maxLinks: 4,
    priority: 2,
    locale: "brazil",
  },
];

/** Return sources sorted by priority (lower number = higher priority) */
export function getSortedSources(): OpportunitySource[] {
  return [...SOURCES].sort((a, b) => a.priority - b.priority);
}
