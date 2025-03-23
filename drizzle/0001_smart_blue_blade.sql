ALTER TABLE "pages" DROP CONSTRAINT "pages_dashboard_id_dashboard_id_fk";
--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_dashboard_id_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."dashboard"("id") ON DELETE cascade ON UPDATE no action;