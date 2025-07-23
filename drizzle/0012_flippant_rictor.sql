CREATE TABLE "user_component_preferences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"user_repository_id" uuid NOT NULL,
	"component_name" varchar(200) NOT NULL,
	"enabled" jsonb DEFAULT 'true'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_repo_component" UNIQUE("user_id","user_repository_id","component_name"),
	CONSTRAINT "valid_user_id" CHECK ("user_component_preferences"."user_id" ~ '^kp_[a-f0-9]{32}$')
);
--> statement-breakpoint
ALTER TABLE "user_component_preferences" ADD CONSTRAINT "user_component_preferences_user_repository_id_user_repositories_id_fk" FOREIGN KEY ("user_repository_id") REFERENCES "public"."user_repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_component_prefs_user_idx" ON "user_component_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_component_prefs_user_repo_idx" ON "user_component_preferences" USING btree ("user_repository_id");--> statement-breakpoint
CREATE INDEX "user_component_prefs_component_idx" ON "user_component_preferences" USING btree ("component_name");--> statement-breakpoint
CREATE INDEX "user_component_prefs_lookup_idx" ON "user_component_preferences" USING btree ("user_id","user_repository_id","component_name");