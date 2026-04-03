import { systemRouter } from "./_core/systemRouter";
import { scraperRouter } from "./scraperRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getOpportunities, 
  getOpportunityById, 
  getUserApplications, 
  getApplicationById, 
  getUserSavedOpportunities,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  saveOpportunity,
  unsaveOpportunity,
  isOpportunitySaved,
  deleteOpportunity
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
        return await getUserApplications(ctx.user.id);
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
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Only admins can send notifications');
        }
        
        const { notifyOwner } = await import("./_core/notification");
        const opportunity = await getOpportunityById(input.opportunityId);
        
        if (!opportunity) {
          throw new Error('Opportunity not found');
        }
        
        // Send notification to each user
        const results = await Promise.all(
          input.userIds.map(async (userId) => {
            const customMessage = input.message || 
              `New opportunity from AIpply Founder: ${opportunity.title}. Check it out on the platform!`;
            
            return await notifyOwner({
              title: `Early Access: ${opportunity.title}`,
              content: customMessage,
            });
          })
        );
        
        return {
          success: true,
          sentCount: results.filter(r => r).length,
          totalUsers: input.userIds.length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
