import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {} as any,
  };
}

describe("opportunities", () => {
  it("should list all opportunities without filters", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("deadline");
  });

  it("should filter opportunities by type", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      type: "Scholarship",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.opportunityType).toBe("Scholarship");
    });
  });

  it("should filter opportunities by stage", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      stage: "Undergraduate",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.stage).toBe("Undergraduate");
    });
  });

  it("should filter opportunities by region", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      region: "Brazil",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.regions).toContain("Brazil");
    });
  });

  it("should filter opportunities by mode", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      mode: "Online",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.mode).toBe("Online");
    });
  });

  it("should filter opportunities by field", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      field: "Tech",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.fields).toContain("Tech");
    });
  });

  it("should filter opportunities by funding", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      funding: "Fully funded",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.funding).toBe("Fully funded");
    });
  });

  it("should search opportunities by text", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      search: "Google",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      const matchesTitle = opp.title.toLowerCase().includes("google");
      const matchesOrganizer = opp.organizer.toLowerCase().includes("google");
      const matchesDescription = opp.description.toLowerCase().includes("google");
      expect(matchesTitle || matchesOrganizer || matchesDescription).toBe(true);
    });
  });

  it("should combine multiple filters", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      type: "Scholarship",
      stage: "Undergraduate",
      mode: "Online",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((opp: any) => {
      expect(opp.opportunityType).toBe("Scholarship");
      expect(opp.stage).toBe("Undergraduate");
      expect(opp.mode).toBe("Online");
    });
  });

  it("should return empty array when no matches found", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.opportunities.list({
      search: "XYZ_NONEXISTENT_OPPORTUNITY_12345",
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
