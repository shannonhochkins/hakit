ALTER TABLE "repository_versions" RENAME COLUMN "component_names" TO "components";--> statement-breakpoint
ALTER TABLE "repository_versions" ALTER COLUMN "manifest_url" SET NOT NULL;