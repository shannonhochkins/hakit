import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc, ilike, or, sql, count, type SQL } from 'drizzle-orm';
import { addonsTable, addonVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod/v4';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';
import { describeRoute } from 'hono-openapi';

const searchRoute = new Hono()
  // Unified search endpoint - handles both search and popular/recent addons
  .get(
    '/',
    describeRoute({ description: 'Search addons', tags: ['Addons'], responses: { 200: { description: 'OK' } } }),
    zValidator(
      'query',
      z.object({
        q: z.string().optional(), // Optional - if empty, returns popular addons
        limit: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val) : 20)),
        offset: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val) : 0)),
        sortBy: z.enum(['popularity', 'updated']).optional().prefault('popularity'),
      })
    ),
    async c => {
      try {
        const { q, limit, offset, sortBy } = c.req.valid('query');

        // Build the base where clause for addons
        let addonWhereClause: SQL<unknown> = eq(addonsTable.isPublic, true);

        // Add search conditions if query is provided
        if (q && q.trim().length > 0) {
          const searchTerm = q.trim();
          const searchConditions = and(
            eq(addonsTable.isPublic, true),
            or(
              ilike(addonsTable.name, `%${searchTerm}%`),
              ilike(addonsTable.description, `%${searchTerm}%`),
              ilike(addonsTable.author, `%${searchTerm}%`),
              ilike(addonsTable.githubUrl, `%${searchTerm}%`),
              // Search in component names from addon versions
              sql`EXISTS (
                SELECT 1 FROM ${addonVersionsTable} rv
                WHERE rv.addon_id = ${addonsTable.id}
                AND EXISTS (
                  SELECT 1 FROM jsonb_array_elements(rv.components) AS component
                  WHERE component->>'name' ILIKE ${'%' + searchTerm + '%'}
                )
              )`
            )
          );
          if (searchConditions) {
            addonWhereClause = searchConditions;
          }
        }

        // Get total count for pagination
        const totalCountResult = await db.select({ count: count() }).from(addonsTable).where(addonWhereClause);

        const totalCount = totalCountResult[0]?.count || 0;

        // Build the order by clause
        let orderByClause;
        if (sortBy === 'popularity') {
          orderByClause = [desc(addonsTable.totalDownloads), desc(addonsTable.lastUpdated)];
        } else {
          orderByClause = [desc(addonsTable.lastUpdated), desc(addonsTable.totalDownloads)];
        }

        // Query addons with their latest versions in a single query
        const addonsWithLatestVersions = await db
          .select({
            addon: addonsTable,
            version: addonVersionsTable,
          })
          .from(addonsTable)
          .innerJoin(
            addonVersionsTable,
            and(eq(addonVersionsTable.addonId, addonsTable.id), eq(addonVersionsTable.version, addonsTable.latestVersion))
          )
          .where(addonWhereClause)
          .orderBy(...orderByClause)
          .limit(limit)
          .offset(offset);

        return c.json(
          {
            addons: addonsWithLatestVersions,
            pagination: {
              limit,
              offset,
              hasQuery: !!q,
              total: totalCount,
              hasMore: offset + limit < totalCount,
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error searching addons', error), 400);
      }
    }
  );

export default searchRoute;
