# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server (automatically generates image data first)
- `npm run build` - Production build (automatically generates image data first)
- `npm run build:production` - Same as build, explicit production target
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-image-data` - Generate image data from Wasabi S3 bucket

### Database Operations
- `npm run db:seed` - Seed database with initial shirt data using drizzle-seed
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Launch Drizzle Studio database GUI
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate new migration files

### Package Management
This project uses Yarn 4.5.1 as the package manager (see packageManager field in package.json).

## Architecture Overview

This is a dynamic photography portfolio built with Next.js 15 that supports multiple photography specializations through domain-based configuration.

### Core Concept: Multi-Domain Photography Portfolio
The application dynamically adapts its content, styling, and functionality based on the domain/subdomain:
- `newnanrealestatephotography.*` → Real estate photography mode
- `newnaneventphotography.*` → Event photography mode  
- `newnanfamilyphotography.*` → Family photography mode
- `newnansportsphotography.*` → Sports photography mode
- `nickdobosmedia.*` → Defaults to real estate mode

### Key Architecture Components

#### Configuration System (`src/app/config.ts`)
- Centralized configuration for all photography categories
- Domain-based configuration switching via `getCategoryFromDomain()`
- Each category defines: services, pricing, features, bucket folders
- Version-specific site configurations in `siteVersions` object

#### Image Management System
- **Wasabi S3 Integration**: Images stored in Wasabi cloud storage with category-based folder structure
- **Imgix Integration**: Automatic image optimization and transformation via Imgix CDN
- **Build-time Generation**: `scripts/generate-image-data.ts` fetches S3 metadata and generates static JSON files
- **Featured Work**: Special `/featured-work/` subfolder system for homepage highlights

#### Virtual Gallery Component (`src/app/components/VirtualGallery.tsx`)
- High-performance virtualized rendering for large image collections
- Responsive grid layout (1-4 columns based on viewport)
- Mode-specific image filtering with fallback to default
- Handles thousands of images efficiently through virtualization

### File Structure
```
src/app/
├── config.ts              # Central configuration system
├── components/             # Reusable React components
│   ├── VirtualGallery.tsx # Main gallery component
│   ├── Navigation.tsx     # Site navigation
│   └── Button.tsx         # UI components
├── (routes)/              # App Router pages
└── utils/                 # Shared utilities

src/utils/
├── featuredWork.ts        # Featured work image fetching
├── fetchImageData.ts      # Image data loading utilities
└── imgix.ts              # Imgix URL generation

public/data/               # Generated image metadata
├── images-{category}.json # Category-specific image data
└── images.json           # Combined fallback data

scripts/
└── generate-image-data.ts # S3 to JSON build script
```

### Environment Variables Required
- `WASABI_REGION` - Wasabi S3 region
- `WASABI_ENDPOINT` - Wasabi S3 endpoint URL
- `WASABI_BUCKET_NAME` - S3 bucket name
- `WASABI_ACCESS_KEY_ID` - S3 access key
- `WASABI_SECRET_ACCESS_KEY` - S3 secret key
- `NEXT_PUBLIC_IMGIX_DOMAIN` - Imgix domain for image optimization

### Development Notes
- Image data generation is automatically run before build/dev
- Uses TypeScript with strict typing throughout
- Responsive design with Tailwind CSS
- Contact form integration with Postmark email service
- React 19 with Next.js 15 App Router

## Database Connection Issues & Solutions

### Environment Variable Loading Problem
**Issue**: Scripts that import database modules at the top level fail with "DATABASE_URL is not set" error, even when using dotenv.

**Root Cause**: Node.js executes top-level imports immediately, before dotenv can load .env.local variables. The database module tries to read DATABASE_URL during import, before environment variables are available.

**Solution**: Use dynamic imports in scripts to ensure environment variables load first:

```typescript
// ❌ WRONG - imports happen before dotenv
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../src/db';

// ✅ CORRECT - dynamic imports after dotenv
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { db } = await import('../src/db');
  // ... rest of script
}
```

### Drizzle Seed Usage
- Uses `drizzle-seed` package for database seeding and reset operations
- Seed script located at `scripts/seed.ts` with proper dynamic import pattern
- Reset function clears tables with CASCADE to handle foreign key constraints
- Custom shirt data insertion after reset to maintain specific product information

### Database Schema
- Shirts table with JSONB fields for images array and sizes array
- Orders table with foreign key reference to shirts
- Uses Supabase PostgreSQL with pooler connection for scalability