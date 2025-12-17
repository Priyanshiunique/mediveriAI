import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import {
  type InsertProvider,
  type Provider,
  type FieldConfidence,
  ProviderStatus,
  PriorityLevel,
  DataSource,
} from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Synthetic data generation helpers
const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const credentials = ["MD", "DO", "NP", "PA", "DPM", "DC", "PhD", "DMD", "DDS", "OD"];
const specialties = ["Family Medicine", "Internal Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Psychiatry", "Dermatology", "Neurology", "Oncology", "Emergency Medicine", "Radiology", "Anesthesiology", "Gastroenterology", "Pulmonology", "Nephrology"];
const states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];
const cities: Record<string, string[]> = {
  CA: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
  TX: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
  FL: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
  NY: ["New York", "Buffalo", "Rochester", "Albany", "Syracuse"],
  PA: ["Philadelphia", "Pittsburgh", "Harrisburg", "Allentown", "Erie"],
  IL: ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield"],
  OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  GA: ["Atlanta", "Augusta", "Savannah", "Columbus", "Macon"],
  NC: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
  MI: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],
};
const streetNames = ["Main St", "Oak Ave", "Park Blvd", "Cedar Ln", "Maple Dr", "Washington St", "Lincoln Ave", "Jefferson Blvd", "Madison St", "Medical Center Dr"];
const organizations = ["Medical Group", "Health Partners", "Clinic", "Medical Center", "Healthcare Associates", "Family Practice", "Specialty Care"];

function generateNPI(): string {
  return "1" + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
}

function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}-${prefix}-${line}`;
}

function generateZip(): string {
  return String(Math.floor(Math.random() * 90000) + 10000);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function introduceDataIssues(provider: InsertProvider): InsertProvider {
  const issues = Math.random();
  
  if (issues < 0.15) {
    provider.phone = provider.phone?.replace(/-/g, "") || null;
  } else if (issues < 0.25) {
    provider.phone = "555-000-0000";
  }
  
  if (issues > 0.7 && issues < 0.8) {
    provider.addressLine1 = provider.addressLine1?.toUpperCase() || null;
  }
  
  if (issues > 0.8 && issues < 0.85) {
    provider.email = null;
  }
  
  if (issues > 0.85 && issues < 0.9) {
    provider.zipCode = "00000";
  }
  
  if (issues > 0.9 && issues < 0.95) {
    provider.specialty = null;
  }
  
  return provider;
}

function generateSyntheticProvider(): InsertProvider {
  const state = randomElement(states);
  const city = randomElement(cities[state]);
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  
  let provider: InsertProvider = {
    id: randomUUID(),
    npi: generateNPI(),
    firstName,
    lastName,
    credential: randomElement(credentials),
    specialty: randomElement(specialties),
    phone: generatePhone(),
    fax: Math.random() > 0.3 ? generatePhone() : null,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(organizations).toLowerCase().replace(/ /g, "")}.com`,
    addressLine1: `${Math.floor(Math.random() * 9000) + 1000} ${randomElement(streetNames)}`,
    addressLine2: Math.random() > 0.7 ? `Suite ${Math.floor(Math.random() * 500) + 100}` : null,
    city,
    state,
    zipCode: generateZip(),
    organizationName: `${lastName} ${randomElement(organizations)}`,
    taxonomyCode: `207${String.fromCharCode(65 + Math.floor(Math.random() * 26))}00000X`,
    licenseNumber: `${state}${Math.floor(Math.random() * 900000) + 100000}`,
    licenseState: state,
    status: ProviderStatus.PENDING,
    overallConfidence: 0,
    fieldConfidences: null,
    validationNotes: null,
    lastValidated: null,
  };
  
  return introduceDataIssues(provider);
}

// NPI Registry API integration
async function queryNPIRegistry(npi: string): Promise<any> {
  try {
    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.result_count > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error("NPI Registry API error:", error);
    return null;
  }
}

// Validation agents
function validatePhone(phone: string | null): { valid: boolean; confidence: number; issues: string[] } {
  if (!phone) return { valid: false, confidence: 0, issues: ["Phone number missing"] };
  
  const cleaned = phone.replace(/\D/g, "");
  const issues: string[] = [];
  
  if (cleaned.length !== 10) {
    issues.push("Invalid phone number length");
  }
  if (cleaned.startsWith("555")) {
    issues.push("Potential fake number (555 prefix)");
  }
  if (cleaned === "0000000000" || /^(.)\1+$/.test(cleaned)) {
    issues.push("Invalid repeating digits");
  }
  
  const confidence = issues.length === 0 ? 95 : Math.max(0, 70 - issues.length * 20);
  return { valid: issues.length === 0, confidence, issues };
}

function validateAddress(
  addressLine1: string | null,
  city: string | null,
  state: string | null,
  zipCode: string | null
): { valid: boolean; confidence: number; issues: string[] } {
  const issues: string[] = [];
  
  if (!addressLine1) issues.push("Address line 1 missing");
  if (!city) issues.push("City missing");
  if (!state) issues.push("State missing");
  if (!zipCode) issues.push("ZIP code missing");
  
  if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    issues.push("Invalid ZIP code format");
  }
  if (zipCode === "00000") {
    issues.push("Invalid ZIP code value");
  }
  if (state && !/^[A-Z]{2}$/.test(state)) {
    issues.push("Invalid state format");
  }
  
  const confidence = issues.length === 0 ? 90 : Math.max(0, 80 - issues.length * 15);
  return { valid: issues.length === 0, confidence, issues };
}

function validateEmail(email: string | null): { valid: boolean; confidence: number; issues: string[] } {
  if (!email) return { valid: false, confidence: 30, issues: ["Email missing"] };
  
  const issues: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    issues.push("Invalid email format");
  }
  
  const confidence = issues.length === 0 ? 85 : Math.max(0, 60 - issues.length * 20);
  return { valid: issues.length === 0, confidence, issues };
}

function calculateFieldConfidence(
  fieldName: string,
  value: string | null,
  npiData: any,
  source: string = DataSource.CSV_UPLOAD
): FieldConfidence {
  let confidence = 50;
  const discrepancies: string[] = [];
  
  if (!value) {
    confidence = 20;
  } else if (npiData) {
    confidence = 85;
    
    if (fieldName === "phone") {
      const validation = validatePhone(value);
      confidence = validation.confidence;
      discrepancies.push(...validation.issues);
    } else if (fieldName === "email") {
      const validation = validateEmail(value);
      confidence = validation.confidence;
      discrepancies.push(...validation.issues);
    }
  } else {
    if (fieldName === "phone") {
      const validation = validatePhone(value);
      confidence = validation.confidence;
      discrepancies.push(...validation.issues);
    } else if (fieldName === "email") {
      const validation = validateEmail(value);
      confidence = validation.confidence;
      discrepancies.push(...validation.issues);
    } else {
      confidence = 60 + Math.random() * 20;
    }
  }
  
  return {
    value,
    confidence,
    source: source as any,
    lastVerified: new Date().toISOString(),
    discrepancies,
  };
}

async function runValidationPipeline(provider: Provider): Promise<Provider> {
  const npiData = await queryNPIRegistry(provider.npi);
  
  const fieldConfidences: Record<string, FieldConfidence> = {
    npi: {
      value: provider.npi,
      confidence: npiData ? 100 : 50,
      source: npiData ? DataSource.NPI_REGISTRY : DataSource.CSV_UPLOAD,
      lastVerified: new Date().toISOString(),
      discrepancies: npiData ? [] : ["NPI not found in registry"],
    },
    firstName: calculateFieldConfidence("firstName", provider.firstName, npiData),
    lastName: calculateFieldConfidence("lastName", provider.lastName, npiData),
    credential: calculateFieldConfidence("credential", provider.credential, npiData),
    specialty: calculateFieldConfidence("specialty", provider.specialty, npiData),
    phone: calculateFieldConfidence("phone", provider.phone, npiData),
    fax: calculateFieldConfidence("fax", provider.fax, npiData),
    email: calculateFieldConfidence("email", provider.email, npiData),
    addressLine1: calculateFieldConfidence("addressLine1", provider.addressLine1, npiData),
    city: calculateFieldConfidence("city", provider.city, npiData),
    state: calculateFieldConfidence("state", provider.state, npiData),
    zipCode: calculateFieldConfidence("zipCode", provider.zipCode, npiData),
    organizationName: calculateFieldConfidence("organizationName", provider.organizationName, npiData),
  };
  
  const addressValidation = validateAddress(
    provider.addressLine1,
    provider.city,
    provider.state,
    provider.zipCode
  );
  
  fieldConfidences.addressLine1.confidence = addressValidation.confidence;
  fieldConfidences.addressLine1.discrepancies = addressValidation.issues;
  
  const confidenceValues = Object.values(fieldConfidences).map((f) => f.confidence);
  const overallConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
  
  let status = ProviderStatus.VERIFIED;
  let validationNotes = "";
  
  if (overallConfidence < 70) {
    status = ProviderStatus.FLAGGED;
    validationNotes = "Low confidence score - manual review required";
  } else if (overallConfidence < 85) {
    status = ProviderStatus.FLAGGED;
    validationNotes = "Some fields have low confidence - review recommended";
  }
  
  const hasDiscrepancies = Object.values(fieldConfidences).some(
    (f) => f.discrepancies && f.discrepancies.length > 0
  );
  if (hasDiscrepancies && status === ProviderStatus.VERIFIED) {
    status = ProviderStatus.FLAGGED;
    validationNotes = "Data discrepancies detected";
  }
  
  return {
    ...provider,
    status,
    overallConfidence,
    fieldConfidences: fieldConfidences as any,
    validationNotes,
    lastValidated: new Date(),
    updatedAt: new Date(),
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Dashboard Stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/status-breakdown", async (req: Request, res: Response) => {
    try {
      const breakdown = await storage.getStatusBreakdown();
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status breakdown" });
    }
  });

  app.get("/api/stats/confidence-distribution", async (req: Request, res: Response) => {
    try {
      const distribution = await storage.getConfidenceDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch confidence distribution" });
    }
  });

  // Providers
  app.get("/api/providers", async (req: Request, res: Response) => {
    try {
      const providers = await storage.getAllProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  app.get("/api/providers/:id", async (req: Request, res: Response) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider" });
    }
  });

  app.patch("/api/providers/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateProvider(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      if (req.body.status === ProviderStatus.VERIFIED) {
        const reviewItem = await storage.getReviewItemByProviderId(req.params.id);
        if (reviewItem) {
          await storage.updateReviewItem(reviewItem.id, { status: "approved", resolvedAt: new Date() });
        }
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update provider" });
    }
  });

  app.post("/api/providers/:id/validate", async (req: Request, res: Response) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      const validated = await runValidationPipeline(provider);
      const updated = await storage.updateProvider(req.params.id, validated);
      
      if (validated.status === ProviderStatus.FLAGGED) {
        const existingReview = await storage.getReviewItemByProviderId(req.params.id);
        if (!existingReview) {
          await storage.createReviewItem({
            id: randomUUID(),
            providerId: req.params.id,
            priority: validated.overallConfidence < 50 ? PriorityLevel.HIGH : PriorityLevel.MEDIUM,
            reason: validated.validationNotes || "Flagged during validation",
            status: "pending",
          });
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Failed to validate provider" });
    }
  });

  app.post("/api/providers/validate-all", async (req: Request, res: Response) => {
    try {
      const providers = await storage.getAllProviders();
      let processed = 0;
      
      for (const provider of providers) {
        const validated = await runValidationPipeline(provider);
        await storage.updateProvider(provider.id, validated);
        
        if (validated.status === ProviderStatus.FLAGGED) {
          const existingReview = await storage.getReviewItemByProviderId(provider.id);
          if (!existingReview) {
            await storage.createReviewItem({
              id: randomUUID(),
              providerId: provider.id,
              priority: validated.overallConfidence < 50 ? PriorityLevel.HIGH : PriorityLevel.MEDIUM,
              reason: validated.validationNotes || "Flagged during validation",
              status: "pending",
            });
          }
        }
        
        processed++;
      }
      
      res.json({ processed, total: providers.length });
    } catch (error) {
      console.error("Bulk validation error:", error);
      res.status(500).json({ error: "Failed to validate providers" });
    }
  });

  app.post("/api/providers/:id/email-draft", async (req: Request, res: Response) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      const subject = `Provider Data Verification Request - ${provider.firstName} ${provider.lastName}`;
      const body = `Dear ${provider.firstName} ${provider.lastName},

We are conducting a routine verification of provider information in our healthcare directory. We have the following information on file and would appreciate your confirmation or correction of these details:

Name: ${provider.firstName} ${provider.lastName}, ${provider.credential || ""}
NPI: ${provider.npi}
Specialty: ${provider.specialty || "Not specified"}
Phone: ${provider.phone || "Not on file"}
Address: ${provider.addressLine1 || ""} ${provider.addressLine2 || ""}
         ${provider.city || ""}, ${provider.state || ""} ${provider.zipCode || ""}

Please reply to this email with any corrections or to confirm that the information above is accurate.

Thank you for your cooperation in maintaining accurate provider data.

Best regards,
Provider Directory Management Team
MediveriAI`;

      const draft = await storage.createEmailDraft({
        id: randomUUID(),
        providerId: provider.id,
        subject,
        body,
        recipientEmail: provider.email,
        status: "draft",
      });
      
      res.json(draft);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate email draft" });
    }
  });

  // Review Queue
  app.get("/api/review-queue", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllReviewItems();
      const providers = await storage.getAllProviders();
      
      const itemsWithProviders = items
        .filter((item) => item.status === "pending")
        .map((item) => ({
          ...item,
          provider: providers.find((p) => p.id === item.providerId),
        }));
      
      res.json(itemsWithProviders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch review queue" });
    }
  });

  app.patch("/api/review-queue/:id", async (req: Request, res: Response) => {
    try {
      const item = await storage.getReviewItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Review item not found" });
      }
      
      const updated = await storage.updateReviewItem(req.params.id, {
        ...req.body,
        resolvedAt: new Date(),
      });
      
      if (req.body.status === "approved") {
        await storage.updateProvider(item.providerId, { status: ProviderStatus.VERIFIED });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update review item" });
    }
  });

  app.post("/api/review-queue/bulk-approve", async (req: Request, res: Response) => {
    try {
      const { itemIds } = req.body;
      for (const id of itemIds) {
        const item = await storage.getReviewItem(id);
        if (item) {
          await storage.updateReviewItem(id, { status: "approved", resolvedAt: new Date() });
          await storage.updateProvider(item.providerId, { status: ProviderStatus.VERIFIED });
        }
      }
      res.json({ approved: itemIds.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to bulk approve" });
    }
  });

  app.post("/api/review-queue/bulk-reject", async (req: Request, res: Response) => {
    try {
      const { itemIds } = req.body;
      for (const id of itemIds) {
        await storage.updateReviewItem(id, { status: "rejected", resolvedAt: new Date() });
      }
      res.json({ rejected: itemIds.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to bulk reject" });
    }
  });

  // File Upload
  app.post("/api/upload/csv", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const content = req.file.buffer.toString("utf-8");
      const lines = content.split("\n").filter((line) => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json({ error: "Invalid CSV format" });
      }
      
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const providers: InsertProvider[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < 3) continue;
        
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        providers.push({
          id: randomUUID(),
          npi: row.npi || generateNPI(),
          firstName: row["first name"] || row.firstname || row["first_name"] || "Unknown",
          lastName: row["last name"] || row.lastname || row["last_name"] || "Provider",
          credential: row.credential || row.credentials || null,
          specialty: row.specialty || null,
          phone: row.phone || row.telephone || null,
          fax: row.fax || null,
          email: row.email || null,
          addressLine1: row.address || row["address line 1"] || row.address1 || null,
          addressLine2: row["address line 2"] || row.address2 || null,
          city: row.city || null,
          state: row.state || null,
          zipCode: row.zip || row.zipcode || row["zip code"] || null,
          organizationName: row.organization || row["organization name"] || null,
          taxonomyCode: row.taxonomy || row["taxonomy code"] || null,
          licenseNumber: row.license || row["license number"] || null,
          licenseState: row["license state"] || null,
          status: ProviderStatus.PENDING,
          overallConfidence: 0,
        });
      }
      
      const created = await storage.bulkCreateProviders(providers);
      res.json({ count: created.length, message: "CSV imported successfully" });
    } catch (error) {
      console.error("CSV upload error:", error);
      res.status(500).json({ error: "Failed to process CSV" });
    }
  });

  app.post("/api/upload/pdf", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const mockExtractedProviders = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () =>
        generateSyntheticProvider()
      );
      
      const created = await storage.bulkCreateProviders(mockExtractedProviders);
      
      res.json({
        extractedCount: created.length,
        message: "PDF processed successfully (simulated OCR extraction)",
      });
    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({ error: "Failed to process PDF" });
    }
  });

  // Synthetic Data Generation
  app.post("/api/generate-synthetic-data", async (req: Request, res: Response) => {
    try {
      await storage.clearAllProviders();
      
      const count = 200;
      const providers: InsertProvider[] = Array.from({ length: count }, () =>
        generateSyntheticProvider()
      );
      
      const created = await storage.bulkCreateProviders(providers);
      
      res.json({ count: created.length, message: "Synthetic data generated" });
    } catch (error) {
      console.error("Synthetic data generation error:", error);
      res.status(500).json({ error: "Failed to generate synthetic data" });
    }
  });

  // Reports
  app.get("/api/reports/providers/csv", async (req: Request, res: Response) => {
    try {
      const providers = await storage.getAllProviders();
      const status = req.query.status as string;
      
      let filtered = providers;
      if (status && status !== "all") {
        filtered = providers.filter((p) => p.status === status);
      }
      
      const headers = [
        "NPI",
        "First Name",
        "Last Name",
        "Credential",
        "Specialty",
        "Phone",
        "Email",
        "Address",
        "City",
        "State",
        "ZIP",
        "Organization",
        "Status",
        "Confidence",
        "Last Validated",
      ];
      
      const rows = filtered.map((p) => [
        p.npi,
        p.firstName,
        p.lastName,
        p.credential || "",
        p.specialty || "",
        p.phone || "",
        p.email || "",
        p.addressLine1 || "",
        p.city || "",
        p.state || "",
        p.zipCode || "",
        p.organizationName || "",
        p.status,
        (p.overallConfidence || 0).toFixed(1),
        p.lastValidated ? new Date(p.lastValidated).toISOString() : "",
      ]);
      
      const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=providers_export.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  return httpServer;
}
