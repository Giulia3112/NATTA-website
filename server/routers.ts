import { systemRouter } from "./_core/systemRouter";
import { scraperRouter } from "./scraperRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { aiSearchOpportunities } from "./aiSearch";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { sendOpportunityEmailToUser } from "./_core/email";
import { 
  getOpportunities, 
  getOpportunityById, 
  getUserApplications,
  getUserApplicationsWithDetails,
  getApplicationById, 
  getUserSavedOpportunities,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  saveOpportunity,
  unsaveOpportunity,
  isOpportunitySaved,
  deleteOpportunity,
  updateOpportunity,
  getUsersNotifyByIds,
} from "./db";
import { mockOpportunities } from "@shared/mockOpportunities";

export const appRouter = router({
  system: systemRouter,
  scraper: scraperRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        interests: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db.update(users)
          .set({
            bio: input.bio,
            interests: input.interests,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id))
          .execute();

        return { success: true };
      }),
    
    applicationStats: protectedProcedure
      .query(async ({ ctx }) => {
        const applications = await getUserApplications(ctx.user.id);
        
        const stats = {
          total: applications.length,
          applied: applications.filter(app => app.status === 'Applied').length,
          inProgress: applications.filter(app => app.status === 'In Progress').length,
          accepted: applications.filter(app => app.status === 'Accepted').length,
          rejected: applications.filter(app => app.status === 'Rejected').length,
        };
        
        return stats;
      }),
  }),

  // Opportunities router
  opportunities: router({
    list: publicProcedure
      .input(z.object({
        type: z.string().optional(),
        stage: z.string().optional(),
        region: z.string().optional(),
        mode: z.string().optional(),
        field: z.string().optional(),
        funding: z.string().optional(),
        deadlineBefore: z.date().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        // Fetch opportunities from database
        let opportunities = await getOpportunities();

        // If no opportunities in database, return mock data as fallback
        if (opportunities.length === 0) {
          opportunities = mockOpportunities as any[];
        }

        let filtered = [...opportunities];

        if (!input) return filtered;

        if (input.type && typeof input.type === 'string') {
          filtered = filtered.filter(opp => opp.opportunityType === input.type);
        }
        if (input.stage && typeof input.stage === 'string') {
          filtered = filtered.filter(opp => opp.stage === input.stage);
        }
        if (input.region && typeof input.region === 'string') {
          const regionValue = input.region;
          filtered = filtered.filter(opp => {
            const regions = typeof opp.regions === 'string' ? JSON.parse(opp.regions) : opp.regions;
            return regions.includes(regionValue);
          });
        }
        if (input.mode && typeof input.mode === 'string') {
          filtered = filtered.filter(opp => opp.mode === input.mode);
        }
        if (input.field && typeof input.field === 'string') {
          const fieldValue = input.field;
          filtered = filtered.filter(opp => {
            const fields = typeof opp.fields === 'string' ? JSON.parse(opp.fields) : opp.fields;
            return fields.includes(fieldValue);
          });
        }
        if (input.funding && typeof input.funding === 'string') {
          const fundingValue = input.funding;
          filtered = filtered.filter(opp => opp.funding === fundingValue);
        }
        if (input.deadlineBefore && input.deadlineBefore instanceof Date) {
          const deadlineValue = input.deadlineBefore;
          filtered = filtered.filter(opp => opp.deadline && new Date(opp.deadline) <= deadlineValue);
        }
        if (input.search && typeof input.search === 'string') {
          const searchLower = input.search.toLowerCase();
          filtered = filtered.filter(opp =>
            opp.title.toLowerCase().includes(searchLower) ||
            (opp.description?.toLowerCase().includes(searchLower) ?? false) ||
            opp.organizer.toLowerCase().includes(searchLower)
          );
        }

        return filtered;
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const opportunity = await getOpportunityById(input);
        // Fallback to mock data if not found in database
        if (!opportunity) {
          return mockOpportunities.find(opp => opp.id === input);
        }
        return opportunity;
      }),

    featured: publicProcedure
      .query(async () => {
        const dbOpps = await getOpportunities();
        const featured = dbOpps.filter(opp => opp.isFeatured);
        if (featured.length > 0) return featured;
        return mockOpportunities.filter(opp => opp.isFeatured);
      }),

    aiSearch: publicProcedure
      .input(z.object({ query: z.string().min(3).max(500) }))
      .mutation(async ({ input }) => {
        return await aiSearchOpportunities(input.query);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        organizer: z.string().optional(),
        deadline: z.date().nullable().optional(),
        opportunityType: z.string().optional(),
        stage: z.string().optional(),
        regions: z.array(z.string()).optional(),
        mode: z.string().optional(),
        fields: z.array(z.string()).optional(),
        funding: z.string().optional(),
        fee: z.string().optional(),
        requirements: z.string().nullable().optional(),
        benefits: z.string().nullable().optional(),
        programStartDate: z.date().nullable().optional(),
        programEndDate: z.date().nullable().optional(),
        fundingAmount: z.string().nullable().optional(),
        applicationLink: z.string().nullable().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can update opportunities');
        }
        const { id, ...data } = input;
        return await updateOpportunity(id, data);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can delete opportunities');
        }
        return await deleteOpportunity(input);
      }),
  }),

  // Applications router
  applications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserApplicationsWithDetails(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
        notes: z.string().optional(),
        programStartDate: z.date().optional(),
        programEndDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await createApplication({
          userId: ctx.user.id,
          opportunityId: input.opportunityId,
          notes: input.notes,
          programStartDate: input.programStartDate,
          programEndDate: input.programEndDate,
        });
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        status: z.enum(["Applied", "In Progress", "Accepted", "Rejected"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return await updateApplicationStatus(input.applicationId, input.status);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        return await deleteApplication(input);
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        return await getApplicationById(input);
      }),
  }),

  // Saved opportunities router
  savedOpportunities: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSavedOpportunities(ctx.user.id);
      }),

    save: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        return await saveOpportunity(ctx.user.id, input);
      }),

    unsave: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        return await unsaveOpportunity(ctx.user.id, input);
      }),

    isSaved: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        return await isOpportunitySaved(ctx.user.id, input);
      }),
  }),

  // Admin router
  admin: router({    
    listUsers: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can access user list');
        }
        
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { users } = await import("../drizzle/schema");
        
        const allUsers = await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          bio: users.bio,
          interests: users.interests,
          createdAt: users.createdAt,
        }).from(users).execute();
        
        return allUsers;
      }),
    
    sendNotification: protectedProcedure
      .input(z.object({
        userIds: z.array(z.number()),
        opportunityId: z.number(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can send notifications" });
        }

        if (!ENV.resendApiKey || !ENV.emailFrom) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Email is not configured. Add RESEND_API_KEY and EMAIL_FROM to the server environment (Render → Environment). Create an API key at https://resend.com",
          });
        }

        const opportunity = await getOpportunityById(input.opportunityId);
        if (!opportunity) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found" });
        }

        const uniqueUserIds = [...new Set(input.userIds)];
        const recipients = await getUsersNotifyByIds(uniqueUserIds);
        const byId = new Map(recipients.map((r) => [r.id, r]));

        const customMessage =
          input.message?.trim() ||
          `There is a new opportunity on NATTA that may interest you: "${opportunity.title}". Open the link below to read the details.`;

        const errors: string[] = [];
        let sentCount = 0;
        let skippedNoEmail = 0;

        for (const userId of uniqueUserIds) {
          const u = byId.get(userId);
          if (!u) {
            errors.push(`User id ${userId} not found`);
            continue;
          }
          const email = u.email?.trim();
          if (!email) {
            skippedNoEmail++;
            continue;
          }

          const result = await sendOpportunityEmailToUser({
            to: email,
            recipientName: u.name,
            opportunityTitle: opportunity.title,
            organizer: opportunity.organizer,
            message: customMessage,
            opportunityId: opportunity.id,
          });

          if (result.ok) {
            sentCount++;
          } else {
            errors.push(`${email}: ${result.error}`);
          }
        }

        if (sentCount === 0) {
          const detail =
            skippedNoEmail === uniqueUserIds.length
              ? "None of the selected users have an email address on file."
              : errors.join("; ") || "Unknown error";
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `No emails were sent. ${detail}`,
          });
        }

        return {
          success: true,
          sentCount,
          totalUsers: uniqueUserIds.length,
          skippedNoEmail,
          errors: errors.length ? errors : undefined,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
