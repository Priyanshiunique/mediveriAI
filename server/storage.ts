import {
  type User,
  type InsertUser,
  type Provider,
  type InsertProvider,
  type ReviewQueueItem,
  type InsertReviewQueueItem,
  type EmailDraft,
  type InsertEmailDraft,
  type DashboardStats,
  type ConfidenceDistribution,
  type StatusBreakdown,
  ProviderStatus,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Providers
  getAllProviders(): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  getProviderByNpi(npi: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, data: Partial<Provider>): Promise<Provider | undefined>;
  deleteProvider(id: string): Promise<boolean>;
  bulkCreateProviders(providers: InsertProvider[]): Promise<Provider[]>;
  clearAllProviders(): Promise<void>;

  // Review Queue
  getAllReviewItems(): Promise<ReviewQueueItem[]>;
  getReviewItem(id: string): Promise<ReviewQueueItem | undefined>;
  createReviewItem(item: InsertReviewQueueItem): Promise<ReviewQueueItem>;
  updateReviewItem(id: string, data: Partial<ReviewQueueItem>): Promise<ReviewQueueItem | undefined>;
  deleteReviewItem(id: string): Promise<boolean>;
  getReviewItemByProviderId(providerId: string): Promise<ReviewQueueItem | undefined>;

  // Email Drafts
  getEmailDraft(id: string): Promise<EmailDraft | undefined>;
  createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;
  getStatusBreakdown(): Promise<StatusBreakdown[]>;
  getConfidenceDistribution(): Promise<ConfidenceDistribution[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private providers: Map<string, Provider>;
  private reviewItems: Map<string, ReviewQueueItem>;
  private emailDrafts: Map<string, EmailDraft>;

  constructor() {
    this.users = new Map();
    this.providers = new Map();
    this.reviewItems = new Map();
    this.emailDrafts = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Providers
  async getAllProviders(): Promise<Provider[]> {
    return Array.from(this.providers.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    return this.providers.get(id);
  }

  async getProviderByNpi(npi: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find((p) => p.npi === npi);
  }

  async createProvider(insertProvider: InsertProvider): Promise<Provider> {
    const id = insertProvider.id || randomUUID();
    const now = new Date();
    const provider: Provider = {
      ...insertProvider,
      id,
      status: insertProvider.status || ProviderStatus.PENDING,
      overallConfidence: insertProvider.overallConfidence || 0,
      createdAt: now,
      updatedAt: now,
      lastValidated: null,
      fieldConfidences: insertProvider.fieldConfidences || null,
      validationNotes: insertProvider.validationNotes || null,
    };
    this.providers.set(id, provider);
    return provider;
  }

  async updateProvider(id: string, data: Partial<Provider>): Promise<Provider | undefined> {
    const provider = this.providers.get(id);
    if (!provider) return undefined;

    const updated: Provider = {
      ...provider,
      ...data,
      updatedAt: new Date(),
    };
    this.providers.set(id, updated);
    return updated;
  }

  async deleteProvider(id: string): Promise<boolean> {
    return this.providers.delete(id);
  }

  async bulkCreateProviders(insertProviders: InsertProvider[]): Promise<Provider[]> {
    const providers: Provider[] = [];
    for (const insert of insertProviders) {
      const provider = await this.createProvider(insert);
      providers.push(provider);
    }
    return providers;
  }

  async clearAllProviders(): Promise<void> {
    this.providers.clear();
    this.reviewItems.clear();
  }

  // Review Queue
  async getAllReviewItems(): Promise<ReviewQueueItem[]> {
    const items = Array.from(this.reviewItems.values());
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return items.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
      return aPriority - bPriority;
    });
  }

  async getReviewItem(id: string): Promise<ReviewQueueItem | undefined> {
    return this.reviewItems.get(id);
  }

  async createReviewItem(insertItem: InsertReviewQueueItem): Promise<ReviewQueueItem> {
    const id = insertItem.id || randomUUID();
    const item: ReviewQueueItem = {
      ...insertItem,
      id,
      status: insertItem.status || "pending",
      priority: insertItem.priority || "medium",
      assignedTo: insertItem.assignedTo || null,
      resolvedAt: null,
      createdAt: new Date(),
    };
    this.reviewItems.set(id, item);
    return item;
  }

  async updateReviewItem(id: string, data: Partial<ReviewQueueItem>): Promise<ReviewQueueItem | undefined> {
    const item = this.reviewItems.get(id);
    if (!item) return undefined;

    const updated: ReviewQueueItem = { ...item, ...data };
    this.reviewItems.set(id, updated);
    return updated;
  }

  async deleteReviewItem(id: string): Promise<boolean> {
    return this.reviewItems.delete(id);
  }

  async getReviewItemByProviderId(providerId: string): Promise<ReviewQueueItem | undefined> {
    return Array.from(this.reviewItems.values()).find(
      (item) => item.providerId === providerId && item.status === "pending"
    );
  }

  // Email Drafts
  async getEmailDraft(id: string): Promise<EmailDraft | undefined> {
    return this.emailDrafts.get(id);
  }

  async createEmailDraft(insertDraft: InsertEmailDraft): Promise<EmailDraft> {
    const id = insertDraft.id || randomUUID();
    const draft: EmailDraft = {
      ...insertDraft,
      id,
      status: insertDraft.status || "draft",
      sentAt: null,
      createdAt: new Date(),
    };
    this.emailDrafts.set(id, draft);
    return draft;
  }

  // Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const providers = Array.from(this.providers.values());
    const totalProviders = providers.length;
    const verifiedProviders = providers.filter((p) => p.status === ProviderStatus.VERIFIED).length;
    const flaggedProviders = providers.filter((p) => p.status === ProviderStatus.FLAGGED).length;
    const pendingProviders = providers.filter((p) => p.status === ProviderStatus.PENDING).length;
    
    const totalConfidence = providers.reduce((sum, p) => sum + (p.overallConfidence || 0), 0);
    const averageConfidence = totalProviders > 0 ? totalConfidence / totalProviders : 0;
    
    const reviewItems = Array.from(this.reviewItems.values());
    const providersNeedingReview = reviewItems.filter((item) => item.status === "pending").length;

    return {
      totalProviders,
      verifiedProviders,
      flaggedProviders,
      pendingProviders,
      averageConfidence,
      validationAccuracy: totalProviders > 0 ? (verifiedProviders / totalProviders) * 100 : 0,
      processingTime: 15,
      pdfExtractionAccuracy: 92.5,
      providersNeedingReview,
    };
  }

  async getStatusBreakdown(): Promise<StatusBreakdown[]> {
    const providers = Array.from(this.providers.values());
    const total = providers.length || 1;

    const statusCounts = {
      verified: 0,
      flagged: 0,
      pending: 0,
      error: 0,
    };

    for (const provider of providers) {
      const status = provider.status as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status as any,
      count,
      percentage: (count / total) * 100,
    }));
  }

  async getConfidenceDistribution(): Promise<ConfidenceDistribution[]> {
    const providers = Array.from(this.providers.values());
    const total = providers.length || 1;

    const ranges = [
      { range: "90-100%", min: 90, max: 100 },
      { range: "80-89%", min: 80, max: 89 },
      { range: "70-79%", min: 70, max: 79 },
      { range: "60-69%", min: 60, max: 69 },
      { range: "0-59%", min: 0, max: 59 },
    ];

    return ranges.map(({ range, min, max }) => {
      const count = providers.filter(
        (p) => (p.overallConfidence || 0) >= min && (p.overallConfidence || 0) <= max
      ).length;
      return {
        range,
        count,
        percentage: (count / total) * 100,
      };
    });
  }
}

export const storage = new MemStorage();
