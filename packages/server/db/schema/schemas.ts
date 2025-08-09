import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { dashboardTable, pagesTable } from './db';

export const puckObjectZodSchema = z.object({
  type: z.string(),
  props: z.looseObject({}),
  readOnly: z.record(z.string(), z.union([z.boolean(), z.undefined()])).optional(), // Allow boolean | undefined
});

export const puckDataZodSchema = z.object({
  zones: z.record(z.string(), z.array(puckObjectZodSchema)).optional(), // Make zones optional
  content: z.array(puckObjectZodSchema),
  root: z.object({
    props: z.looseObject({}).optional(), // Make props optional
    readOnly: z.record(z.string(), z.union([z.boolean(), z.undefined()])).optional(), // Allow boolean | undefined
  }),
});

// Zod schemas for inserts & selects, no payload for creation, we use defaults in this case, maybe this needs a "theme" input one day?
const dashboardSchema = createInsertSchema(dashboardTable);
export const insertDashboardSchema = dashboardSchema
  .pick({
    name: true,
    path: true,
    data: true,
    thumbnail: true,
  })
  .extend({
    data: dashboardSchema.shape.data.optional(),
    thumbnail: dashboardSchema.shape.thumbnail.optional(),
  });

export const updateDashboardSchema = createUpdateSchema(dashboardTable)
  .pick({
    name: true,
    path: true,
    data: true,
    breakpoints: true,
    thumbnail: true,
  })
  .extend({
    breakpoints: dashboardSchema.shape.breakpoints.optional(),
    data: dashboardSchema.shape.data.optional(),
    thumbnail: dashboardSchema.shape.thumbnail.optional(),
  });

const dashboardPageSchema = createInsertSchema(pagesTable);
export const insertDashboardPageSchema = dashboardPageSchema
  .pick({
    name: true,
    path: true,
    data: true,
    thumbnail: true,
  })
  .extend({
    data: puckDataZodSchema.optional(),
    thumbnail: dashboardPageSchema.shape.thumbnail.optional(),
  });

export const updateDashboardPageSchema = createUpdateSchema(pagesTable)
  .pick({
    name: true,
    path: true,
    data: true,
    thumbnail: true,
  })
  .extend({
    data: puckDataZodSchema.optional(), // Accept either string (serialized) or object
    thumbnail: dashboardPageSchema.shape.thumbnail.optional(),
  });
