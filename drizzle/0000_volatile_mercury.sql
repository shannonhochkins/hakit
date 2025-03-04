CREATE TABLE "dashboard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"path" varchar(50) NOT NULL,
	"user_id" varchar(50) NOT NULL,
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
ALTER TABLE "pages" ADD CONSTRAINT "pages_dashboard_id_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboard"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pages_dashboard_id_idx" ON "pages" USING btree ("dashboard_id");