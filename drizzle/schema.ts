import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  jsonb,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const opportunityTypeEnum = pgEnum("opportunityType", [
  "Scholarship",
  "Fellowship",
  "Accelerator",
  "Incubator",
  "Competition",
  "Internship",
  "Grant",
  "Conference",
  "Exchange Program",
]);

export const stageEnum = pgEnum("stage", [
  "High school",
  "Undergraduate",
  "Graduate",
  "Startup idea",
  "MVP",
  "Revenue",
  "Scale",
  "Multi-stage",
]);

export const modeEnum = pgEnum("mode", ["Online", "In-person", "Hybrid"]);

export const fundingEnum = pgEnum("funding", [
  "Fully funded",
  "Partial",
  "Stipend",
  "Equity-based",
  "Not certain",
]);

export const feeEnum = pgEnum("fee", ["No-fee", "Paid"]);

export const applicationStatusEnum = pgEnum("applicationStatus", [
  "Applied",
  "In Progress",
  "Accepted",
  "Rejected",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  bio: text("bio"),
  interests: jsonb("interests").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  organizer: varchar("organizer", { length: 255 }).notNull(),
  deadline: timestamp("deadline"),
  opportunityType: opportunityTypeEnum("opportunityType").notNull(),
  stage: stageEnum("stage").notNull(),
  regions: jsonb("regions").$type<string[]>().notNull(),
  mode: modeEnum("mode").notNull(),
  fields: jsonb("fields").$type<string[]>().notNull(),
  funding: fundingEnum("funding").notNull(),
  fee: feeEnum("fee").notNull().default("No-fee"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  programStartDate: timestamp("programStartDate"),
  programEndDate: timestamp("programEndDate"),
  fundingAmount: varchar("fundingAmount", { length: 100 }),
  applicationLink: varchar("applicationLink", { length: 500 }),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  opportunityId: integer("opportunityId").notNull(),
  status: applicationStatusEnum("status").default("Applied").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  notes: text("notes"),
  requiredDocs: jsonb("requiredDocs").$type<
    { name: string; completed: boolean }[]
  >(),
  interviewDate: timestamp("interviewDate"),
  programStartDate: timestamp("programStartDate"),
  programEndDate: timestamp("programEndDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const savedOpportunities = pgTable("savedOpportunities", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  opportunityId: integer("opportunityId").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type InsertSavedOpportunity = typeof savedOpportunities.$inferInsert;
