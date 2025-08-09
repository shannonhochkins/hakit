import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc, ilike, or, sql, count, type SQL } from 'drizzle-orm';
import { repositoriesTable, repositoryVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod/v4';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';
import { describeRoute } from 'hono-openapi';

const searchRoute = new Hono()
  // Unified search endpoint - handles both search and popular/recent repositories
  .get(
    '/',
    describeRoute({ description: 'Search repositories', tags: ['Repositories'], responses: { 200: { description: 'OK' } } }),
    zValidator(
      'query',
      z.object({
        q: z.string().optional(), // Optional - if empty, returns popular repositories
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

        // Build the base where clause for repositories
        let repositoryWhereClause: SQL<unknown> = eq(repositoriesTable.isPublic, true);

        // Add search conditions if query is provided
        if (q && q.trim().length > 0) {
          const searchTerm = q.trim();
          const searchConditions = and(
            eq(repositoriesTable.isPublic, true),
            or(
              ilike(repositoriesTable.name, `%${searchTerm}%`),
              ilike(repositoriesTable.description, `%${searchTerm}%`),
              ilike(repositoriesTable.author, `%${searchTerm}%`),
              ilike(repositoriesTable.githubUrl, `%${searchTerm}%`),
              // Search in component names from repository versions
              sql`EXISTS (
                SELECT 1 FROM ${repositoryVersionsTable} rv
                WHERE rv.repository_id = ${repositoriesTable.id}
                AND EXISTS (
                  SELECT 1 FROM jsonb_array_elements(rv.components) AS component
                  WHERE component->>'name' ILIKE ${'%' + searchTerm + '%'}
                )
              )`
            )
          );
          if (searchConditions) {
            repositoryWhereClause = searchConditions;
          }
        }

        // Get total count for pagination
        const totalCountResult = await db.select({ count: count() }).from(repositoriesTable).where(repositoryWhereClause);

        const totalCount = totalCountResult[0]?.count || 0;

        // Build the order by clause
        let orderByClause;
        if (sortBy === 'popularity') {
          orderByClause = [desc(repositoriesTable.totalDownloads), desc(repositoriesTable.lastUpdated)];
        } else {
          orderByClause = [desc(repositoriesTable.lastUpdated), desc(repositoriesTable.totalDownloads)];
        }

        // Query repositories with their latest versions in a single query
        const repositoriesWithLatestVersions = await db
          .select({
            repository: repositoriesTable,
            version: repositoryVersionsTable,
          })
          .from(repositoriesTable)
          .innerJoin(
            repositoryVersionsTable,
            and(
              eq(repositoryVersionsTable.repositoryId, repositoriesTable.id),
              eq(repositoryVersionsTable.version, repositoriesTable.latestVersion)
            )
          )
          .where(repositoryWhereClause)
          .orderBy(...orderByClause)
          .limit(limit)
          .offset(offset);

        return c.json(
          {
            repositories: repositoriesWithLatestVersions,
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
        return c.json(formatErrorResponse('Error searching repositories', error), 400);
      }
    }
  );

export default searchRoute;
