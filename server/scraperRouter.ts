import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { scrapeAllWebsites, deduplicateOpportunities, type ScrapedOpportunity } from "./scraper/opportunityScraper";
import { getDb } from "./db";
import { opportunities } from "../drizzle/schema";

/**
 * Admin-only procedure that checks if user is admin
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Only admins can access this endpoint'
    });
  }
  return next({ ctx });
});

/**
 * Scraper-only procedure that checks if user is the authorized scraper admin
 */
const scraperAdminProcedure = adminProcedure.use(({ ctx, next }) => {
  const authorizedEmail = 'alvaresgiulia@gmail.com';
  
  if (ctx.user.email !== authorizedEmail) {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: `Only ${authorizedEmail} can activate the scraper`
    });
  }
  return next({ ctx });
});

// In-memory storage for scraped opportunities pending review
const pendingOpportunities: Map<string, ScrapedOpportunity> = new Map();

export const scraperRouter = router({
  /**
   * Start scraping process (restricted to specific email)
   */
  startScraping: scraperAdminProcedure
    .mutation(async () => {
      try {
        console.log("Starting scraping process...");
        const scraped = await scrapeAllWebsites();
        const unique = deduplicateOpportunities(scraped);

        // Store in pending review
        unique.forEach(opp => {
          const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
          pendingOpportunities.set(id, opp);
        });

        return {
          success: true,
          count: unique.length,
          message: `Successfully scraped ${unique.length} unique opportunities. Review them in the admin panel.`,
        };
      } catch (error) {
        console.error("Scraping failed:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to scrape opportunities',
        });
      }
    }),

  /**
   * Get pending opportunities for review (admin only)
   */
  getPending: adminProcedure
    .query(async () => {
      const pending = Array.from(pendingOpportunities.entries()).map(([id, opp]) => ({
        id,
        ...opp,
      }));
      return pending;
    }),

  /**
   * Approve and add opportunity to database (admin only)
   */
  approve: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const opportunity = pendingOpportunities.get(input.id);
      
      if (!opportunity) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Opportunity not found in pending list',
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      try {
        // Insert into database
        await db.insert(opportunities).values({
          title: opportunity.title,
          description: opportunity.description,
          organizer: opportunity.organizer,
          deadline: opportunity.deadline,
          opportunityType: opportunity.opportunityType,
          stage: opportunity.stage,
          regions: opportunity.regions,
          mode: opportunity.mode,
          fields: opportunity.fields,
          funding: opportunity.funding,
          fee: 'No-fee',
          requirements: opportunity.requirements,
          benefits: opportunity.benefits,
          programStartDate: opportunity.programStartDate,
          programEndDate: opportunity.programEndDate,
          fundingAmount: opportunity.fundingAmount,
          applicationLink: opportunity.applicationLink || opportunity.url,
          isFeatured: false,
        }).execute();

        // Remove from pending
        pendingOpportunities.delete(input.id);

        return {
          success: true,
          message: 'Opportunity approved and added to database',
        };
      } catch (error) {
        console.error("Failed to approve opportunity:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add opportunity to database',
        });
      }
    }),

  /**
   * Reject and remove opportunity from pending (admin only)
   */
  reject: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const existed = pendingOpportunities.delete(input.id);
      
      if (!existed) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Opportunity not found in pending list',
        });
      }

      return {
        success: true,
        message: 'Opportunity rejected',
      };
    }),

  /**
   * Approve all pending opportunities at once (admin only)
   */
  approveAll: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      let approved = 0;
      const errors: string[] = [];

      for (const [id, opportunity] of Array.from(pendingOpportunities.entries())) {
        try {
          await db.insert(opportunities).values({
            title: opportunity.title,
            description: opportunity.description,
            organizer: opportunity.organizer,
            deadline: opportunity.deadline,
            opportunityType: opportunity.opportunityType,
            stage: opportunity.stage,
            regions: opportunity.regions,
            mode: opportunity.mode,
            fields: opportunity.fields,
            funding: opportunity.funding,
            requirements: opportunity.requirements,
            benefits: opportunity.benefits,
            programStartDate: opportunity.programStartDate,
            programEndDate: opportunity.programEndDate,
            fundingAmount: opportunity.fundingAmount,
            applicationLink: opportunity.applicationLink || opportunity.url,
            isFeatured: false,
          }).execute();

          pendingOpportunities.delete(id);
          approved++;
        } catch (error) {
          errors.push(`Failed to approve ${opportunity.title}: ${error}`);
        }
      }

      return {
        success: true,
        approved,
        errors: errors.length > 0 ? errors : undefined,
        message: `Approved ${approved} opportunities${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      };
    }),

  /**
   * Clear all pending opportunities (admin only)
   */
  clearPending: adminProcedure
    .mutation(async () => {
      const count = pendingOpportunities.size;
      pendingOpportunities.clear();
      
      return {
        success: true,
        message: `Cleared ${count} pending opportunities`,
      };
    }),

  /**
   * Create opportunity manually (admin only)
   */
  createManual: adminProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      organizer: z.string().min(1, "Organizer is required"),
      deadline: z.date().nullable(),
      opportunityType: z.enum(['Scholarship', 'Fellowship', 'Accelerator', 'Incubator', 'Competition', 'Internship', 'Grant', 'Conference', 'Exchange Program']),
      stage: z.enum(['High school', 'Undergraduate', 'Graduate', 'Startup idea', 'MVP', 'Revenue', 'Scale', 'Multi-stage']),
      regions: z.array(z.string()).min(1, "At least one region is required"),
      mode: z.enum(['Online', 'In-person', 'Hybrid']),
      fields: z.array(z.string()).min(1, "At least one field is required"),
      funding: z.enum(['Fully funded', 'Partial', 'Stipend', 'Equity-based', 'Not certain']),
      fee: z.enum(['No-fee', 'Paid']).default('No-fee'),
      requirements: z.string().optional(),
      benefits: z.string().optional(),
      programStartDate: z.date().optional(),
      programEndDate: z.date().optional(),
      fundingAmount: z.string().optional(),
      applicationLink: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      try {
        await db.insert(opportunities).values({
          title: input.title,
          description: input.description,
          organizer: input.organizer,
          deadline: input.deadline,
          opportunityType: input.opportunityType,
          stage: input.stage,
          regions: input.regions,
          mode: input.mode,
          fields: input.fields,
          funding: input.funding,
          fee: input.fee,
          requirements: input.requirements,
          benefits: input.benefits,
          programStartDate: input.programStartDate,
          programEndDate: input.programEndDate,
          fundingAmount: input.fundingAmount,
          applicationLink: input.applicationLink,
          isFeatured: false,
        }).execute();

        return {
          success: true,
          message: 'Opportunity created successfully',
        };
      } catch (error) {
        console.error("Failed to create opportunity:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create opportunity',
        });
      }
    }),
});

