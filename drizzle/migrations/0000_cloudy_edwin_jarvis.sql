CREATE TYPE "public"."applicationStatus" AS ENUM('Applied', 'In Progress', 'Accepted', 'Rejected');--> statement-breakpoint
CREATE TYPE "public"."fee" AS ENUM('No-fee', 'Paid');--> statement-breakpoint
CREATE TYPE "public"."funding" AS ENUM('Fully funded', 'Partial', 'Stipend', 'Equity-based', 'Not certain');--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('Online', 'In-person', 'Hybrid');--> statement-breakpoint
CREATE TYPE "public"."opportunityType" AS ENUM('Scholarship', 'Fellowship', 'Accelerator', 'Incubator', 'Competition', 'Internship', 'Grant', 'Conference', 'Exchange Program', 'Course', 'Others');--> statement-breakpoint
CREATE TYPE "public"."pendingStatus" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."stage" AS ENUM('High school', 'Undergraduate', 'Graduate', 'Startup idea', 'MVP', 'Revenue', 'Scale', 'Multi-stage');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"opportunityId" integer NOT NULL,
	"status" "applicationStatus" DEFAULT 'Applied' NOT NULL,
	"appliedAt" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"requiredDocs" jsonb,
	"interviewDate" timestamp,
	"programStartDate" timestamp,
	"programEndDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"organizer" varchar(255) DEFAULT 'Não informado' NOT NULL,
	"deadline" timestamp,
	"opportunityType" "opportunityType" NOT NULL,
	"stage" "stage" NOT NULL,
	"regions" jsonb NOT NULL,
	"mode" "mode" NOT NULL,
	"fields" jsonb NOT NULL,
	"funding" "funding" NOT NULL,
	"fee" "fee" DEFAULT 'No-fee' NOT NULL,
	"requirements" text,
	"benefits" text,
	"programStartDate" timestamp,
	"programEndDate" timestamp,
	"fundingAmount" varchar(100),
	"applicationLink" varchar(500),
	"isFeatured" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pendingOpportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(500) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"organizer" varchar(255) NOT NULL,
	"deadline" timestamp,
	"opportunityType" "opportunityType" NOT NULL,
	"stage" "stage" NOT NULL,
	"regions" jsonb NOT NULL,
	"mode" "mode" NOT NULL,
	"fields" jsonb NOT NULL,
	"funding" "funding" NOT NULL,
	"fee" "fee" DEFAULT 'No-fee' NOT NULL,
	"requirements" text,
	"benefits" text,
	"programStartDate" timestamp,
	"programEndDate" timestamp,
	"fundingAmount" varchar(100),
	"applicationLink" varchar(500),
	"confidence" text DEFAULT '0' NOT NULL,
	"status" "pendingStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savedOpportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"opportunityId" integer NOT NULL,
	"savedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(128) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"bio" text,
	"interests" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
