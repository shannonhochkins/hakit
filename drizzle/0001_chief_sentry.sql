CREATE TABLE "components" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"version" varchar(50),
	"theme_id" uuid,
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_component_name" UNIQUE("user_id","name"),
	CONSTRAINT "valid_user_id" CHECK ("components"."user_id" ~ '^kp_[a-f0-9]{32}$')
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"version" varchar(50) NOT NULL,
	"thumbnail" varchar(255),
	"data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_theme_name_version" UNIQUE("user_id","name","version"),
	CONSTRAINT "valid_user_id" CHECK ("themes"."user_id" ~ '^kp_[a-f0-9]{32}$')
);
--> statement-breakpoint
ALTER TABLE "dashboard" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "components_user_id_idx" ON "components" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "components_theme_id_idx" ON "components" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "themes_user_id_idx" ON "themes" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "dashboard" ADD CONSTRAINT "dashboard_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dashboard_theme_id_idx" ON "dashboard" USING btree ("theme_id");