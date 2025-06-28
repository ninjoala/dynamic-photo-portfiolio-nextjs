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