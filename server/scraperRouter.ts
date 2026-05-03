import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { scrapeAllWebsites, deduplicateOpportunities } from "./scraper/opportunityScraper";
import { getDb } from "./db";
import { opportunities, pendingOpportunities } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { eq, and, ilike } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can access this endpoint" });
  }
  return next({ ctx });
});

const scraperAdminProcedure = adminProcedure.use(({ ctx, next }) => {
  if (ctx.user.email !== ENV.adminEmail) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the main admin can activate the scraper" });
  }
  return next({ ctx });
});

/** Accepts ISO strings, Date (superjson), or null (e.g. rolling deadline) → DB column or undefined */
const optionalDbDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v): Date | undefined => {
    if (v === null || v === undefined || v === "") return undefined;
    const d = v instanceof Date ? v : new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  });

function pickDate(
  primary: Date | string | null | undefined,
  fallback: Date | string | null | undefined
): Date | undefined {
  if (primary instanceof Date && !Number.isNaN(primary.getTime())) return primary;
  if (typeof primary === "string" && primary.trim() !== "") {
    const d = new Date(primary);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (fallback instanceof Date && !Number.isNaN(fallback.getTime())) return fallback;
  if (typeof fallback === "string" && fallback.trim() !== "") {
    const d = new Date(fallback);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return undefined;
}

const opportunityUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  organizer: z.string().min(1),
  deadline: optionalDbDate,
  opportunityType: z.enum(["Scholarship", "Fellowship", "Accelerator", "Incubator", "Competition", "Internship", "Grant", "Conference", "Exchange Program"]),
  stage: z.enum(["High school", "Undergraduate", "Graduate", "Startup idea", "MVP", "Revenue", "Scale", "Multi-stage"]),
  regions: z.array(z.string()).min(1),
  mode: z.enum(["Online", "In-person", "Hybrid"]),
  fields: z.array(z.string()).min(1),
  funding: z.enum(["Fully funded", "Partial", "Stipend", "Equity-based", "Not certain"]),
  fee: z.enum(["No-fee", "Paid"]).default("No-fee"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  programStartDate: optionalDbDate,
  programEndDate: optionalDbDate,
  fundingAmount: z.string().optional(),
  applicationLink: z.string().optional(),
});

export const scraperRouter = router({
  startScraping: scraperAdminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    try {
      console.log("[Scraper] Starting scraping process...");
      const scraped = await scrapeAllWebsites();
      const unique = deduplicateOpportunities(scraped);

      // Filter out duplicates already in the main opportunities table
      const existing = await db.select({ title: opportunities.title, organizer: opportunities.organizer }).from(opportunities).execute();
      const existingKeys = new Set(existing.map((o) => `${o.title.toLowerCase()}|${o.organizer.toLowerCase()}`));

      // Also filter out items already pending
      const alreadyPending = await db
        .select({ title: pendingOpportunities.title, organizer: pendingOpportunities.organizer })
        .from(pendingOpportunities)
        .where(eq(pendingOpportunities.status, "pending"))
        .execute();
      const pendingKeys = new Set(alreadyPending.map((o) => `${o.title.toLowerCase()}|${o.organizer.toLowerCase()}`));

      let inserted = 0;
      let skipped = 0;

      for (const opp of unique) {
        const key = `${opp.title.toLowerCase()}|${opp.organizer.toLowerCase()}`;
        if (existingKeys.has(key) || pendingKeys.has(key)) {
          skipped++;
          continue;
        }

        await db.insert(pendingOpportunities).values({
          url: opp.url,
          title: opp.title,
          description: opp.description,
          organizer: opp.organizer,
          deadline: opp.deadline instanceof Date ? opp.deadline : opp.deadline ? new Date(opp.deadline) : undefined,
          opportunityType: opp.opportunityType,
          stage: opp.stage,
          regions: opp.regions,
          mode: opp.mode,
          fields: opp.fields,
          funding: opp.funding,
          fee: (opp as any).fee ?? "No-fee",
          requirements: opp.requirements,
          benefits: opp.benefits,
          programStartDate: opp.programStartDate instanceof Date ? opp.programStartDate : opp.programStartDate ? new Date(opp.programStartDate) : undefined,
          programEndDate: opp.programEndDate instanceof Date ? opp.programEndDate : opp.programEndDate ? new Date(opp.programEndDate) : undefined,
          fundingAmount: opp.fundingAmount,
          applicationLink: opp.applicationLink ?? opp.url,
          confidence: String(opp.confidence),
          status: "pending",
        }).execute();
        inserted++;
      }

      console.log(`[Scraper] Done. Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
      return {
        success: true,
        count: inserted,
        skipped,
        message: `${inserted} oportunidades novas encontradas para revisão${skipped > 0 ? ` (${skipped} duplicatas ignoradas)` : ""}.`,
      };
    } catch (error) {
      console.error("[Scraper] Failed:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao executar o scraping" });
    }
  }),

  getPending: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(pendingOpportunities)
      .where(eq(pendingOpportunities.status, "pending"))
      .execute();
  }),

  approve: adminProcedure
    .input(z.object({ id: z.number(), edits: opportunityUpdateSchema.optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [pending] = await db
        .select()
        .from(pendingOpportunities)
        .where(eq(pendingOpportunities.id, input.id))
        .limit(1)
        .execute();

      if (!pending) throw new TRPCError({ code: "NOT_FOUND", message: "Oportunidade pendente não encontrada" });

      const data = input.edits ?? pending;

      await db.insert(opportunities).values({
        title: data.title,
        description: data.description ?? pending.description ?? undefined,
        organizer: data.organizer,
        deadline: pickDate(data.deadline, pending.deadline),
        opportunityType: data.opportunityType,
        stage: data.stage,
        regions: data.regions,
        mode: data.mode,
        fields: data.fields,
        funding: data.funding,
        fee: data.fee ?? "No-fee",
        requirements: data.requirements ?? pending.requirements ?? undefined,
        benefits: data.benefits ?? pending.benefits ?? undefined,
        programStartDate: pickDate(data.programStartDate, pending.programStartDate),
        programEndDate: pickDate(data.programEndDate, pending.programEndDate),
        fundingAmount: data.fundingAmount ?? pending.fundingAmount ?? undefined,
        applicationLink: data.applicationLink ?? pending.applicationLink ?? undefined,
        isFeatured: false,
      }).execute();

      await db.update(pendingOpportunities).set({ status: "approved" }).where(eq(pendingOpportunities.id, input.id)).execute();

      return { success: true, message: "Oportunidade aprovada e adicionada ao banco" };
    }),

  reject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const result = await db
        .update(pendingOpportunities)
        .set({ status: "rejected" })
        .where(eq(pendingOpportunities.id, input.id))
        .execute();

      return { success: true, message: "Oportunidade rejeitada" };
    }),

  approveAll: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const pending = await db
      .select()
      .from(pendingOpportunities)
      .where(eq(pendingOpportunities.status, "pending"))
      .execute();

    let approved = 0;
    const errors: string[] = [];

    for (const opp of pending) {
      try {
        await db.insert(opportunities).values({
          title: opp.title,
          description: opp.description ?? undefined,
          organizer: opp.organizer,
          deadline: opp.deadline ?? undefined,
          opportunityType: opp.opportunityType,
          stage: opp.stage,
          regions: opp.regions,
          mode: opp.mode,
          fields: opp.fields,
          funding: opp.funding,
          fee: opp.fee,
          requirements: opp.requirements ?? undefined,
          benefits: opp.benefits ?? undefined,
          programStartDate: opp.programStartDate ?? undefined,
          programEndDate: opp.programEndDate ?? undefined,
          fundingAmount: opp.fundingAmount ?? undefined,
          applicationLink: opp.applicationLink ?? undefined,
          isFeatured: false,
        }).execute();

        await db.update(pendingOpportunities).set({ status: "approved" }).where(eq(pendingOpportunities.id, opp.id)).execute();
        approved++;
      } catch (error) {
        errors.push(`Falha em "${opp.title}": ${error}`);
      }
    }

    return {
      success: true,
      approved,
      errors: errors.length > 0 ? errors : undefined,
      message: `${approved} oportunidades aprovadas${errors.length > 0 ? ` (${errors.length} erros)` : ""}`,
    };
  }),

  clearPending: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    await db
      .update(pendingOpportunities)
      .set({ status: "rejected" })
      .where(eq(pendingOpportunities.status, "pending"))
      .execute();

    return { success: true, message: "Todas as pendências foram descartadas" };
  }),

  update: adminProcedure
    .input(z.object({ id: z.number(), data: opportunityUpdateSchema }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(pendingOpportunities)
        .set({
          title: input.data.title,
          description: input.data.description,
          organizer: input.data.organizer,
          deadline: input.data.deadline,
          opportunityType: input.data.opportunityType,
          stage: input.data.stage,
          regions: input.data.regions,
          mode: input.data.mode,
          fields: input.data.fields,
          funding: input.data.funding,
          fee: input.data.fee,
          requirements: input.data.requirements,
          benefits: input.data.benefits,
          programStartDate: input.data.programStartDate,
          programEndDate: input.data.programEndDate,
          fundingAmount: input.data.fundingAmount,
          applicationLink: input.data.applicationLink,
        })
        .where(eq(pendingOpportunities.id, input.id))
        .execute();

      return { success: true, message: "Oportunidade atualizada" };
    }),

  createManual: adminProcedure
    .input(opportunityUpdateSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

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

      return { success: true, message: "Oportunidade criada com sucesso" };
    }),
});
