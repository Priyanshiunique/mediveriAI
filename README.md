# MediveriAI - Provider Data Validation & Directory Management Agent

## Overview
MediveriAI is a full-stack Agentic AI web application for Healthcare Payers that automates provider data validation and enrichment using publicly available data sources and AI agents. The system validates, enriches, scores, and manages provider directory data with minimal human effort.

## Business Context
Healthcare provider directories contain 40-80% inaccurate data such as phone numbers, addresses, specialties, and license details. Manual verification is slow, costly, and causes poor member experience and regulatory risk.

## Current State
MVP is complete with core functionality working:
- Dashboard with KPI visualizations
- Provider management with CRUD operations
- CSV/PDF upload functionality
- Validation pipeline with NPI Registry API integration
- Confidence scoring per field
- Review queue for flagged providers
- Email draft generation

## Project Architecture

### Tech Stack
- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query for server state
- **Routing**: Wouter (lightweight React router)

### Directory Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, Providers, Review, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions and query client
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database storage implementation
│   ├── db.ts              # Database connection
│   └── vite.ts            # Vite dev server integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle ORM schema definitions
└── design_guidelines.md   # UI/UX design specifications
```

### Agent Architecture
1. **Data Validation Agent**: Validates phone numbers, addresses, cross-checks with NPI Registry
2. **Information Enrichment Agent**: Extracts details from PDFs, normalizes profiles
3. **Quality Assurance Agent**: Compares sources, detects inconsistencies, generates confidence scores
4. **Directory Management Agent**: Updates records, manages review queue, generates reports

### Key Features
- Upload provider data (CSV) and scanned PDFs
- Validate contact information (phone, address, specialty)
- Cross-check credentials using NPI Registry API
- Generate confidence scores per data field
- Flag low-confidence providers for manual review
- Auto-generate email drafts for provider confirmation
- Downloadable validation reports (CSV)

## Recent Changes
- Migrated from in-memory storage to PostgreSQL database
- Fixed VERIFIED status in provider schema
- Database persistence now enabled

## User Preferences
- Clean, professional UI following Material Design 3 principles
- Data-focused dashboard suitable for healthcare enterprise
- Dark/light theme support

## Database Schema
Tables: providers, users, review_queue, email_drafts, validation_results, processing_jobs

## API Endpoints
- `GET /api/stats` - Dashboard statistics
- `GET /api/providers` - List all providers
- `POST /api/upload/csv` - Upload CSV file
- `POST /api/providers/:id/validate` - Validate single provider
- `POST /api/providers/validate-all` - Validate all providers
- `GET /api/review-queue` - Get review queue items
- `POST /api/providers/:id/email-draft` - Generate email draft
