import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { dashboardTable } from './db';

export const puckObjectZodSchema = z.object({
  type: z.string(),
  props: z
    .object({})
    .passthrough()
    .transform(({ breakpoint, ...rest }) => rest), // omit `breakpoint`,
});

export const puckDataZodSchema = z.object({
  zones: z.record(z.array(puckObjectZodSchema)),
  content: z.array(puckObjectZodSchema),
  root: puckObjectZodSchema.omit({
    type: true
  })
})

// Zod schemas for inserts & selects, no payload for creation, we use defaults in this case, maybe this needs a "theme" input one day?
export const insertDashboardSchema = createInsertSchema(dashboardTable).pick({
  name: true,
  path: true,
  data: true,
});

const baseSchema = createInsertSchema(dashboardTable);
export const insertDashboardPageSchema = baseSchema.pick({
  name: true,
  path: true,
  data: true,
})
.extend({
  data: baseSchema.shape.data.optional(), // replace z.any() with actual type if known
});

export const updateDashboardSchema = createUpdateSchema(dashboardTable).pick({
  name: true,
  path: true,
  data: true,
  themeId: true,
  breakpoints: true,
})
