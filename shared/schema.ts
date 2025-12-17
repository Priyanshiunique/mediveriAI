import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Provider status enum
export const ProviderStatus = {
  PENDING: "pending",
  // VERIFIED: "verified",
  FLAGGED: "flagged",
  ERROR: "error",
} as const;

export type ProviderStatusType = typeof ProviderStatus[keyof typeof ProviderStatus];

// Priority levels for review queue
export const PriorityLevel = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type PriorityLevelType = typeof PriorityLevel[keyof typeof PriorityLevel];

// Data source types
export const DataSource = {
  CSV_UPLOAD: "csv_upload",
  PDF_EXTRACTION: "pdf_extraction",
  NPI_REGISTRY: "npi_registry",
  WEB_SCRAPE: "web_scrape",
  MANUAL_ENTRY: "manual_entry",
} as const;

export type DataSourceType = typeof DataSource[keyof typeof DataSource];

// Field confidence score interface
export interface FieldConfidence {
  value: string | null;
  confidence: number;
  source: DataSourceType;
  lastVerified?: string;
  discrepancies?: string[];
}

// Provider data with confidence scores per field
export interface ProviderFields {
  npi: FieldConfidence;
  firstName: FieldConfidence;
  lastName: FieldConfidence;
  credential: FieldConfidence;
  specialty: FieldConfidence;
  phone: FieldConfidence;
  fax: FieldConfidence;
  email: FieldConfidence;
  addressLine1: FieldConfidence;
  addressLine2: FieldConfidence;
  city: FieldConfidence;
  state: FieldConfidence;
  zipCode: FieldConfidence;
  organizationName: FieldConfidence;
  taxonomyCode: FieldConfidence;
  licenseNumber: FieldConfidence;
  licenseState: FieldConfidence;
}

// Providers table
export const providers = pgTable("providers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  npi: varchar("npi", { length: 10 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  credential: text("credential"),
  specialty: text("specialty"),
  phone: varchar("phone", { length: 20 }),
  fax: varchar("fax", { length: 20 }),
  email: text("email"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  organizationName: text("organization_name"),
  taxonomyCode: varchar("taxonomy_code", { length: 20 }),
  licenseNumber: text("license_number"),
  licenseState: varchar("license_state", { length: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  overallConfidence: real("overall_confidence").default(0),
  fieldConfidences: jsonb("field_confidences"),
  validationNotes: text("validation_notes"),
  lastValidated: timestamp("last_validated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Validation results table
export const validationResults = pgTable("validation_results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  providerId: varchar("provider_id", { length: 36 }).notNull(),
  agentType: varchar("agent_type", { length: 50 }).notNull(),
  fieldName: varchar("field_name", { length: 50 }).notNull(),
  originalValue: text("original_value"),
  validatedValue: text("validated_value"),
  confidence: real("confidence").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  discrepancyDetails: text("discrepancy_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Review queue table
export const reviewQueue = pgTable("review_queue", {
  id: varchar("id", { length: 36 }).primaryKey(),
  providerId: varchar("provider_id", { length: 36 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  reason: text("reason").notNull(),
  assignedTo: text("assigned_to"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email drafts table
export const emailDrafts = pgTable("email_drafts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  providerId: varchar("provider_id", { length: 36 }).notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  recipientEmail: text("recipient_email"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Processing jobs table
export const processingJobs = pgTable("processing_jobs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalRecords: integer("total_records").default(0),
  processedRecords: integer("processed_records").default(0),
  errorCount: integer("error_count").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertProviderSchema = createInsertSchema(providers).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertValidationResultSchema = createInsertSchema(validationResults).omit({
  createdAt: true,
});

export const insertReviewQueueSchema = createInsertSchema(reviewQueue).omit({
  createdAt: true,
});

export const insertEmailDraftSchema = createInsertSchema(emailDrafts).omit({
  createdAt: true,
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  createdAt: true,
});

// Types
export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type ValidationResult = typeof validationResults.$inferSelect;
export type InsertValidationResult = z.infer<typeof insertValidationResultSchema>;

export type ReviewQueueItem = typeof reviewQueue.$inferSelect;
export type InsertReviewQueueItem = z.infer<typeof insertReviewQueueSchema>;

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertEmailDraft = z.infer<typeof insertEmailDraftSchema>;

export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;

// Dashboard stats interface
export interface DashboardStats {
  totalProviders: number;
  verifiedProviders: number;
  flaggedProviders: number;
  pendingProviders: number;
  averageConfidence: number;
  validationAccuracy: number;
  processingTime: number;
  pdfExtractionAccuracy: number;
  providersNeedingReview: number;
}

// Confidence score distribution for charts
export interface ConfidenceDistribution {
  range: string;
  count: number;
  percentage: number;
}

// Status breakdown for charts
export interface StatusBreakdown {
  status: ProviderStatusType;
  count: number;
  percentage: number;
}

// NPI Registry response interface
export interface NPIRegistryResponse {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  taxonomyCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  fax: string;
  organizationName: string;
  enumarationDate: string;
  lastUpdated: string;
}

// User table (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
