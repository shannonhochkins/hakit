ALTER TABLE "repositories" DROP CONSTRAINT "valid_repo_name";--> statement-breakpoint
DROP INDEX "repositories_components_idx";--> statement-breakpoint
ALTER TABLE "repositories" DROP COLUMN "component_names";