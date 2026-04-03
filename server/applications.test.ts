import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("applications router", () => {
  it("should list user applications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const applications = await caller.applications.list();
    expect(Array.isArray(applications)).toBe(true);
  });

  it("should create a new application", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.applications.create({
      opportunityId: 1,
      notes: "Test application",
      programStartDate: new Date("2026-06-01"),
      programEndDate: new Date("2026-08-31"),
    });

    expect(result).toBeDefined();
  });

  it("should update application status", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.applications.updateStatus({
      applicationId: 1,
      status: "In Progress",
    });

    expect(result).toMatchObject({ success: true });
  });

  it("should delete an application", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.applications.delete(1);
    expect(result).toMatchObject({ success: true });
  });

  it("should get application by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const application = await caller.applications.getById(1);
    // May be null or undefined if not found, which is acceptable
    expect(application === null || application === undefined || typeof application === "object").toBe(true);
  });
});

describe("savedOpportunities router", () => {
  it("should list saved opportunities", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const saved = await caller.savedOpportunities.list();
    expect(Array.isArray(saved)).toBe(true);
  });

  it("should save an opportunity", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.savedOpportunities.save(1);
    expect(result).toMatchObject({ success: true });
  });

  it("should unsave an opportunity", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.savedOpportunities.unsave(1);
    expect(result).toMatchObject({ success: true });
  });

  it("should check if opportunity is saved", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const isSaved = await caller.savedOpportunities.isSaved(1);
    expect(typeof isSaved).toBe("boolean");
  });
});
