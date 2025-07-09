import { pgTable, varchar, unique, jsonb, check, index, timestamp, uuid } from 'drizzle-orm/pg-core';
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
    index('pages_dashboard_id_idx').on(table.dashboardId),
  ]
);
