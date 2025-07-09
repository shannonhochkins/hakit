import { pgTable, varchar, unique, jsonb, check, index, timestamp, uuid, text, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
    breakpoints: jsonb('breakpoints').notNull().default({}),
    // optional thumbnail path or URL
    thumbnail: varchar('thumbnail', { length: 255 }),
    // any data to store against the dashboard, basically global settings
    data: jsonb('data').notNull(),
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
    // the data for the page in the format of puck data
    data: jsonb('data').notNull(),
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
    // Composite unique constraint: ensures each dashboard's page paths are unique.
    unique('unique_dashboard_page_path').on(table.dashboardId, table.path),
    // Index for dashboard pages lookup
    index('pages_dashboard_id_idx').on(table.dashboardId),
    // Index for recently updated pages
    index('pages_updated_idx').on(table.updatedAt),
  ]
);

// ----------------------
// REPOSITORY SYSTEM - Component Repository Management
// ----------------------

/* ------------------------------------------------------------------
   GLOBAL REPOSITORIES CATALOGUE
-------------------------------------------------------------------*/
export const repositoriesTable = pgTable(
  'repositories',
  {
    id: uuid('id').primaryKey().notNull(),
    // Repository name (globally unique, user-friendly identifier)
    name: varchar('name', { length: 100 }).notNull(),
    // GitHub repository URL (the source of truth)
    githubUrl: varchar('github_url', { length: 500 }).notNull(),
    // Repository description from package.json or GitHub
    description: text('description'),
    // Repository author/organization from GitHub
    author: varchar('author', { length: 100 }).notNull(),
    // Repository status
    deprecated: jsonb('deprecated').notNull().default(false),
    // Repository visibility
    isPublic: jsonb('is_public').notNull().default(true),
    // Repository metadata
    lastUpdated: timestamp('last_updated'),
    // Computed/cached fields for search performance
    totalDownloads: integer('total_downloads').notNull().default(0),
    latestVersion: varchar('latest_version', { length: 50 }),
    componentNames: jsonb('component_names')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [
    // Repository names must be globally unique
    unique('unique_repo_name').on(table.name),
    // GitHub URLs must be unique (one repo = one entry)
    unique('unique_github_url').on(table.githubUrl),
    // Index for searching by author
    index('repositories_author_idx').on(table.author),
    // Index for public repositories (for browsing/discovery)
    index('repositories_public_idx').on(table.isPublic),
    // Index for non-deprecated repositories
    index('repositories_active_idx').on(table.deprecated),
    // Index for recently updated repositories
    index('repositories_updated_idx').on(table.lastUpdated),
    // Index for search by popularity
    index('repositories_popularity_idx').on(table.totalDownloads),
    // Index for component name searches (GIN index for JSONB)
    index('repositories_components_idx').using('gin', table.componentNames),
    // Validate GitHub URL format
    check('valid_github_url', sql`${table.githubUrl} ~ '^https://github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+/?$'`),
    // Validate repository name (alphanumeric, hyphens, underscores)
    check('valid_repo_name', sql`${table.name} ~ '^[a-zA-Z0-9_-]+$'`),
  ]
);

/* ------------------------------------------------------------------
   REPOSITORY VERSIONS - Immutable version snapshots
-------------------------------------------------------------------*/
export const repositoryVersionsTable = pgTable(
  'repository_versions',
  {
    id: uuid('id').primaryKey().notNull(),
    // Reference to the parent repository
    repositoryId: uuid('repository_id')
      .references(() => repositoriesTable.id, { onDelete: 'cascade' })
      .notNull(),
    // Version string from package.json (semantic versioning)
    version: varchar('version', { length: 50 }).notNull(),
    // Snapshot of component names available in this version
    componentNames: jsonb('component_names')
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // URL to the manifest.json file in the cloud (CDN, S3, etc.)
    manifestUrl: varchar('manifest_url', { length: 500 }),
    // Version metadata
    releaseNotes: text('release_notes'),
    isPrerelease: jsonb('is_prerelease').notNull().default(false),
    downloadCount: integer('download_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => [
    // Versions must be unique per repository
    unique('unique_repo_version').on(table.repositoryId, table.version),
    // Index for repository lookups
    index('repo_versions_repo_id_idx').on(table.repositoryId),
    // Index for version ordering (newest first)
    index('repo_versions_created_at_idx').on(table.createdAt),
    // Index for popular versions (by download count)
    index('repo_versions_downloads_idx').on(table.downloadCount),
    // Index for release versions (excluding prereleases)
    index('repo_versions_stable_idx').on(table.repositoryId, table.isPrerelease),
    // Composite index for finding latest stable version per repo
    index('repo_versions_latest_stable_idx').on(table.repositoryId, table.isPrerelease, table.createdAt),
    // Validate semantic version format
    check('valid_version', sql`${table.version} ~ '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$'`),
  ]
);

/* ------------------------------------------------------------------
   USER ↔ REPOSITORIES - User's connected repositories with active versions
-------------------------------------------------------------------*/
export const userRepositoriesTable = pgTable(
  'user_repositories',
  {
    id: uuid('id').primaryKey().notNull(),
    // User ID from Kinde authentication
    userId: varchar('user_id', { length: 50 }).notNull(),
    // Reference to the global repository
    repositoryId: uuid('repository_id')
      .references(() => repositoriesTable.id, { onDelete: 'cascade' })
      .notNull(),
    // Currently active version for this user
    versionId: uuid('version_id')
      .references(() => repositoryVersionsTable.id, { onDelete: 'restrict' })
      .notNull(),
    // Connection timestamps
    connectedAt: timestamp('connected_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
  },
  table => [
    // Enforce "one active version per repo per user"
    unique('unique_user_repo').on(table.userId, table.repositoryId),
    // Index for user's repository lookups (most common query)
    index('user_repo_user_idx').on(table.userId),
    // Index for repository usage analytics
    index('user_repo_repo_idx').on(table.repositoryId),
    // Index for version lookups
    index('user_repo_version_idx').on(table.versionId),
    // Index for recently connected repositories per user
    index('user_repo_recent_idx').on(table.userId, table.connectedAt),
    // Index for active users per repository (for analytics)
    index('user_repo_usage_idx').on(table.repositoryId, table.lastUsedAt),
    // Validate user ID format (Kinde format)
    check('valid_user_id', sql`${table.userId} ~ '^kp_[a-f0-9]{32}$'`),
  ]
);
