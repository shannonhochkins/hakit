ALTER TABLE "dashboard" DROP CONSTRAINT "dashboard_theme_id_themes_id_fk";
--> statement-breakpoint
DROP INDEX "dashboard_theme_id_idx";--> statement-breakpoint
ALTER TABLE "dashboard" DROP COLUMN "theme_id";