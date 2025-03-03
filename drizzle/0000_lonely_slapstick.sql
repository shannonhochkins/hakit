CREATE TABLE "config" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"config_schema_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_configurations" (
	"id" text PRIMARY KEY NOT NULL,
	"config_schema_id" integer NOT NULL,
	"config" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"config_schema_id" integer PRIMARY KEY NOT NULL,
	"hue" integer NOT NULL,
	"saturation" integer NOT NULL,
	"lightness" integer NOT NULL,
	"tint" real NOT NULL,
	"dark_mode" boolean NOT NULL,
	"contrast_threshold" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viewports" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"width" integer NOT NULL,
	"disabled" boolean NOT NULL,
	"config_schema_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_config_schema_id_config_id_fk" FOREIGN KEY ("config_schema_id") REFERENCES "public"."config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_configurations" ADD CONSTRAINT "page_configurations_config_schema_id_config_id_fk" FOREIGN KEY ("config_schema_id") REFERENCES "public"."config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_config_schema_id_config_id_fk" FOREIGN KEY ("config_schema_id") REFERENCES "public"."config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewports" ADD CONSTRAINT "viewports_config_schema_id_config_id_fk" FOREIGN KEY ("config_schema_id") REFERENCES "public"."config"("id") ON DELETE no action ON UPDATE no action;