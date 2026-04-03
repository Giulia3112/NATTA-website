import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    bio: null,
    interests: null,
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

  return { ctx };
}

describe("auth.updateProfile", () => {
  it("updates user bio and interests successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.updateProfile({
      bio: "I'm passionate about tech and social impact",
      interests: ["Tech", "Social Impact", "Climate"],
    });

    expect(result).toEqual({ success: true });
  });

  it("updates only bio when interests not provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.updateProfile({
      bio: "Updated bio only",
    });

    expect(result).toEqual({ success: true });
  });

  it("updates only interests when bio not provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.updateProfile({
      interests: ["Business", "Finance"],
    });

    expect(result).toEqual({ success: true });
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.updateProfile({
        bio: "This should fail",
      })
    ).rejects.toThrow();
  });
});
