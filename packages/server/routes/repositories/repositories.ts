import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { repositoriesTable, repositoryVersionsTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';

const repositoriesRoute = new Hono()
  // Get all public repositories (for browsing/discovery)
  .get('/', async c => {
    try {
      const repositories = await db
        .select()
        .from(repositoriesTable)
        .where(eq(repositoriesTable.isPublic, true))
        .orderBy(desc(repositoriesTable.totalDownloads));
      return c.json({ repositories }, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Error fetching repositories', error), 400);
    }
  })

  // Get a specific repository by ID
  .get(
    '/:id',
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const { id } = c.req.valid('param');

        const [repository] = await db
          .select()
          .from(repositoriesTable)
          .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.isPublic, true)));

        if (!repository) {
          throw new Error(`Repository not found with id ${id}`);
        }

        return c.json({ repository }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching repository', error), 400);
      }
    }
  )

  // Get all versions for a specific repository
  .get(
    '/:id/versions',
    zValidator(
      'param',
      z.object({
        id: z.string(),
      })
    ),
    async c => {
      try {
        const { id } = c.req.valid('param');

        // First verify the repository exists and is public
        const [repository] = await db
          .select()
          .from(repositoriesTable)
          .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.isPublic, true)));

        if (!repository) {
          throw new Error(`Repository not found with id ${id}`);
        }

        const versions = await db
          .select()
          .from(repositoryVersionsTable)
          .where(eq(repositoryVersionsTable.repositoryId, id))
          .orderBy(desc(repositoryVersionsTable.createdAt));

        return c.json({ versions }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching repository versions', error), 400);
      }
    }
  )

  // Get a specific version for a specific repository
  .get(
    '/:id/versions/:version',
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

        // First verify the repository exists and is public
        const [repository] = await db
          .select()
          .from(repositoriesTable)
          .where(and(eq(repositoriesTable.id, id), eq(repositoriesTable.isPublic, true)));

        if (!repository) {
          throw new Error(`Repository not found with id ${id}`);
        }

        // Get the specific version
        const [repositoryVersion] = await db
          .select()
          .from(repositoryVersionsTable)
          .where(and(eq(repositoryVersionsTable.repositoryId, id), eq(repositoryVersionsTable.version, version)))
          .limit(1);

        if (!repositoryVersion) {
          throw new Error(`Version ${version} not found for repository ${id}`);
        }

        return c.json({ version: repositoryVersion }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching repository version', error), 400);
      }
    }
  );

export default repositoriesRoute;
