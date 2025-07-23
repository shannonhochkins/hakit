CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"github_url" varchar(500) NOT NULL,
	"description" text,
	"author" varchar(100) NOT NULL,
	"deprecated" jsonb DEFAULT 'false'::jsonb NOT NULL,
	"is_public" jsonb DEFAULT 'true'::jsonb NOT NULL,
	"last_updated" timestamp,
	"total_downloads" integer DEFAULT 0 NOT NULL,
	"latest_version" varchar(50),
	"component_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_repo_name" UNIQUE("name"),
	CONSTRAINT "unique_github_url" UNIQUE("github_url"),
	CONSTRAINT "valid_github_url" CHECK ("repositories"."github_url" ~ '^https://github.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+/?$'),
	CONSTRAINT "valid_repo_name" CHECK ("repositories"."name" ~ '^[a-zA-Z0-9_-]+$')
);
--> statement-breakpoint
CREATE TABLE "repository_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"repository_id" uuid NOT NULL,
	"version" varchar(50) NOT NULL,
	"component_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"manifest_url" varchar(500),
	"release_notes" text,
	"is_prerelease" jsonb DEFAULT 'false'::jsonb NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_repo_version" UNIQUE("repository_id","version"),
	CONSTRAINT "valid_version" CHECK ("repository_versions"."version" ~ '^[0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9.-]+)?(+[a-zA-Z0-9.-]+)?$')
);
--> statement-breakpoint
CREATE TABLE "user_repositories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"repository_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "unique_user_repo" UNIQUE("user_id","repository_id"),
	CONSTRAINT "valid_user_id" CHECK ("user_repositories"."user_id" ~ '^kp_[a-f0-9]{32}$')
);
--> statement-breakpoint
ALTER TABLE "repository_versions" ADD CONSTRAINT "repository_versions_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_repositories" ADD CONSTRAINT "user_repositories_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_repositories" ADD CONSTRAINT "user_repositories_version_id_repository_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."repository_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "repositories_author_idx" ON "repositories" USING btree ("author");--> statement-breakpoint
CREATE INDEX "repositories_public_idx" ON "repositories" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "repositories_active_idx" ON "repositories" USING btree ("deprecated");--> statement-breakpoint
CREATE INDEX "repositories_updated_idx" ON "repositories" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "repositories_popularity_idx" ON "repositories" USING btree ("total_downloads");--> statement-breakpoint
CREATE INDEX "repositories_components_idx" ON "repositories" USING gin ("component_names");--> statement-breakpoint
CREATE INDEX "repo_versions_repo_id_idx" ON "repository_versions" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "repo_versions_created_at_idx" ON "repository_versions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "repo_versions_downloads_idx" ON "repository_versions" USING btree ("download_count");--> statement-breakpoint
CREATE INDEX "repo_versions_stable_idx" ON "repository_versions" USING btree ("repository_id","is_prerelease");--> statement-breakpoint
CREATE INDEX "repo_versions_latest_stable_idx" ON "repository_versions" USING btree ("repository_id","is_prerelease","created_at");--> statement-breakpoint
CREATE INDEX "user_repo_user_idx" ON "user_repositories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_repo_repo_idx" ON "user_repositories" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "user_repo_version_idx" ON "user_repositories" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "user_repo_recent_idx" ON "user_repositories" USING btree ("user_id","connected_at");--> statement-breakpoint
CREATE INDEX "user_repo_usage_idx" ON "user_repositories" USING btree ("repository_id","last_used_at");--> statement-breakpoint
CREATE INDEX "dashboard_user_updated_idx" ON "dashboard" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "pages_updated_idx" ON "pages" USING btree ("updated_at");