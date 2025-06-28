ALTER TABLE "components" ADD COLUMN "is_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "is_enabled" boolean DEFAULT true NOT NULL;