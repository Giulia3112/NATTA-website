import { ForbiddenError } from "@shared/_core/errors";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifyFirebaseToken } from "./firebaseAdmin";

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

function mapProviderToLoginMethod(provider: string | undefined): string | null {
  if (!provider) return null;
  if (provider === "google.com") return "google";
  if (provider === "password") return "email";
  if (provider === "github.com") return "github";
  if (provider === "apple.com") return "apple";
  if (provider === "microsoft.com") return "microsoft";
  return provider;
}

export async function authenticateRequest(req: Request): Promise<User> {
  const token = extractBearerToken(req);

  if (!token) {
    throw ForbiddenError("Missing Authorization header");
  }

  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
  } catch {
    throw ForbiddenError("Invalid or expired Firebase token");
  }

  const { uid, email, name, firebase } = decoded;
  const loginMethod = mapProviderToLoginMethod(firebase?.sign_in_provider);

  await db.upsertUser({
    openId: uid,
    name: name ?? null,
    email: email ?? null,
    loginMethod,
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(uid);

  if (!user) {
    throw ForbiddenError("User not found after upsert");
  }

  return user;
}
