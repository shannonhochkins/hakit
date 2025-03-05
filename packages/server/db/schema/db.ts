// db/schema/config.ts

import { pgTable, varchar, unique, jsonb, check, index, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
// import { z } from "zod";

// export const puckObjectZodSchema = z.object({
//   type: z.string(),
//   props: z.object({}).passthrough(),
// });

// export const pageConfigurationZodSchema = z.object({
//   id: z.number(),
//   config: z.object({
//     zones: z.record(z.array(puckObjectZodSchema)),
//     content: z.array(puckObjectZodSchema),
//     root: puckObjectZodSchema.omit({
//       type: true
//     })
//   }),
// });

// export const configZodSchema = z.object({
//   pageConfigurations: z.array(pageConfigurationZodSchema),
//   config: z.object({
//     pages: z.array(z.object({
//       title: z.string(),
//       id: z.number(),
//     })),
//     viewports: z.array(z.object({
//       label: z.string(),
//       width: z.number(),
//       disabled: z.boolean(),
//     })),
//     theme: z.object({
//       hue: z.number().min(0).max(360).default(220),
//       saturation: z.number().min(0).max(100).default(60),
//       lightness: z.number().min(0).max(100).default(54),
//       tint: z.number().min(0).max(1).default(0.8),
//       darkMode: z.boolean().default(true),
//       contrastThreshold: z.number().min(0).max(100).default(65),
//     }).strict(),
//   }).strict()
// }).strict();

// there can be many dashboards per user
export const dashboardTable = pgTable("dashboard", {
  id: uuid().primaryKey(),
  // the name of the dashboard
  name: varchar("name", { length: 100 }).notNull(),
  // the route name used to access the dashboard
  path: varchar("path", { length: 50 }).notNull(),
  // the user id of the dashboard owner
  userId: varchar("user_id", { length: 50 }).notNull(),
  // any data to store against the dashboard, basically global settings
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
}, table => [
  // Composite unique constraint: no duplicate path per user.
  unique("unique_user_path").on(table.userId, table.path),
  // Enforces that path contains only lowercase letters, digits, and dashes.
  check("valid_path", sql`${table.path} ~ '^[a-z0-9-]+$'`),
  check("valid_user_id", sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
]);

export const themesTable = pgTable("themes", {
  id: uuid().primaryKey().notNull(),
  // the name of the theme
  name: varchar("name", { length: 100 }).notNull(),
});

export const components = pgTable("components", {
  id: uuid().primaryKey().notNull(),
  // the name of the theme
  name: varchar("name", { length: 100 }).notNull(),
});

// Page Configurations table – each config can have many pages
export const pagesTable = pgTable("pages", {
  id: uuid().primaryKey().notNull(),
  // the name of the page
  name: varchar("name", { length: 100 }).notNull(),
  // the route name used to access the page
  path: varchar("path", { length: 50 }).notNull(),
  // the data for the page in the format of puck data
  data: jsonb("data").notNull(),
  // the dashboard id that this page belongs to
  dashboardId: uuid("dashboard_id")
    .references(() => dashboardTable.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
}, table => [
  // Enforces that path contains only lowercase letters, digits, and dashes.
  check("valid_path", sql`${table.path} ~ '^[a-z0-9-]+$'`),
  // Composite unique constraint: ensures each dashboard's page paths are unique.
  unique("unique_dashboard_page_path").on(table.dashboardId, table.path),
  index("pages_dashboard_id_idx").on(table.dashboardId),
]);

// Dashboards table – multiple dashboards per config schema
// export const pagesTable = pgTable("pages", {
//   id: serial("id").primaryKey(), // Using the provided dashboard id (string)
//   title: text("title").notNull(),
//   config: jsonb("config").notNull(),
// });

// // Viewports table – multiple viewports per config schema
// export const viewportsTable = pgTable("viewports", {
//   label: text("label").notNull(),
//   width: integer("width").notNull(),
//   disabled: boolean("disabled").notNull(),
//   dashboardId: integer("dashboard_id")
//     .references(() => dashboardTable.id)
//     .notNull(),
// });

// // Theme table – one theme per config schema (one-to-one relationship)
// export const themesTable = pgTable("themes", {
//   dashboardId: integer("dashboard_id")
//     .references(() => dashboardTable.id)
//     .primaryKey(),
//   hue: integer("hue").notNull(), // 0-360
//   saturation: integer("saturation").notNull(), // 0-100
//   lightness: integer("lightness").notNull(), // 0-100
//   tint: real("tint").notNull(), // 0-1
//   darkMode: boolean("dark_mode").notNull(),
//   contrastThreshold: integer("contrast_threshold").notNull(), // 0-100
// });


// Zod schemas for inserts & selects, no payload for creation, we use defaults in this case, maybe this needs a "theme" input one day?
// export const insertConfigSchema = createInsertSchema(dashboardTable).pick({
//   name: true,
// });

// export const updateConfigSchema = createUpdateSchema(dashboardTable);


