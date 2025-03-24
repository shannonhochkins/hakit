import { sql } from "drizzle-orm";

import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { dashboardTable, pagesTable } from './db';

export const puckObjectZodSchema = z.object({
  type: z.string(),
  props: z.object({}).passthrough(),
});

export const puckDataZodSchema = z.object({
  zones: z.record(z.array(puckObjectZodSchema)),
  content: z.array(puckObjectZodSchema),
  root: puckObjectZodSchema.omit({
    type: true
  })
})

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


// Zod schemas for inserts & selects, no payload for creation, we use defaults in this case, maybe this needs a "theme" input one day?
export const insertDashboardSchema = createInsertSchema(dashboardTable).pick({
  name: true,
  path: true,
  data: true,
});

export const updateDashboardSchema = createUpdateSchema(dashboardTable).pick({
  name: true,
  path: true,
  data: true,
  themeId: true,
})
