/**
 * Automatic scraping scheduler — runs via node-cron without any manual trigger.
 *
 * Default schedule: every 6 hours  (configurable via SCRAPER_CRON env var)
 * To change the interval, set SCRAPER_CRON in .env, e.g.:
 *   "0 *\/6 * * *"   → every 6 hours  (default)
 *   "0 2 * * *"      → once a day at 2 AM
 *   "0 *\/12 * * *"  → every 12 hours
 *
 * The scheduler re-uses the same pipeline as the manual "Start Scraping" button,
 * including duplicate detection against the existing DB and pending tables.
 */

import cron from "node-cron";
import { scrapeAllWebsites, deduplicateOpportunities } from "./opportunityScraper";
import { getDb } from "../db";
import { opportunities, pendingOpportunities } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";

let isRunning = false;

async function runScrapingJob(): Promise<void> {
  if (isRunning) {
    console.log("[Scheduler] Scraping job already running, skipping this tick");
    return;
  }

  isRunning = true;
  console.log("[Scheduler] Auto-scrape job started at", new Date().toISOString());

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Scheduler] Database not available, aborting");
      return;
    }

    const scraped = await scrapeAllWebsites();
    const unique = deduplicateOpportunities(scraped);

    // Build sets of already-known titles+organizers for fast dedup
    const existing = await db
      .select({ title: opportunities.title, organizer: opportunities.organizer })
      .from(opportunities)
      .execute();
    const existingKeys = new Set(
      existing.map((o) => `${o.title.toLowerCase()}|${o.organizer.toLowerCase()}`)
    );

    const alreadyPending = await db
      .select({ title: pendingOpportunities.title, organizer: pendingOpportunities.organizer })
      .from(pendingOpportunities)
      .where(eq(pendingOpportunities.status, "pending"))
      .execute();
    const pendingKeys = new Set(
      alreadyPending.map((o) => `${o.title.toLowerCase()}|${o.organizer.toLowerCase()}`)
    );

    let inserted = 0;
    let skipped = 0;

    for (const opp of unique) {
      const key = `${opp.title.toLowerCase()}|${opp.organizer.toLowerCase()}`;
      if (existingKeys.has(key) || pendingKeys.has(key)) {
        skipped++;
        continue;
      }

      await db
        .insert(pendingOpportunities)
        .values({
          url: opp.url,
          title: opp.title,
          description: opp.description,
          organizer: opp.organizer,
          deadline: opp.deadline,
          opportunityType: opp.opportunityType,
          stage: opp.stage,
          regions: opp.regions,
          mode: opp.mode,
          fields: opp.fields,
          funding: opp.funding,
          fee: opp.fee ?? "No-fee",
          requirements: opp.requirements,
          benefits: opp.benefits,
          programStartDate: opp.programStartDate,
          programEndDate: opp.programEndDate,
          fundingAmount: opp.fundingAmount,
          applicationLink: opp.applicationLink ?? opp.url,
          confidence: String(opp.confidence),
          status: "pending",
        })
        .execute();
      inserted++;
    }

    console.log(
      `[Scheduler] Job complete — inserted: ${inserted}, skipped duplicates: ${skipped}`
    );
  } catch (err) {
    console.error("[Scheduler] Auto-scrape job failed:", err);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the cron scheduler. Call this once when the server boots.
 * No-op in test environments.
 */
export function startScheduler(): void {
  const cronExpression = ENV.scraperCron;

  if (!cron.validate(cronExpression)) {
    console.error(`[Scheduler] Invalid SCRAPER_CRON expression: "${cronExpression}". Scheduler not started.`);
    return;
  }

  cron.schedule(cronExpression, () => {
    runScrapingJob().catch((err) =>
      console.error("[Scheduler] Unhandled error in scraping job:", err)
    );
  });

  console.log(`[Scheduler] Auto-scrape scheduled (${cronExpression})`);
}

/** Expose manual trigger for the tRPC router */
export { runScrapingJob };
