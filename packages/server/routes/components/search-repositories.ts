import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc, ilike, or, sql, count } from 'drizzle-orm';
import { repositoriesTable, repositoryVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';

const searchRoute = new Hono()
  // Unified search endpoint - handles both search and popular/recent repositories
  .get(
    '/',
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
        sortBy: z.enum(['popularity', 'updated']).optional().default('popularity'),
      })
    ),
    async c => {
      try {
        const { q, limit, offset, sortBy } = c.req.valid('query');

        // Build the base where clause for repositories
        let repositoryWhereClause = and(eq(repositoriesTable.isPublic, true), eq(repositoriesTable.deprecated, false));

        // Add search conditions if query is provided
        if (q && q.trim().length > 0) {
          const searchTerm = q.trim();
          repositoryWhereClause = and(
            eq(repositoriesTable.isPublic, true),
            eq(repositoriesTable.deprecated, false),
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
            // Repository fields
            id: repositoriesTable.id,
            name: repositoriesTable.name,
            description: repositoriesTable.description,
            author: repositoriesTable.author,
            githubUrl: repositoriesTable.githubUrl,
            deprecated: repositoriesTable.deprecated,
            isPublic: repositoriesTable.isPublic,
            totalDownloads: repositoriesTable.totalDownloads,
            latestVersion: repositoriesTable.latestVersion,
            lastUpdated: repositoriesTable.lastUpdated,
            createdAt: repositoriesTable.createdAt,
            updatedAt: repositoriesTable.updatedAt,
            // Latest version fields
            versionId: repositoryVersionsTable.id,
            version: repositoryVersionsTable.version,
            components: repositoryVersionsTable.components,
            manifestUrl: repositoryVersionsTable.manifestUrl,
            releaseNotes: repositoryVersionsTable.releaseNotes,
            isPrerelease: repositoryVersionsTable.isPrerelease,
            downloadCount: repositoryVersionsTable.downloadCount,
            versionCreatedAt: repositoryVersionsTable.createdAt,
          })
          .from(repositoriesTable)
          .leftJoin(
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

        // Transform the results to match the expected structure
        const repositories = repositoriesWithLatestVersions.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          author: row.author,
          githubUrl: row.githubUrl,
          deprecated: row.deprecated,
          isPublic: row.isPublic,
          totalDownloads: row.totalDownloads,
          latestVersion: row.latestVersion,
          lastUpdated: row.lastUpdated?.toISOString() || null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          // Include latest version data
          latestVersionData: row.versionId
            ? {
                id: row.versionId,
                repositoryId: row.id,
                version: row.version || '',
                components: row.components || [],
                manifestUrl: row.manifestUrl || '',
                releaseNotes: row.releaseNotes,
                isPrerelease: row.isPrerelease,
                downloadCount: row.downloadCount || 0,
                createdAt: row.versionCreatedAt?.toISOString() || new Date().toISOString(),
              }
            : null,
        }));

        return c.json(
          {
            repositories,
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
