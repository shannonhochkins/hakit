ALTER TABLE "dashboard" ALTER COLUMN "breakpoints" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "data" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "valid_json_data" CHECK ("pages"."data"::json IS NOT NULL);