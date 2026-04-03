import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { opportunities, applications, savedOpportunities } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("opportunities.delete", () => {
  let testOpportunityId: number;

  beforeAll(async () => {
    // Insert a test opportunity
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [inserted] = await db.insert(opportunities).values({
      title: "Test Opportunity for Deletion",
      organizer: "Test Organizer",
      opportunityType: "Scholarship",
      stage: "Undergraduate",
      regions: JSON.stringify(["Global"]),
      mode: "Online",
      fields: JSON.stringify(["Tech"]),
      funding: "Fully funded",
      deadline: new Date("2026-12-31"),
      description: "Test opportunity to be deleted",
      requirements: "Test requirements",
      applicationLink: "https://example.com/test",
    }).execute();

    testOpportunityId = inserted.insertId;
  });

  it("should reject deletion for non-admin users", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: "user123",
        email: "regular@example.com",
        name: "Regular User",
        role: "user",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.opportunities.delete(testOpportunityId)
    ).rejects.toThrow("Unauthorized");
  });

  it("should reject deletion for admin with wrong email", async () => {
    const caller = appRouter.createCaller({
      user: {
        id: "admin123",
        email: "otheradmin@example.com",
        name: "Other Admin",
        role: "admin",
      },
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.opportunities.delete(testOpportunityId)
    ).rejects.toThrow("Unauthorized");
  });

  it("should allow deletion for authorized admin", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create related records to test cascade deletion
    const userId = 1; // Use integer userId to match schema
    
    // Add a saved opportunity
    await db.insert(savedOpportunities).values({
      userId,
      opportunityId: testOpportunityId,
    }).execute();

    // Add an application
    await db.insert(applications).values({
      userId,
      opportunityId: testOpportunityId,
      opportunityTitle: "Test Opportunity for Deletion",
      organizer: "Test Organizer",
      deadline: new Date("2026-12-31"),
      status: "Applied",
      notes: "Test notes",
    }).execute();

    const caller = appRouter.createCaller({
      user: {
        id: userId,
        email: "alvaresgiulia@gmail.com",
        name: "Authorized Admin",
        role: "admin",
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.opportunities.delete(testOpportunityId);
    expect(result).toEqual({ success: true });

    // Verify opportunity was deleted
    const deletedOpp = await db.select().from(opportunities)
      .where(eq(opportunities.id, testOpportunityId))
      .execute();
    expect(deletedOpp).toHaveLength(0);

    // Verify related saved opportunities were deleted
    const deletedSaved = await db.select().from(savedOpportunities)
      .where(eq(savedOpportunities.opportunityId, testOpportunityId))
      .execute();
    expect(deletedSaved).toHaveLength(0);

    // Verify related applications were deleted
    const deletedApps = await db.select().from(applications)
      .where(eq(applications.opportunityId, testOpportunityId))
      .execute();
    expect(deletedApps).toHaveLength(0);
  });
});
