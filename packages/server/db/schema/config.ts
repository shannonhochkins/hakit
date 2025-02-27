// db/schema/config.ts

import { pgTable, serial, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const configTable = pgTable("config", {
  id: serial("id").primaryKey(),

  /**
   * 1) Ties this configuration to a user by ID, referencing the users table.
   *    Because usersTable.id is a primary key, Drizzle allows this reference.
   */
  userId: serial("id").primaryKey(),

  /**
   * 3) The JSON blob for the config. We'll use the "jsonb" column type.
   */
  config: jsonb("config").notNull(),

  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// Zod schemas for inserts & selects
export const insertConfigSchema = createInsertSchema(configTable, {
  config: z.object({
    userId: z.string(),
    config: z.object({
      theme: z.string(),
    }),
  }),
});
export const selectConfigSchema = createSelectSchema(configTable, {
  userId: z.string(),
}).pick({
  userId: true,
});

