ALTER TABLE "repository_versions" RENAME COLUMN "release_notes" TO "release_notes_url";--> statement-breakpoint
ALTER TABLE "repository_versions" RENAME COLUMN "is_prerelease" TO "is_beta";--> statement-breakpoint
DROP INDEX "repositories_active_idx";--> statement-breakpoint
DROP INDEX "repo_versions_stable_idx";--> statement-breakpoint
DROP INDEX "repo_versions_latest_stable_idx";--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "latest_version" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "repo_versions_stable_idx" ON "repository_versions" USING btree ("repository_id","is_beta");--> statement-breakpoint
CREATE INDEX "repo_versions_latest_stable_idx" ON "repository_versions" USING btree ("repository_id","is_beta","created_at");--> statement-breakpoint
ALTER TABLE "repositories" DROP COLUMN "deprecated";