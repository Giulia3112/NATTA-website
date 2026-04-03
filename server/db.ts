import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  type User,
  type InsertUser,
  opportunities,
  applications,
  savedOpportunities,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.email && user.email === ENV.adminEmail) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOpportunities() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(opportunities).execute();
}

export async function getOpportunityById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1)
    .execute();

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .execute();
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1)
    .execute();

  return result.length > 0 ? result[0] : undefined;
}

export async function createApplication(data: {
  userId: number;
  opportunityId: number;
  notes?: string;
  programStartDate?: Date;
  programEndDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .insert(applications)
    .values({
      userId: data.userId,
      opportunityId: data.opportunityId,
      status: "Applied",
      notes: data.notes,
      programStartDate: data.programStartDate,
      programEndDate: data.programEndDate,
    })
    .execute();
}

export async function updateApplicationStatus(
  id: number,
  status: "Applied" | "In Progress" | "Accepted" | "Rejected"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .execute();

  return { success: true };
}

export async function updateApplicationNotes(id: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(applications)
    .set({ notes, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .execute();

  return { success: true };
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(applications).where(eq(applications.id, id)).execute();
  return { success: true };
}

export async function getUserSavedOpportunities(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId))
    .execute();
}

export async function saveOpportunity(userId: number, opportunityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1)
    .execute();

  if (existing.length > 0) {
    return { success: true, alreadySaved: true };
  }

  await db.insert(savedOpportunities).values({ userId, opportunityId }).execute();
  return { success: true, alreadySaved: false };
}

export async function unsaveOpportunity(userId: number, opportunityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .execute();

  return { success: true };
}

export async function isOpportunitySaved(userId: number, opportunityId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1)
    .execute();

  return result.length > 0;
}

export async function deleteOpportunity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(savedOpportunities)
    .where(eq(savedOpportunities.opportunityId, id))
    .execute();
  await db
    .delete(applications)
    .where(eq(applications.opportunityId, id))
    .execute();
  await db.delete(opportunities).where(eq(opportunities.id, id)).execute();

  return { success: true };
}
