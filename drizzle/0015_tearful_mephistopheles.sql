ALTER TABLE "repository_versions" RENAME TO "addon_versions";--> statement-breakpoint
ALTER TABLE "repositories" RENAME TO "addons";--> statement-breakpoint
ALTER TABLE "user_repositories" RENAME TO "user_addons";--> statement-breakpoint
ALTER TABLE "addon_versions" RENAME COLUMN "repository_id" TO "addon_id";--> statement-breakpoint
ALTER TABLE "user_component_preferences" RENAME COLUMN "user_repository_id" TO "user_addon_id";--> statement-breakpoint
ALTER TABLE "user_addons" RENAME COLUMN "repository_id" TO "addon_id";--> statement-breakpoint
ALTER TABLE "addons" DROP CONSTRAINT "unique_repo_name";--> statement-breakpoint
ALTER TABLE "addon_versions" DROP CONSTRAINT "unique_repo_version";--> statement-breakpoint
ALTER TABLE "user_component_preferences" DROP CONSTRAINT "unique_user_repo_component";--> statement-breakpoint
ALTER TABLE "user_addons" DROP CONSTRAINT "unique_user_repo";--> statement-breakpoint
ALTER TABLE "addons" DROP CONSTRAINT "valid_github_url";--> statement-breakpoint
ALTER TABLE "user_addons" DROP CONSTRAINT "valid_user_id";--> statement-breakpoint
ALTER TABLE "addon_versions" DROP CONSTRAINT "repository_versions_repository_id_repositories_id_fk";
--> statement-breakpoint
ALTER TABLE "user_component_preferences" DROP CONSTRAINT "user_component_preferences_user_repository_id_user_repositories_id_fk";
--> statement-breakpoint
ALTER TABLE "user_addons" DROP CONSTRAINT "user_repositories_repository_id_repositories_id_fk";
--> statement-breakpoint
ALTER TABLE "user_addons" DROP CONSTRAINT "user_repositories_version_id_repository_versions_id_fk";
--> statement-breakpoint
DROP INDEX "repositories_author_idx";--> statement-breakpoint
DROP INDEX "repositories_public_idx";--> statement-breakpoint
DROP INDEX "repositories_updated_idx";--> statement-breakpoint
DROP INDEX "repositories_popularity_idx";--> statement-breakpoint
DROP INDEX "repo_versions_repo_id_idx";--> statement-breakpoint
DROP INDEX "repo_versions_created_at_idx";--> statement-breakpoint
DROP INDEX "repo_versions_downloads_idx";--> statement-breakpoint
DROP INDEX "repo_versions_stable_idx";--> statement-breakpoint
DROP INDEX "repo_versions_latest_stable_idx";--> statement-breakpoint
DROP INDEX "user_component_prefs_user_repo_idx";--> statement-breakpoint
DROP INDEX "user_repo_user_idx";--> statement-breakpoint
DROP INDEX "user_repo_repo_idx";--> statement-breakpoint
DROP INDEX "user_repo_version_idx";--> statement-breakpoint
DROP INDEX "user_repo_recent_idx";--> statement-breakpoint
DROP INDEX "user_repo_usage_idx";--> statement-breakpoint
DROP INDEX "user_component_prefs_lookup_idx";--> statement-breakpoint
ALTER TABLE "addon_versions" ADD CONSTRAINT "addon_versions_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_component_preferences" ADD CONSTRAINT "user_component_preferences_user_addon_id_user_addons_id_fk" FOREIGN KEY ("user_addon_id") REFERENCES "public"."user_addons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addons" ADD CONSTRAINT "user_addons_addon_id_addons_id_fk" FOREIGN KEY ("addon_id") REFERENCES "public"."addons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addons" ADD CONSTRAINT "user_addons_version_id_addon_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."addon_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addons_author_idx" ON "addons" USING btree ("author");--> statement-breakpoint
CREATE INDEX "addons_public_idx" ON "addons" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "addons_updated_idx" ON "addons" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "addons_popularity_idx" ON "addons" USING btree ("total_downloads");--> statement-breakpoint
CREATE INDEX "addon_versions_addon_id_idx" ON "addon_versions" USING btree ("addon_id");--> statement-breakpoint
CREATE INDEX "addon_versions_created_at_idx" ON "addon_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "addon_versions_downloads_idx" ON "addon_versions" USING btree ("download_count");--> statement-breakpoint
CREATE INDEX "addon_versions_stable_idx" ON "addon_versions" USING btree ("addon_id","is_beta");--> statement-breakpoint
CREATE INDEX "addon_versions_latest_stable_idx" ON "addon_versions" USING btree ("addon_id","is_beta","created_at");--> statement-breakpoint
CREATE INDEX "user_component_prefs_user_addon_idx" ON "user_component_preferences" USING btree ("user_addon_id");--> statement-breakpoint
CREATE INDEX "user_addon_user_idx" ON "user_addons" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_addon_addon_idx" ON "user_addons" USING btree ("addon_id");--> statement-breakpoint
CREATE INDEX "user_addon_version_idx" ON "user_addons" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "user_addon_recent_idx" ON "user_addons" USING btree ("user_id","connected_at");--> statement-breakpoint
CREATE INDEX "user_addon_usage_idx" ON "user_addons" USING btree ("addon_id","last_used_at");--> statement-breakpoint
CREATE INDEX "user_component_prefs_lookup_idx" ON "user_component_preferences" USING btree ("user_id","user_addon_id","component_name");--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "unique_addon_name" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "addon_versions" ADD CONSTRAINT "unique_addon_version" UNIQUE("addon_id","version");--> statement-breakpoint
ALTER TABLE "user_component_preferences" ADD CONSTRAINT "unique_user_addon_component" UNIQUE("user_id","user_addon_id","component_name");--> statement-breakpoint
ALTER TABLE "user_addons" ADD CONSTRAINT "unique_user_addon" UNIQUE("user_id","addon_id");--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "valid_github_url" CHECK ("addons"."github_url" ~ '^https://github.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+/?$');--> statement-breakpoint
ALTER TABLE "user_addons" ADD CONSTRAINT "valid_user_id" CHECK ("user_addons"."user_id" ~ '^kp_[a-f0-9]{32}$');