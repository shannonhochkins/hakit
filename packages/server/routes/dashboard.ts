import { Hono } from 'hono';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { pagesTable, dashboardTable } from '../db/schema/db';
import { insertDashboardSchema, insertDashboardPageSchema, updateDashboardPageSchema, updateDashboardSchema } from '../db/schema/schemas';
import { zValidator } from '@hono/zod-validator';
import { getUser } from '../kinde';
import { z } from 'zod/v4';
import type { PuckPageData } from '@typings/puck';
import { serializeWithUndefined, deserializePageData } from '../../shared/helpers/customSerialize';
import { formatErrorResponse } from '../helpers/formatErrorResponse';
import { describeRoute } from 'hono-openapi';
import { format404Response } from '../helpers/format404Response';
import { generateId } from '../../shared/helpers/generateId';

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

function createDefaultPageConfiguration(): PuckPageData {
  return {
    zones: {},
    content: [],
    root: {
      props: {},
    },
  };
}

const dashboardRoute = new Hono()
  // get a full dashboard object without the page data
  .get(
    '/:dashboardPath',
    describeRoute({ description: 'Get dashboard without page data', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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

        // First get the dashboard
        const [dashboard] = await db
          .select()
          .from(dashboardTable)
          .where(and(eq(dashboardTable.path, dashboardPath), eq(dashboardTable.userId, user.id)));

        if (!dashboard) {
          return c.json(format404Response('dashboard-not-found', { dashboardPath }), 404);
        }

        // Then get the pages separately (without data)
        const pages = await db
          .select({
            id: pagesTable.id,
            name: pagesTable.name,
            thumbnail: pagesTable.thumbnail,
            updatedAt: pagesTable.updatedAt,
            createdAt: pagesTable.createdAt,
            path: pagesTable.path,
            dashboardId: pagesTable.dashboardId,
          })
          .from(pagesTable)
          .where(eq(pagesTable.dashboardId, dashboard.id));

        const dashboardWithPages = {
          ...dashboard,
          pages,
        };

        return c.json(
          {
            dashboard: dashboardWithPages,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  .get(
    '/:dashboardPath/data',
    describeRoute({ description: 'Get dashboard with page data', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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

        // First get the dashboard
        const [dashboard] = await db
          .select()
          .from(dashboardTable)
          .where(and(eq(dashboardTable.path, dashboardPath), eq(dashboardTable.userId, user.id)));

        if (!dashboard) {
          return c.json(format404Response('dashboard-not-found', { dashboardPath }), 404);
        }

        // Then get the pages separately
        const pages = await db
          .select({
            id: pagesTable.id,
            name: pagesTable.name,
            thumbnail: pagesTable.thumbnail,
            updatedAt: pagesTable.updatedAt,
            createdAt: pagesTable.createdAt,
            path: pagesTable.path,
            data: pagesTable.data,
            dashboardId: pagesTable.dashboardId,
          })
          .from(pagesTable)
          .where(eq(pagesTable.dashboardId, dashboard.id));
        // Deserialize page data from JSON strings
        const pagesWithDeserializedData = pages.map(page => ({
          ...page,
          data: deserializePageData(page.data),
        }));

        const dashboardWithPages = {
          ...dashboard,
          pages: pagesWithDeserializedData,
        };

        return c.json(
          {
            dashboard: dashboardWithPages,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // get a full page object with the data
  .get(
    '/:id/page/:pageId',
    describeRoute({ description: 'Get a page with data', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          return c.json(format404Response('dashboard-has-no-pages'), 404);
        }
        const [page] = await db
          .select()
          .from(pagesTable)
          .where(and(eq(pagesTable.id, pageId), eq(pagesTable.dashboardId, id)));

        if (!page) {
          return c.json(format404Response('page-not-found', { dashboardPath: id, pagePath: pageId }), 404);
        }

        return c.json(
          {
            page: {
              ...page,
              data: deserializePageData(page.data),
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // get all dashboards and pages without the page data
  .get(
    '/',
    describeRoute({ description: 'List dashboards', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
    getUser,
    async c => {
      try {
        const user = c.var.user;

        // Get all dashboards
        const dashboards = await db.select().from(dashboardTable).where(eq(dashboardTable.userId, user.id));

        // Get pages for each dashboard and combine them
        const dashboardsWithPages = await Promise.all(
          dashboards.map(async dashboard => {
            const pages = await db
              .select({
                id: pagesTable.id,
                name: pagesTable.name,
                thumbnail: pagesTable.thumbnail,
                updatedAt: pagesTable.updatedAt,
                createdAt: pagesTable.createdAt,
                path: pagesTable.path,
                dashboardId: pagesTable.dashboardId,
              })
              .from(pagesTable)
              .where(eq(pagesTable.dashboardId, dashboard.id));

            return {
              ...dashboard,
              pages,
            };
          })
        );

        return c.json(
          {
            dashboards: dashboardsWithPages,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // delete a dashboard
  .delete(
    '/:id',
    describeRoute({ description: 'Delete dashboard', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
    describeRoute({ description: 'Delete a page', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          return c.json(format404Response('dashboard-not-found', { dashboardPath: id }), 404);
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
    describeRoute({ description: 'Update a page', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          throw new Error('No dashboard id provided');
        }
        if (!pageId) {
          throw new Error('No page id provided');
        }
        const dashboards = await db
          .select({
            id: dashboardTable.id,
          })
          .from(dashboardTable)
          .where(and(eq(dashboardTable.id, id), eq(dashboardTable.userId, user.id)));
        if (!dashboards.length) {
          return c.json(format404Response('dashboard-not-found', { dashboardPath: id }), 404);
        }
        const [dashboard] = dashboards;
        const [pageRecord] = await db
          .update(pagesTable)
          .set({
            name: data.name,
            path: data.path,
            thumbnail: data.thumbnail,
            data: data.data ? serializeWithUndefined(data.data) : undefined,
          })
          .where(and(eq(pagesTable.dashboardId, dashboard.id), eq(pagesTable.id, pageId)))
          .returning();

        return c.json(
          {
            page: {
              ...pageRecord,
              data: pageRecord.data ? deserializePageData(pageRecord.data) : undefined,
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // update a dashboard
  .put(
    '/:id',
    describeRoute({ description: 'Update dashboard', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
        return c.json(
          {
            dashboard: dashboardRecord,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // create a new dashboard with a default page
  .post(
    '/',
    describeRoute({
      description: 'Create dashboard (with default page)',
      tags: ['Dashboard'],
      responses: { 201: { description: 'Created' } },
    }),
    getUser,
    zValidator('json', insertDashboardSchema),
    async c => {
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
            data: serializeWithUndefined(createDefaultPageConfiguration()),
          })
          .returning();

        return c.json(
          {
            dashboard: {
              ...dashboardRecord,
              pages: [
                {
                  ...page,
                  data: deserializePageData(page.data),
                },
              ],
            },
          },
          201
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // create a new page for a dashboard
  .post(
    '/:id/page',
    describeRoute({ description: 'Create a page', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          return c.json(format404Response('dashboard-not-found', { dashboardPath: id }), 404);
        }
        const [dashboard] = dashboards;
        const defaultPage = await getAvailableDefaultPage(dashboard.id);
        const pageData = data ?? createDefaultPageConfiguration();
        const serializedData = serializeWithUndefined(pageData);

        const [pageRecord] = await db
          .insert(pagesTable)
          .values({
            id: generateId(),
            dashboardId: dashboard.id,
            name: name ?? defaultPage.name,
            path: path ?? defaultPage.path,
            data: serializedData,
            thumbnail: thumbnail || null,
          })
          .returning();
        return c.json(
          {
            page: {
              ...pageRecord,
              data: deserializePageData(pageRecord.data),
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // duplicate a dashboard with all its pages
  .post(
    '/:id/duplicate',
    describeRoute({ description: 'Duplicate dashboard', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          return c.json(format404Response('dashboard-not-found', { dashboardPath: id }), 404);
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
          newPages.push({
            ...newPage,
            data: deserializePageData(newPage.data),
          });
        }

        return c.json(
          {
            dashboard: {
              ...newDashboard,
              pages: newPages,
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  )
  // duplicate a page within the same dashboard
  .post(
    '/:id/page/:pageId/duplicate',
    describeRoute({ description: 'Duplicate a page', tags: ['Dashboard'], responses: { 200: { description: 'OK' } } }),
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
          return c.json(format404Response('dashboard-not-found', { dashboardPath: id }), 404);
        }

        // Get the original page
        const [originalPage] = await db
          .select()
          .from(pagesTable)
          .where(and(eq(pagesTable.id, pageId), eq(pagesTable.dashboardId, id)));

        if (!originalPage) {
          return c.json(format404Response('page-not-found', { dashboardPath: id, pagePath: pageId }), 404);
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

        return c.json(
          {
            page: {
              ...newPage,
              data: deserializePageData(newPage.data),
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error', error), 400);
      }
    }
  );

export default dashboardRoute;
