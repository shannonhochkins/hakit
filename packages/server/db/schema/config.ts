// db/schema/config.ts

import { pgTable, serial, text, real, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const puckObjectZodSchema = z.object({
  type: z.string(),
  props: z.object({}).passthrough(),
});

export const pageConfigurationZodSchema = z.object({
  id: z.number(),
  config: z.object({
    zones: z.record(z.array(puckObjectZodSchema)),
    content: z.array(puckObjectZodSchema),
    root: puckObjectZodSchema.omit({
      type: true
    })
  }),
});

export const configZodSchema = z.object({
  pageConfigurations: z.array(pageConfigurationZodSchema),
  config: z.object({
    dashboards: z.array(z.object({
      title: z.string(),
      id: z.number(),
    })),
    viewports: z.array(z.object({
      label: z.string(),
      width: z.number(),
      disabled: z.boolean(),
    })),
    theme: z.object({
      hue: z.number().min(0).max(360).default(220),
      saturation: z.number().min(0).max(100).default(60),
      lightness: z.number().min(0).max(100).default(54),
      tint: z.number().min(0).max(1).default(0.8),
      darkMode: z.boolean().default(true),
      contrastThreshold: z.number().min(0).max(100).default(65),
    }).strict(),
  }).strict()
}).strict();

export const configTable = pgTable("config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),

  userId: text("user_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// Dashboards table – multiple dashboards per config schema
export const dashboardsTable = pgTable("dashboards", {
  id: serial("id").primaryKey(), // Using the provided dashboard id (string)
  title: text("title").notNull(),
  configSchemaId: integer("config_schema_id")
    .references(() => configTable.id)
    .notNull(),
});

// Viewports table – multiple viewports per config schema
export const viewportsTable = pgTable("viewports", {
  label: text("label").notNull(),
  width: integer("width").notNull(),
  disabled: boolean("disabled").notNull(),
  configSchemaId: integer("config_schema_id")
    .references(() => configTable.id)
    .notNull(),
});

// Theme table – one theme per config schema (one-to-one relationship)
export const themesTable = pgTable("themes", {
  configSchemaId: integer("config_schema_id")
    .references(() => configTable.id)
    .primaryKey(),
  hue: integer("hue").notNull(), // 0-360
  saturation: integer("saturation").notNull(), // 0-100
  lightness: integer("lightness").notNull(), // 0-100
  tint: real("tint").notNull(), // 0-1
  darkMode: boolean("dark_mode").notNull(),
  contrastThreshold: integer("contrast_threshold").notNull(), // 0-100
});

// Page Configurations table – each config can have many pages
// Here, we store the nested configuration (zones, content, root) as one JSONB blob.
export const pageConfigurationsTable = pgTable("page_configurations", {
  id: serial("id").primaryKey(), 
  configSchemaId: integer("config_schema_id")
    .references(() => configTable.id)
    .notNull(),
  // The entire page configuration as JSON. It should match the structure:
  // {
  //   zones: { [key: string]: Array<PuckObject> },
  //   content: Array<PuckObject>,
  // }
  config: jsonb("config").notNull(),
});
// Zod schemas for inserts & selects, no payload for creation, we use defaults in this case, maybe this needs a "theme" input one day?
export const insertConfigSchema = createInsertSchema(configTable).pick({
  name: true,
});

export const updateConfigSchema = createUpdateSchema(configTable);


