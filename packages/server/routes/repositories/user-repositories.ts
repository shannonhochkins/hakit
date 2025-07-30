import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { userRepositoriesTable, repositoriesTable, repositoryVersionsTable, userComponentPreferencesTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../../kinde';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';

const userRepositoriesRoute = new Hono()
  // Get user's connected repositories
  .get('/', getUser, async c => {
    try {
      const user = c.var.user;

      const userRepos = await db
        .select()
        .from(userRepositoriesTable)
        .innerJoin(repositoriesTable, eq(userRepositoriesTable.repositoryId, repositoriesTable.id))
        .innerJoin(repositoryVersionsTable, eq(userRepositoriesTable.versionId, repositoryVersionsTable.id))
        .where(eq(userRepositoriesTable.userId, user.id))
        .orderBy(desc(userRepositoriesTable.connectedAt));

      // Get all component preferences for this user in one query
      const componentPreferences = await db
        .select()
        .from(userComponentPreferencesTable)
        .where(eq(userComponentPreferencesTable.userId, user.id));

      // Create a map of component preferences by userRepositoryId -> componentName -> enabled
      const prefsMap = new Map<string, Map<string, boolean>>();
      for (const pref of componentPreferences) {
        if (!prefsMap.has(pref.userRepositoryId)) {
          prefsMap.set(pref.userRepositoryId, new Map());
        }
        prefsMap.get(pref.userRepositoryId)!.set(pref.componentName, Boolean(pref.enabled));
      }

      // Transform to spread user repository fields at top level with nested repository
      const transformedRepos = userRepos.map(row => {
        const userRepoPrefs = prefsMap.get(row.user_repositories.id) || new Map();

        // Filter out components that no longer exist in the current version
        const validComponents = row.repository_versions.components.filter(
          component => component.name && typeof component.name === 'string'
        );

        // Merge components with user preferences
        const componentsWithPrefs = validComponents.map(component => ({
          name: component.name,
          enabled: userRepoPrefs.has(component.name) ? userRepoPrefs.get(component.name)! : true, // Default to enabled
        }));

        return {
          ...row.user_repositories,
          repository: row.repositories,
          version: {
            ...row.repository_versions,
            components: componentsWithPrefs,
          },
        };
      });

      return c.json({ userRepositories: transformedRepos }, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Error fetching user repositories', error), 400);
    }
  })

  // Connect user to a repository (install)
  .post(
    '/',
    getUser,
    zValidator(
      'json',
      z.object({
        repositoryId: z.string(),
        versionId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { repositoryId, versionId } = await c.req.valid('json');

        // Verify the repository and version exist
        const [repository] = await db
          .select()
          .from(repositoriesTable)
          .where(and(eq(repositoriesTable.id, repositoryId), eq(repositoriesTable.isPublic, true)));

        if (!repository) {
          throw new Error(`Repository not found with id ${repositoryId}`);
        }

        const [version] = await db
          .select()
          .from(repositoryVersionsTable)
          .where(and(eq(repositoryVersionsTable.id, versionId), eq(repositoryVersionsTable.repositoryId, repositoryId)));

        if (!version) {
          throw new Error(`Version not found with id ${versionId}`);
        }

        // Check if user already has this repository connected
        const [existingConnection] = await db
          .select()
          .from(userRepositoriesTable)
          .where(and(eq(userRepositoriesTable.userId, user.id), eq(userRepositoriesTable.repositoryId, repositoryId)));

        if (existingConnection) {
          throw new Error('Repository already connected. Use PUT to update version.');
        }

        // Create the connection
        const [userRepo] = await db
          .insert(userRepositoriesTable)
          .values({
            id: uuidv4(),
            userId: user.id,
            repositoryId,
            versionId,
          })
          .returning();

        // increment the total downloads for the repository
        await db
          .update(repositoriesTable)
          .set({
            totalDownloads: repository.totalDownloads + 1,
            lastUpdated: new Date(),
          })
          .where(eq(repositoriesTable.id, repositoryId));

        // Increment download count for this version
        await db
          .update(repositoryVersionsTable)
          .set({
            downloadCount: version.downloadCount + 1,
          })
          .where(eq(repositoryVersionsTable.id, versionId));

        return c.json(userRepo, 201);
      } catch (error) {
        return c.json(formatErrorResponse('Error connecting repository', error), 400);
      }
    }
  )

  // Update user's repository version (upgrade/downgrade)
  .put(
    '/:userRepoId',
    getUser,
    zValidator(
      'param',
      z.object({
        userRepoId: z.string(),
      })
    ),
    zValidator(
      'json',
      z.object({
        versionId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { userRepoId } = c.req.valid('param');
        const { versionId } = await c.req.valid('json');

        // Verify user owns this connection
        const [existingConnection] = await db
          .select()
          .from(userRepositoriesTable)
          .where(and(eq(userRepositoriesTable.id, userRepoId), eq(userRepositoriesTable.userId, user.id)));

        if (!existingConnection) {
          throw new Error(`User repository connection not found with id ${userRepoId}`);
        }

        // Verify the new version exists for this repository
        const [version] = await db
          .select()
          .from(repositoryVersionsTable)
          .where(and(eq(repositoryVersionsTable.id, versionId), eq(repositoryVersionsTable.repositoryId, existingConnection.repositoryId)));

        if (!version) {
          throw new Error(`Version not found with id ${versionId}`);
        }

        // Update the connection
        const [updatedUserRepo] = await db
          .update(userRepositoriesTable)
          .set({
            versionId,
            lastUsedAt: new Date(),
          })
          .where(eq(userRepositoriesTable.id, userRepoId))
          .returning();

        // Clean up orphaned component preferences
        // Get the new version's components
        const newVersionComponents = new Set(version.components.map(c => c.name));

        // Get existing preferences for this user repository
        const existingPrefs = await db
          .select()
          .from(userComponentPreferencesTable)
          .where(and(eq(userComponentPreferencesTable.userId, user.id), eq(userComponentPreferencesTable.userRepositoryId, userRepoId)));

        // Delete preferences for components that no longer exist in the new version
        const orphanedPrefs = existingPrefs.filter(pref => !newVersionComponents.has(pref.componentName));

        if (orphanedPrefs.length > 0) {
          await db.delete(userComponentPreferencesTable).where(
            and(
              eq(userComponentPreferencesTable.userId, user.id),
              eq(userComponentPreferencesTable.userRepositoryId, userRepoId),
              sql`${userComponentPreferencesTable.componentName} IN (${sql.join(
                orphanedPrefs.map(p => sql`${p.componentName}`),
                sql`, `
              )})`
            )
          );
        }

        // Increment download count for the new version
        await db
          .update(repositoryVersionsTable)
          .set({
            downloadCount: version.downloadCount + 1,
          })
          .where(eq(repositoryVersionsTable.id, versionId));

        // Increment total downloads for the repository
        await db
          .update(repositoriesTable)
          .set({
            totalDownloads: sql`${repositoriesTable.totalDownloads} + 1`,
            lastUpdated: new Date(),
          })
          .where(eq(repositoriesTable.id, existingConnection.repositoryId));

        return c.json(
          {
            userRepository: updatedUserRepo,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error updating repository version', error), 400);
      }
    }
  )

  // Disconnect user from repository (uninstall)
  .delete(
    '/:userRepoId',
    getUser,
    zValidator(
      'param',
      z.object({
        userRepoId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { userRepoId } = c.req.valid('param');

        // Verify user owns this connection
        const [existingConnection] = await db
          .select()
          .from(userRepositoriesTable)
          .where(and(eq(userRepositoriesTable.id, userRepoId), eq(userRepositoriesTable.userId, user.id)));

        if (!existingConnection) {
          throw new Error(`User repository connection not found with id ${userRepoId}`);
        }

        // Delete the connection
        await db.delete(userRepositoriesTable).where(eq(userRepositoriesTable.id, userRepoId));

        return c.json({ message: 'Repository disconnected successfully' }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error disconnecting repository', error), 400);
      }
    }
  )

  // Toggle component enabled/disabled status for a user repository
  .put(
    '/:userRepoId/components/:componentName/toggle',
    getUser,
    zValidator(
      'param',
      z.object({
        userRepoId: z.string(),
        componentName: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { userRepoId, componentName } = c.req.valid('param');

        // Verify user owns this repository and get version info
        const [userRepoWithVersion] = await db
          .select()
          .from(userRepositoriesTable)
          .innerJoin(repositoryVersionsTable, eq(userRepositoriesTable.versionId, repositoryVersionsTable.id))
          .where(and(eq(userRepositoriesTable.id, userRepoId), eq(userRepositoriesTable.userId, user.id)));

        if (!userRepoWithVersion) {
          throw new Error(`User repository not found with id ${userRepoId}`);
        }

        // Verify the component exists in the current version
        const componentExists = userRepoWithVersion.repository_versions.components.some(
          (comp: { name: string }) => comp.name === componentName
        );

        if (!componentExists) {
          throw new Error(`Component '${componentName}' not found in the current version`);
        }

        // Check if preference already exists
        const [existingPref] = await db
          .select()
          .from(userComponentPreferencesTable)
          .where(
            and(
              eq(userComponentPreferencesTable.userId, user.id),
              eq(userComponentPreferencesTable.userRepositoryId, userRepoId),
              eq(userComponentPreferencesTable.componentName, componentName)
            )
          );

        let newEnabledState: boolean;

        if (existingPref) {
          // Toggle existing preference
          newEnabledState = !existingPref.enabled;
          await db
            .update(userComponentPreferencesTable)
            .set({
              enabled: newEnabledState,
              updatedAt: new Date(),
            })
            .where(eq(userComponentPreferencesTable.id, existingPref.id));
        } else {
          // Create new preference (default is enabled, so we're disabling it)
          newEnabledState = false;
          await db.insert(userComponentPreferencesTable).values({
            id: uuidv4(),
            userId: user.id,
            userRepositoryId: userRepoId,
            componentName,
            enabled: newEnabledState,
          });
        }

        return c.json(
          {
            message: 'Component preference updated successfully',
            component: {
              name: componentName,
              enabled: newEnabledState,
            },
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error updating component preference', error), 400);
      }
    }
  );

export default userRepositoriesRoute;
