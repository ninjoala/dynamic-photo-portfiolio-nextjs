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

#### 🟢 SAFE Operations (Production & Development)
- `npm run db:update-packages` - **SAFE** - Update photo packages without deleting any data (upserts only)
- `npm run db:migrate` - **SAFE** - Run database migrations (for schema changes)
- `npm run db:studio` - **SAFE** - Launch Drizzle Studio database GUI (read-only interface)
- `npm run db:generate` - **SAFE** - Generate new migration files from schema changes (does not modify database)

#### 🔴 DESTRUCTIVE Operations (Development Only - NEVER in Production)
- `npm run db:seed` - **DESTRUCTIVE** - Deletes ALL data (shirts, photo packages, orders) and re-seeds with defaults
  - Requires typing "DELETE ALL DATA" to confirm
  - CASCADE deletes orders due to foreign key constraints
  - Only use for initial setup or complete database reset
- `npm run db:push` - **POTENTIALLY DESTRUCTIVE** - Pushes schema changes directly to database without migrations
  - Can cause data loss if schema changes are incompatible
  - Use `db:generate` + `db:migrate` instead for production

#### Production Database Update Workflow

**For Schema Changes (adding/modifying tables/columns):**
```bash
# 1. Make changes to src/db/schema.ts locally
# 2. Generate migration file
npm run db:generate

# 3. Review the generated migration in drizzle/migrations/
# 4. Test migration locally
npm run db:migrate

# 5. Commit migration files to git
git add drizzle/migrations/
git commit -m "Add migration for [feature]"

# 6. Deploy to production
# Migration runs automatically via db:migrate in deployment pipeline
# OR manually run on production database:
DATABASE_URL=<production-url> npm run db:migrate
```

**For Data Updates (updating photo packages, prices, etc.):**
```bash
# 1. Update data in scripts/update-packages.ts
# 2. Test locally
npm run db:update-packages

# 3. Deploy to production and run:
DATABASE_URL=<production-url> npm run db:update-packages
```

**Critical Production Rules:**
- ✅ **DO** use migrations for all schema changes
- ✅ **DO** use `db:update-packages` for data updates
- ✅ **DO** test migrations locally before production
- ❌ **NEVER** use `db:seed` in production (deletes all data)
- ❌ **NEVER** use `db:push` in production (bypasses migrations)
- ❌ **NEVER** manually modify production database without migrations

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

### Database Scripts Overview

#### `scripts/seed.ts` - Full Database Reset (DESTRUCTIVE)
- Uses `drizzle-seed` package to completely reset database
- **WARNING**: Deletes ALL data including orders (CASCADE)
- Requires confirmation: must type "DELETE ALL DATA"
- Only for initial development setup
- See "Database Operations" section above for usage guidelines

#### `scripts/update-packages.ts` - Safe Data Updates
- **SAFE**: Updates photo packages without deleting data
- Uses upsert logic (update existing, insert new)
- Safe for production use
- Does NOT touch orders or other tables

#### Why Orders Get Deleted
The `orders` table has a foreign key to `shirts.id`:
```typescript
shirtId: integer('shirt_id').references(() => shirts.id)
```

When `seed.ts` deletes shirts, PostgreSQL CASCADE automatically deletes related orders to maintain referential integrity. This is why you should NEVER run `db:seed` in production.

### Database Schema
- **Shirts table**: JSONB fields for images array and sizes array
- **Photo Packages table**: Configurable photo packages with pricing and features
- **Orders table**: Foreign key references to shirts (CASCADE on delete)
- Uses Supabase PostgreSQL with pooler connection for scalability