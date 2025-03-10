import { pgTable, varchar, unique, jsonb, check, index, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ----------------------
// DASHBOARD TABLE - multiple dashboards per user
// ----------------------
export const dashboardTable = pgTable("dashboard", {
  id: uuid().primaryKey(),
  // the name of the dashboard
  name: varchar("name", { length: 100 }).notNull(),
  // the route name used to access the dashboard
  path: varchar("path", { length: 50 }).notNull(),
  // the user id of the dashboard owner
  userId: varchar("user_id", { length: 50 }).notNull(),
  // Optionally link a theme to a dashboard
  themeId: uuid("theme_id").references(() => themesTable.id),
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
  index("dashboard_theme_id_idx").on(table.themeId),
]);

// ----------------------
// THEMES TABLE
// ----------------------
export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().notNull(),
  // the user id of the theme owner
  userId: varchar("user_id", { length: 50 }).notNull(),
  // the name of the theme
  name: varchar("name", { length: 100 }).notNull(),
  // version of the theme
  version: varchar("version", { length: 50 }).notNull(),
  // optional thumbnail path or URL
  thumbnail: varchar("thumbnail", { length: 255 }),
  // optional extra metadata or JSON structure if needed
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
}, table => [
  // A user may choose to keep multiple versions of a theme with the same name,
  // so you may or may not want to enforce uniqueness. 
  // If you do want to enforce uniqueness of (userId, name, version):
  unique("unique_user_theme_name_version").on(table.userId, table.name, table.version),
  check("valid_user_id", sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  index("themes_user_id_idx").on(table.userId),
]);

// ----------------------
// COMPONENTS TABLE
// ----------------------
export const componentsTable = pgTable("components", {
  id: uuid("id").primaryKey().notNull(),
  // The user who owns this component
  userId: varchar("user_id", { length: 50 }).notNull(),
  // The name of the component
  name: varchar("name", { length: 100 }).notNull(),
  // Optional version (if relevant to how you manage components)
  version: varchar("version", { length: 50 }),
  // If the component is part of a theme, store the theme id
  themeId: uuid("theme_id").references(() => themesTable.id),
  // Optionally store metadata
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
}, table => [
  // enforce unique naming per user
  unique("unique_user_component_name").on(table.userId, table.name),
  check("valid_user_id", sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  index("components_user_id_idx").on(table.userId),
  index("components_theme_id_idx").on(table.themeId),
]);

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
