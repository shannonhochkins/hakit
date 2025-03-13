CREATE TABLE "components" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"version" varchar(50),
	"theme_id" uuid,
	"upload_type" varchar(10),
	"objectKey" varchar(250) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_component_name" UNIQUE("user_id","name"),
	CONSTRAINT "valid_user_id" CHECK ("components"."user_id" ~ '^kp_[a-f0-9]{32}$'),
	CONSTRAINT "valid_component_upload_type" CHECK ("components"."upload_type" = 'zip' OR "components"."upload_type" = 'github')
);
--> statement-breakpoint
CREATE TABLE "dashboard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"path" varchar(50) NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"theme_id" uuid,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_path" UNIQUE("user_id","path"),
	CONSTRAINT "valid_path" CHECK ("dashboard"."path" ~ '^[a-z0-9-]+$'),
	CONSTRAINT "valid_user_id" CHECK ("dashboard"."user_id" ~ '^kp_[a-f0-9]{32}$')
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"path" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"dashboard_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_dashboard_page_path" UNIQUE("dashboard_id","path"),
	CONSTRAINT "valid_path" CHECK ("pages"."path" ~ '^[a-z0-9-]+$')
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"version" varchar(50) NOT NULL,
	"thumbnail" varchar(255),
	"objectKey" varchar(250) NOT NULL,
	"upload_type" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_theme_name_version" UNIQUE("user_id","name","version"),
	CONSTRAINT "valid_user_id" CHECK ("themes"."user_id" ~ '^kp_[a-f0-9]{32}$'),
	CONSTRAINT "valid_theme_upload_type" CHECK ("themes"."upload_type" = 'zip' OR "themes"."upload_type" = 'github')
);
--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard" ADD CONSTRAINT "dashboard_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_dashboard_id_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboard"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "components_user_id_idx" ON "components" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "components_theme_id_idx" ON "components" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "dashboard_theme_id_idx" ON "dashboard" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "pages_dashboard_id_idx" ON "pages" USING btree ("dashboard_id");--> statement-breakpoint
CREATE INDEX "themes_user_id_idx" ON "themes" USING btree ("user_id");