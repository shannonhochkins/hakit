import { Hono } from 'hono';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { pagesTable, dashboardTable } from '../db/schema/db';
import {
  insertDashboardSchema,
  insertDashboardPageSchema,
  updateDashboardPageSchema,
  puckDataZodSchema,
  updateDashboardSchema,
} from '../db/schema/schemas';
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../kinde';
import { z } from 'zod';
import type { PuckPageData } from '../../../typings/puck';
import type { DashboardPageWithData, DashboardWithoutPageData, DashboardWithPageData } from '../../../typings/dashboard';
import type { Json } from '@kinde-oss/kinde-typescript-sdk';
import { formatErrorResponse } from '../helpers/formatErrorResponse';

// Predefined default pages
const defaultPages = [
  { name: 'Living Room', path: 'living-room' },
  { name: 'Office', path: 'office' },
  { name: 'Kitchen', path: 'kitchen' },
  { name: 'Dining Room', path: 'dining-room' },
  { name: 'Front Yard', path: 'front-yard' },
  { name: 'Back Yard', path: 'back-yard' },
  { name: 'Garden', path: 'garden' },
  { name: 'Energy', path: 'energy' },
  { name: 'Music', path: 'music' },
  { name: 'Weather', path: 'weather' },
  { name: 'Security', path: 'security' },
  { name: 'Climate', path: 'climate' },
  { name: 'Garage', path: 'garage' },
  { name: 'Pool', path: 'pool' },
  { name: 'Spa', path: 'spa' },
  { name: 'Sauna', path: 'sauna' },
  { name: 'Bathroom', path: 'bathroom' },
  { name: 'Bedroom', path: 'bedroom' },
  { name: 'Guest Room', path: 'guest-room' },
  { name: 'Kids Room', path: 'kids-room' },
  { name: 'Library', path: 'library' },
  { name: 'Gym', path: 'gym' },
  { name: 'Cinema', path: 'cinema' },
  { name: 'Games Room', path: 'games-room' },
  { name: 'Master Bedroom', path: 'master-bedroom' },
  { name: 'Patio', path: 'patio' },
  { name: 'Balcony', path: 'balcony' },
  { name: 'Terrace', path: 'terrace' },
  { name: 'Deck', path: 'deck' },
];

async function getAvailableDefaultPage(dashboardId: string) {
  // Get all page paths for the dashboard.
  const pages = await db.select({ path: pagesTable.path }).from(pagesTable).where(eq(pagesTable.dashboardId, dashboardId));

  const usedPaths = pages.map(p => p.path);

  // Find the first candidate not already used.
  for (const candidate of defaultPages) {
    if (!usedPaths.includes(candidate.path)) {
      return candidate;
    }
  }

  throw new Error('No available default page names left for this dashboard.');
}

const generateId = (type?: string | number) => (type ? `${type}-${uuidv4()}` : uuidv4());

function createDefaultPageConfiguration(): PuckPageData {
  return {
    zones: {},
    content: [],
    root: {
      props: {},
    },
  };
}

function sanitizePuckData(data: Json) {
  return puckDataZodSchema.parse(data);
}

const dashboardRoute = new Hono()
  // get a full dashboard object without the data
  .get(
    '/:dashboardPath',
    getUser,
    zValidator(
      'param',
      z.object({
        dashboardPath: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { dashboardPath } = c.req.valid('param');
        const dashboards = await db
          .select({
            id: dashboardTable.id,
            name: dashboardTable.name,
            path: dashboardTable.path,
            data: dashboardTable.data,
            breakpoints: dashboardTable.breakpoints,
            thumbnail: dashboardTable.thumbnail,
            createdAt: dashboardTable.createdAt,
            updatedAt: dashboardTable.updatedAt,
            pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'updatedAt', ${pagesTable.updatedAt},
                'createdAt', ${pagesTable.createdAt},
                'thumbnail', ${pagesTable.thumbnail},
                'path', ${pagesTable.path}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`,
          })
          .from(dashboardTable)
          .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
          .where(and(eq(dashboardTable.path, dashboardPath), eq(dashboardTable.userId, user.id)))
          .groupBy(dashboardTable.id);
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with path ${dashboardPath}`);
        }
        return c.json(dashboards[0] as unknown as DashboardWithoutPageData, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  .get(
    '/:dashboardPath/data',
    getUser,
    zValidator(
      'param',
      z.object({
        dashboardPath: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { dashboardPath } = c.req.valid('param');
        const dashboards = await db
          .select({
            id: dashboardTable.id,
            name: dashboardTable.name,
            path: dashboardTable.path,
            data: dashboardTable.data,
            breakpoints: dashboardTable.breakpoints,
            thumbnail: dashboardTable.thumbnail,
            createdAt: dashboardTable.createdAt,
            updatedAt: dashboardTable.updatedAt,
            pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'thumbnail', ${pagesTable.thumbnail},
                'updatedAt', ${pagesTable.updatedAt},
                'createdAt', ${pagesTable.createdAt},
                'path', ${pagesTable.path},
                'data', ${pagesTable.data}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`,
          })
          .from(dashboardTable)
          .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
          .where(and(eq(dashboardTable.path, dashboardPath), eq(dashboardTable.userId, user.id)))
          .groupBy(dashboardTable.id);
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with path ${dashboardPath}`);
        }
        return c.json(dashboards[0] as unknown as DashboardWithPageData, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // get a full page object with the data
  .get(
    '/:id/page/:pageId',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
        pageId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { id, pageId } = c.req.valid('param');
        // find the dashboard to get the id
        const dashboards = await db
          .select({
            id: dashboardTable.id,
          })
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        // simply to validate that we're requesting by the right user
        // we don't use dashboards at all here, as there's no connection to a page and a user
        // we just need to check that the dashboard exists for this user
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with id ${id}`);
        }
        const [page] = await db
          .select()
          .from(pagesTable)
          .where(and(eq(pagesTable.id, pageId), eq(pagesTable.dashboardId, id)));
        return c.json(page as unknown as DashboardPageWithData, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // get all dashboards and pages without the page data
  .get('/', getUser, async c => {
    try {
      const user = c.var.user;
      const dashboards = await db
        .select({
          id: dashboardTable.id,
          name: dashboardTable.name,
          path: dashboardTable.path,
          data: dashboardTable.data,
          breakpoints: dashboardTable.breakpoints,
          thumbnail: dashboardTable.thumbnail,
          createdAt: dashboardTable.createdAt,
          updatedAt: dashboardTable.updatedAt,
          pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'updatedAt', ${pagesTable.updatedAt},
                'createdAt', ${pagesTable.createdAt},
                'thumbnail', ${pagesTable.thumbnail},
                'path', ${pagesTable.path}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`,
        })
        .from(dashboardTable)
        .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
        .where(eq(dashboardTable.userId, user.id))
        .groupBy(dashboardTable.id);
      // have to cast here as the sql function is not typed
      return c.json(dashboards as unknown as DashboardWithoutPageData[], 200);
    } catch (error) {
      return c.json(formatErrorResponse('Error', error), 400);
    }
  })
  // delete a dashboard
  .delete(
    '/:id',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { id } = c.req.valid('param');
        await db.delete(dashboardTable).where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        return c.json(
          {
            message: 'Dashboard deleted successfully',
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // delete a dashboard page
  .delete(
    '/:id/page/:pageId',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
        pageId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { id, pageId } = c.req.valid('param');
        // find the dashboard to get the id
        const dashboards = await db
          .select({
            id: dashboardTable.id,
          })
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with id ${id}`);
        }
        const [dashboard] = dashboards;
        await db.delete(pagesTable).where(and(eq(pagesTable.id, pageId), eq(pagesTable.dashboardId, dashboard.id)));
        return c.json(
          {
            message: 'Dashboard page deleted successfully',
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // update a dashboard page
  .put(
    '/:id/page/:pageId',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
        pageId: z.string(),
      })
    ),
    zValidator('json', updateDashboardPageSchema),
    async c => {
      try {
        const user = c.var.user;
        const data = await c.req.valid('json');
        const { id, pageId } = c.req.valid('param');

        if (!id) {
          throw new Error('No dashboard path provided');
        }
        if (!pageId) {
          throw new Error('No page path provided');
        }
        const dashboards = await db
          .select({
            id: dashboardTable.id,
          })
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with id ${id}`);
        }
        const [dashboard] = dashboards;
        const [pageRecord] = await db
          .update(pagesTable)
          .set({
            name: data.name,
            path: data.path,
            thumbnail: data.thumbnail,
            data: data.data ? sanitizePuckData(data.data) : undefined,
          })
          .where(and(eq(pagesTable.dashboardId, dashboard.id), eq(pagesTable.id, pageId)))
          .returning();
        return c.json(pageRecord, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // update a dashboard
  .put(
    '/:id',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    zValidator('json', updateDashboardSchema),
    async c => {
      try {
        const user = c.var.user;
        const data = await c.req.valid('json');
        const params = c.req.valid('param');

        if (!params.id) {
          throw new Error('No dashboard ID provided');
        }
        const [dashboardRecord] = await db
          .update(dashboardTable)
          .set({
            name: data.name,
            path: data.path,
            data: data.data,
            breakpoints: data.breakpoints,
            thumbnail: data.thumbnail,
          })
          .where(and(eq(dashboardTable.id, params.id), eq(dashboardTable.userId, user.id)))
          .returning();
        return c.json(dashboardRecord, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // create a new dashboard with a default page
  .post('/', getUser, zValidator('json', insertDashboardSchema), async c => {
    try {
      const user = c.var.user;
      const { data = {}, name, path, thumbnail } = await c.req.valid('json');
      const [dashboardRecord] = await db
        .insert(dashboardTable)
        .values({
          id: generateId(),
          userId: user.id,
          name,
          path,
          // TODO - Sanitize input data
          data,
          thumbnail: thumbnail,
        })
        .returning();

      const defaultPage = await getAvailableDefaultPage(dashboardRecord.id);

      const [page] = await db
        .insert(pagesTable)
        .values({
          id: generateId(),
          dashboardId: dashboardRecord.id,
          name: defaultPage.name,
          path: defaultPage.path,
          data: createDefaultPageConfiguration(),
        })
        .returning();
      // TODO - Fix this mess
      const dashboard = dashboardRecord as unknown as DashboardWithPageData;
      dashboard.pages = [page as unknown as DashboardPageWithData];

      return c.json(dashboard, 201);
    } catch (error) {
      return c.json(formatErrorResponse('Error', error), 400);
    }
  })
  // create a new page for a dashboard
  .post(
    '/:id/page',
    getUser,
    zValidator('json', insertDashboardPageSchema),
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        // get the id from the path
        const { id } = c.req.valid('param');
        const { name, path, data, thumbnail } = await c.req.valid('json');
        // find the dashboard to get the id
        const dashboards = await db
          .select({
            id: dashboardTable.id,
          })
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        if (!dashboards.length) {
          throw new Error(`Dashboard not found with id ${id}`);
        }
        const [dashboard] = dashboards;
        const defaultPage = await getAvailableDefaultPage(dashboard.id);
        const [pageRecord] = await db
          .insert(pagesTable)
          .values({
            id: generateId(),
            dashboardId: dashboard.id,
            name: name ?? defaultPage.name,
            path: path ?? defaultPage.path,
            data: data ?? createDefaultPageConfiguration(),
            thumbnail: thumbnail || null,
          })
          .returning();
        return c.json(pageRecord, 201);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // duplicate a dashboard with all its pages
  .post(
    '/:id/duplicate',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    zValidator(
      'json',
      z.object({
        name: z.string(),
        path: z.string(),
        thumbnail: z.string().nullable().optional(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { id } = c.req.valid('param');
        const { name, path, thumbnail } = await c.req.valid('json');

        // Get the original dashboard with its pages
        const [originalDashboard] = await db
          .select()
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));

        if (!originalDashboard) {
          throw new Error(`Dashboard not found with id ${id}`);
        }

        const originalPages = await db.select().from(pagesTable).where(eq(pagesTable.dashboardId, id));

        // Create the new dashboard
        const [newDashboard] = await db
          .insert(dashboardTable)
          .values({
            id: generateId(),
            userId: user.id,
            name,
            path,
            data: originalDashboard.data,
            breakpoints: originalDashboard.breakpoints,
            thumbnail: thumbnail || originalDashboard.thumbnail,
          })
          .returning();

        // Duplicate all pages
        const newPages = [];
        for (const page of originalPages) {
          const [newPage] = await db
            .insert(pagesTable)
            .values({
              id: generateId(),
              dashboardId: newDashboard.id,
              name: page.name,
              path: page.path,
              data: page.data,
              thumbnail: page.thumbnail,
            })
            .returning();
          newPages.push(newPage);
        }

        // Return the new dashboard with its pages
        const dashboard = newDashboard as unknown as DashboardWithPageData;
        dashboard.pages = newPages as unknown as DashboardPageWithData[];

        return c.json(dashboard, 201);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // duplicate a page within the same dashboard
  .post(
    '/:id/page/:pageId/duplicate',
    getUser,
    zValidator(
      'param',
      z.object({
        id: z.string(),
        pageId: z.string(),
      })
    ),
    zValidator(
      'json',
      z.object({
        name: z.string(),
        path: z.string(),
        thumbnail: z.string().nullable().optional(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { id, pageId } = c.req.valid('param');
        const { name, path, thumbnail } = await c.req.valid('json');

        // Verify dashboard ownership
        const [dashboard] = await db
          .select()
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));

        if (!dashboard) {
          throw new Error(`Dashboard not found with id ${id}`);
        }

        // Get the original page
        const [originalPage] = await db
          .select()
          .from(pagesTable)
          .where(and(eq(pagesTable.id, pageId), eq(pagesTable.dashboardId, id)));

        if (!originalPage) {
          throw new Error(`Page not found with id ${pageId}`);
        }

        // Create the duplicate page
        const [newPage] = await db
          .insert(pagesTable)
          .values({
            id: generateId(),
            dashboardId: id,
            name,
            path,
            data: originalPage.data,
            thumbnail: thumbnail || originalPage.thumbnail,
          })
          .returning();

        return c.json(newPage, 201);
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  );

export default dashboardRoute;
