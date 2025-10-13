import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { addonsTable, addonVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod/v4';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';
import { describeRoute } from 'hono-openapi';

const addonsRoute = new Hono()
  // Get all public addons (for browsing/discovery)
  .get('/', describeRoute({ description: 'List public addons', tags: ['Addons'], responses: { 200: { description: 'OK' } } }), async c => {
    try {
      const addons = await db.select().from(addonsTable).where(eq(addonsTable.isPublic, true)).orderBy(desc(addonsTable.totalDownloads));
      return c.json({ addons }, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Error fetching addons', error), 400);
    }
  })

  // Get a specific addon by ID
  .get(
    '/:id',
    describeRoute({ description: 'Get addon by ID', tags: ['Addons'], responses: { 200: { description: 'OK' } } }),
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const { id } = c.req.valid('param');

        const [addon] = await db
          .select()
          .from(addonsTable)
          .where(and(eq(addonsTable.id, id), eq(addonsTable.isPublic, true)));

        if (!addon) {
          throw new Error(`Addon not found with id ${id}`);
        }

        return c.json({ addon }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching addon', error), 400);
      }
    }
  )

  // Get all versions for a specific addon
  .get(
    '/:id/versions',
    describeRoute({ description: 'List addon versions', tags: ['Addons'], responses: { 200: { description: 'OK' } } }),
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const { id } = c.req.valid('param');

        // First verify the addon exists and is public
        const [addon] = await db
          .select()
          .from(addonsTable)
          .where(and(eq(addonsTable.id, id), eq(addonsTable.isPublic, true)));

        if (!addon) {
          throw new Error(`Addon not found with id ${id}`);
        }

        const versions = await db
          .select()
          .from(addonVersionsTable)
          .where(eq(addonVersionsTable.addonId, id))
          .orderBy(desc(addonVersionsTable.createdAt));

        return c.json({ versions }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching addon versions', error), 400);
      }
    }
  )

  // Get a specific version for a specific addon
  .get(
    '/:id/versions/:version',
    describeRoute({ description: 'Get a addon version', tags: ['Addons'], responses: { 200: { description: 'OK' } } }),
    zValidator(
      'param',
      z.object({
        id: z.string(),
        version: z.string(),
      })
    ),
    async c => {
      try {
        const { id, version } = c.req.valid('param');

        // First verify the addon exists and is public
        const [addon] = await db
          .select()
          .from(addonsTable)
          .where(and(eq(addonsTable.id, id), eq(addonsTable.isPublic, true)));

        if (!addon) {
          throw new Error(`Addon not found with id ${id}`);
        }

        // Get the specific version
        const [addonVersion] = await db
          .select()
          .from(addonVersionsTable)
          .where(and(eq(addonVersionsTable.addonId, id), eq(addonVersionsTable.version, version)))
          .limit(1);

        if (!addonVersion) {
          throw new Error(`Version ${version} not found for addon ${id}`);
        }

        return c.json({ version: addonVersion }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching addon version', error), 400);
      }
    }
  );

export default addonsRoute;
