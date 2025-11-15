-- Create photo_packages table
CREATE TABLE "photo_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"max_photos" integer,
	"turnaround_days" integer,
	"active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint

-- Make legacy fields nullable
ALTER TABLE "orders" ALTER COLUMN "shirt_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "size" DROP NOT NULL;
--> statement-breakpoint

-- Add new polymorphic columns (nullable first for existing data)
ALTER TABLE "orders" ADD COLUMN "order_type" text DEFAULT 'shirt';
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_id" integer;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_options" jsonb;
--> statement-breakpoint

-- Populate product_id from existing shirt_id for all rows where shirt_id is not null
UPDATE "orders" SET "product_id" = "shirt_id" WHERE "shirt_id" IS NOT NULL;
--> statement-breakpoint

-- Now make product_id NOT NULL after it's been populated
ALTER TABLE "orders" ALTER COLUMN "product_id" SET NOT NULL;
--> statement-breakpoint

-- Make order_type NOT NULL after setting default
ALTER TABLE "orders" ALTER COLUMN "order_type" SET NOT NULL;
