import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { dashboardTable, pagesTable } from './db';

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
const dashboardSchema = createInsertSchema(dashboardTable);
export const insertDashboardSchema = dashboardSchema.pick({
  name: true,
  path: true,
  data: true,
  thumbnail: true,
})
.extend({
  data: dashboardSchema.shape.data.optional(),
  thumbnail: dashboardSchema.shape.thumbnail.optional(),
});

export const updateDashboardSchema = createUpdateSchema(dashboardTable).pick({
  name: true,
  path: true,
  data: true,
  themeId: true,
  breakpoints: true,
  thumbnail: true,
}).extend({
  breakpoints: dashboardSchema.shape.breakpoints.optional(),
  data: dashboardSchema.shape.data.optional(),
  thumbnail: dashboardSchema.shape.thumbnail.optional(),
});

const dashboardPageSchema = createInsertSchema(pagesTable);
export const insertDashboardPageSchema = dashboardPageSchema.pick({
  name: true,
  path: true,
  data: true,
  thumbnail: true,
})
.extend({
  data: dashboardPageSchema.shape.data.optional(),
  thumbnail: dashboardSchema.shape.thumbnail.optional(),
});