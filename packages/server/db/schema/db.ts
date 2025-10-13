import { pgTable, varchar, unique, jsonb, check, index, timestamp, uuid, text, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { Json } from 'drizzle-zod';
import type { BreakpointItem } from '@typings/breakpoints';

// ----------------------
// DASHBOARD TABLE - multiple dashboards per user
// ----------------------
export const dashboardTable = pgTable(
  'dashboard',
  {
    id: uuid().primaryKey(),
    // the name of the dashboard
    name: varchar('name', { length: 100 }).notNull(),
    // the route name used to access the dashboard
    path: varchar('path', { length: 50 }).notNull(),
    // the user id of the dashboard owner
    userId: varchar('user_id', { length: 50 }).notNull(),
    // breakpoints for the dashboard as json
    breakpoints: jsonb('breakpoints').$type<BreakpointItem[]>().notNull().default([]),
    // optional thumbnail path or URL
    thumbnail: varchar('thumbnail', { length: 255 }),
    // any data to store against the dashboard, basically global settings
    data: jsonb('data').$type<Json>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow().notNull(),
  },
  table => [
    index('dashboard_user_id_idx').on(table.userId),
    // Composite unique constraint: no duplicate path per user.
    unique('unique_user_path').on(table.userId, table.path),
    // Index for recently updated dashboards per user
    index('dashboard_user_updated_idx').on(table.userId, table.updatedAt),
    // Enforces that path contains only lowercase letters, digits, and dashes.
    check('valid_path', sql`${table.path} ~ '^[a-z0-9-]+$'`),
    check('valid_user_id', sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  ]
);

// Page Configurations table – each config can have many pages
export const pagesTable = pgTable(
  'pages',
  {
    id: uuid().primaryKey().notNull(),
    // the name of the page
    name: varchar('name', { length: 100 }).notNull(),
    // the route name used to access the page
    path: varchar('path', { length: 50 }).notNull(),
    // the data for the page in the format of puck data (stored as text to preserve undefined values in breakpoints)
    data: text('data').notNull(),
    // the dashboard id that this page belongs to
    dashboardId: uuid('dashboard_id')
      .references(() => dashboardTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    // optional thumbnail path or URL
    thumbnail: varchar('thumbnail', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow().notNull(),
  },
  table => [
    // Enforces that path contains only lowercase letters, digits, and dashes.
    check('valid_path', sql`${table.path} ~ '^[a-z0-9-]+$'`),
    // Ensures data is valid JSON (even though stored as text)
    check('valid_json_data', sql`${table.data}::json IS NOT NULL`),
    // Composite unique constraint: ensures each dashboard's page paths are unique.
    unique('unique_dashboard_page_path').on(table.dashboardId, table.path),
    // Index for dashboard pages lookup
    index('pages_dashboard_id_idx').on(table.dashboardId),
    // Index for recently updated pages
    index('pages_updated_idx').on(table.updatedAt),
  ]
);

// ----------------------
// ADDON SYSTEM - Component Addon Management
// ----------------------

/* ------------------------------------------------------------------
   GLOBAL ADDONS CATALOGUE
-------------------------------------------------------------------*/
export const addonsTable = pgTable(
  'addons',
  {
    id: uuid('id').primaryKey().notNull(),
    // Addon name (globally unique, user-friendly identifier)
    name: varchar('name', { length: 100 }).notNull(),
    // GitHub repository URL (the source of truth)
    githubUrl: varchar('github_url', { length: 500 }).notNull(),
    // Addon description from package.json or GitHub
    description: text('description'),
    // Addon author/organization from GitHub
    author: varchar('author', { length: 100 }).notNull(),
    // Addon visibility
    isPublic: jsonb('is_public').notNull().default(true),
    // Addon metadata
    lastUpdated: timestamp('last_updated'),
    // Computed/cached fields for search performance
    totalDownloads: integer('total_downloads').notNull().default(0),
    latestVersion: varchar('latest_version', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    // Addon names must be globally unique
    unique('unique_addon_name').on(table.name),
    // GitHub URLs must be unique (one addon = one entry)
    unique('unique_github_url').on(table.githubUrl),
    // Index for searching by author
    index('addons_author_idx').on(table.author),
    // Index for public addons (for browsing/discovery)
    index('addons_public_idx').on(table.isPublic),
    // Index for recently updated addons
    index('addons_updated_idx').on(table.lastUpdated),
    // Index for search by popularity
    index('addons_popularity_idx').on(table.totalDownloads),
    // Validate GitHub URL format
    check('valid_github_url', sql`${table.githubUrl} ~ '^https://github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+/?$'`),
  ]
);

/* ------------------------------------------------------------------
   ADDON VERSIONS - Immutable version snapshots
-------------------------------------------------------------------*/
export const addonVersionsTable = pgTable(
  'addon_versions',
  {
    id: uuid('id').primaryKey().notNull(),
    // Reference to the parent addon
    addonId: uuid('addon_id')
      .references(() => addonsTable.id, { onDelete: 'cascade' })
      .notNull(),
    // Version string from package.json (semantic versioning)
    version: varchar('version', { length: 50 }).notNull(),
    // Array of component objects with name and enabled status
    components: jsonb('components')
      .$type<Array<{ name: string }>>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // URL to the manifest.json file in the cloud (CDN, S3, etc.) - REQUIRED
    manifestUrl: varchar('manifest_url', { length: 500 }).notNull(),
    // Version metadata
    releaseNotesUrl: varchar('release_notes_url', { length: 500 }),
    isBeta: jsonb('is_beta').notNull().default(false),
    downloadCount: integer('download_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    // Versions must be unique per addon
    unique('unique_addon_version').on(table.addonId, table.version),
    // Index for addon lookups
    index('addon_versions_addon_id_idx').on(table.addonId),
    // Index for version ordering (newest first)
    index('addon_versions_created_at_idx').on(table.createdAt),
    // Index for popular versions (by download count)
    index('addon_versions_downloads_idx').on(table.downloadCount),
    // Index for release versions (excluding betas)
    index('addon_versions_stable_idx').on(table.addonId, table.isBeta),
    // Composite index for finding latest stable version per addon
    index('addon_versions_latest_stable_idx').on(table.addonId, table.isBeta, table.createdAt),
  ]
);

/* ------------------------------------------------------------------
   USER ↔ ADDONS - User's connected addons with active versions
-------------------------------------------------------------------*/
export const userAddonsTable = pgTable(
  'user_addons',
  {
    id: uuid('id').primaryKey().notNull(),
    // User ID from Kinde authentication
    userId: varchar('user_id', { length: 50 }).notNull(),
    // Reference to the global addon
    addonId: uuid('addon_id')
      .references(() => addonsTable.id, { onDelete: 'cascade' })
      .notNull(),
    // Currently active version for this user
    versionId: uuid('version_id')
      .references(() => addonVersionsTable.id, { onDelete: 'restrict' })
      .notNull(),
    // Connection timestamps
    connectedAt: timestamp('connected_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
  },
  table => [
    // Enforce "one active version per addon per user"
    unique('unique_user_addon').on(table.userId, table.addonId),
    // Index for user's addon lookups (most common query)
    index('user_addon_user_idx').on(table.userId),
    // Index for addon usage analytics
    index('user_addon_addon_idx').on(table.addonId),
    // Index for version lookups
    index('user_addon_version_idx').on(table.versionId),
    // Index for recently connected addons per user
    index('user_addon_recent_idx').on(table.userId, table.connectedAt),
    // Index for active users per addon (for analytics)
    index('user_addon_usage_idx').on(table.addonId, table.lastUsedAt),
    // Validate user ID format (Kinde format)
    check('valid_user_id', sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  ]
);

/* ------------------------------------------------------------------
   USER ADDON PREFERENCES - User's addon enable/disable preferences
-------------------------------------------------------------------*/
export const userComponentPreferencesTable = pgTable(
  'user_component_preferences',
  {
    id: uuid('id').primaryKey().notNull(),
    // User ID from Kinde authentication
    userId: varchar('user_id', { length: 50 }).notNull(),
    // Reference to the user addon
    userAddonId: uuid('user_addon_id')
      .references(() => userAddonsTable.id, { onDelete: 'cascade' })
      .notNull(),
    // Component name
    componentName: varchar('component_name', { length: 200 }).notNull(),
    // Whether the component is enabled for this user
    enabled: jsonb('enabled').notNull().default(true),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    // Enforce "one preference per component per user addon"
    unique('unique_user_addon_component').on(table.userId, table.userAddonId, table.componentName),
    // Index for user's component preferences (most common query)
    index('user_component_prefs_user_idx').on(table.userId),
    // Index for user addon lookups
    index('user_component_prefs_user_addon_idx').on(table.userAddonId),
    // Index for component name lookups
    index('user_component_prefs_component_idx').on(table.componentName),
    // Composite index for user + addon + component lookups
    index('user_component_prefs_lookup_idx').on(table.userId, table.userAddonId, table.componentName),
    // Validate user ID format (Kinde format)
    check('valid_user_id', sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  ]
);
