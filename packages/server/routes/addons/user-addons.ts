import { Hono } from 'hono';
import { db } from '../../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { userAddonsTable, addonsTable, addonVersionsTable, userComponentPreferencesTable } from '../../db/schema/db';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod/v4';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../../kinde';
import { formatErrorResponse } from '../../helpers/formatErrorResponse';
import { describeRoute } from 'hono-openapi';

const userAddonsRoute = new Hono()
  // Get user's connected addons
  .get(
    '/',
    describeRoute({
      description: "List user's connected addons",
      tags: ['User Addons'],
      responses: { 200: { description: 'OK' } },
    }),
    getUser,
    async c => {
      try {
        const user = c.var.user;

        const userAddons = await db
          .select()
          .from(userAddonsTable)
          .innerJoin(addonsTable, eq(userAddonsTable.addonId, addonsTable.id))
          .innerJoin(addonVersionsTable, eq(userAddonsTable.versionId, addonVersionsTable.id))
          .where(eq(userAddonsTable.userId, user.id))
          .orderBy(desc(userAddonsTable.connectedAt));

        // Get all component preferences for this user in one query
        const componentPreferences = await db
          .select()
          .from(userComponentPreferencesTable)
          .where(eq(userComponentPreferencesTable.userId, user.id));

        // Create a map of component preferences by userAddonId -> componentName -> enabled
        const prefsMap = new Map<string, Map<string, boolean>>();
        for (const pref of componentPreferences) {
          if (!prefsMap.has(pref.userAddonId)) {
            prefsMap.set(pref.userAddonId, new Map());
          }
          prefsMap.get(pref.userAddonId)!.set(pref.componentName, Boolean(pref.enabled));
        }

        // Transform to spread user addon fields at top level with nested addon
        const transformedAddons = userAddons.map(row => {
          const userAddonPrefs = prefsMap.get(row.user_addons.id) || new Map();

          // Filter out components that no longer exist in the current version
          const validComponents = row.addon_versions.components.filter(component => component.name && typeof component.name === 'string');

          // Merge components with user preferences
          const componentsWithPrefs = validComponents.map(component => ({
            name: component.name,
            enabled: userAddonPrefs.has(component.name) ? userAddonPrefs.get(component.name)! : true, // Default to enabled
          }));

          return {
            ...row.user_addons,
            addon: row.addons,
            version: {
              ...row.addon_versions,
              components: componentsWithPrefs,
            },
          };
        });

        return c.json({ userAddons: transformedAddons }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error fetching user addons', error), 400);
      }
    }
  )

  // Connect user to a addon (install)
  .post(
    '/',
    describeRoute({
      description: 'Connect user to a addon',
      tags: ['User Addons'],
      responses: { 201: { description: 'Created' } },
    }),
    getUser,
    zValidator(
      'json',
      z.object({
        addonId: z.string(),
        versionId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { addonId, versionId } = await c.req.valid('json');

        // Verify the addon and version exist
        const [addon] = await db
          .select()
          .from(addonsTable)
          .where(and(eq(addonsTable.id, addonId), eq(addonsTable.isPublic, true)));

        if (!addon) {
          throw new Error(`Addon not found with id ${addonId}`);
        }

        const [version] = await db
          .select()
          .from(addonVersionsTable)
          .where(and(eq(addonVersionsTable.id, versionId), eq(addonVersionsTable.addonId, addonId)));

        if (!version) {
          throw new Error(`Version not found with id ${versionId}`);
        }

        // Check if user already has this addon connected
        const [existingConnection] = await db
          .select()
          .from(userAddonsTable)
          .where(and(eq(userAddonsTable.userId, user.id), eq(userAddonsTable.addonId, addonId)));

        if (existingConnection) {
          throw new Error('Addon already connected. Use PUT to update version.');
        }

        // Create the connection
        const [userAddon] = await db
          .insert(userAddonsTable)
          .values({
            id: uuidv4(),
            userId: user.id,
            addonId,
            versionId,
          })
          .returning();

        // increment the total downloads for the addon
        await db
          .update(addonsTable)
          .set({
            totalDownloads: addon.totalDownloads + 1,
            lastUpdated: new Date(),
          })
          .where(eq(addonsTable.id, addonId));

        // Increment download count for this version
        await db
          .update(addonVersionsTable)
          .set({
            downloadCount: version.downloadCount + 1,
          })
          .where(eq(addonVersionsTable.id, versionId));

        return c.json(userAddon, 201);
      } catch (error) {
        return c.json(formatErrorResponse('Error connecting addon', error), 400);
      }
    }
  )

  // Update user's addon version (upgrade/downgrade)
  .put(
    '/:userAddonId',
    describeRoute({
      description: "Update user's addon version",
      tags: ['User Addons'],
      responses: { 200: { description: 'OK' } },
    }),
    getUser,
    zValidator(
      'param',
      z.object({
        userAddonId: z.string(),
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
        const { userAddonId } = c.req.valid('param');
        const { versionId } = await c.req.valid('json');

        // Verify user owns this connection
        const [existingConnection] = await db
          .select()
          .from(userAddonsTable)
          .where(and(eq(userAddonsTable.id, userAddonId), eq(userAddonsTable.userId, user.id)));

        if (!existingConnection) {
          throw new Error(`User addon connection not found with id ${userAddonId}`);
        }

        // Verify the new version exists for this addon
        const [version] = await db
          .select()
          .from(addonVersionsTable)
          .where(and(eq(addonVersionsTable.id, versionId), eq(addonVersionsTable.addonId, existingConnection.addonId)));

        if (!version) {
          throw new Error(`Version not found with id ${versionId}`);
        }

        // Update the connection
        const [updatedUserAddon] = await db
          .update(userAddonsTable)
          .set({
            versionId,
            lastUsedAt: new Date(),
          })
          .where(eq(userAddonsTable.id, userAddonId))
          .returning();

        // Clean up orphaned component preferences
        // Get the new version's components
        const newVersionComponents = new Set(version.components.map(c => c.name));

        // Get existing preferences for this user addon
        const existingPrefs = await db
          .select()
          .from(userComponentPreferencesTable)
          .where(and(eq(userComponentPreferencesTable.userId, user.id), eq(userComponentPreferencesTable.userAddonId, userAddonId)));

        // Delete preferences for components that no longer exist in the new version
        const orphanedPrefs = existingPrefs.filter(pref => !newVersionComponents.has(pref.componentName));

        if (orphanedPrefs.length > 0) {
          await db.delete(userComponentPreferencesTable).where(
            and(
              eq(userComponentPreferencesTable.userId, user.id),
              eq(userComponentPreferencesTable.userAddonId, userAddonId),
              sql`${userComponentPreferencesTable.componentName} IN (${sql.join(
                orphanedPrefs.map(p => sql`${p.componentName}`),
                sql`, `
              )})`
            )
          );
        }

        // Increment download count for the new version
        await db
          .update(addonVersionsTable)
          .set({
            downloadCount: version.downloadCount + 1,
          })
          .where(eq(addonVersionsTable.id, versionId));

        // Increment total downloads for the addon
        await db
          .update(addonsTable)
          .set({
            totalDownloads: sql`${addonsTable.totalDownloads} + 1`,
            lastUpdated: new Date(),
          })
          .where(eq(addonsTable.id, existingConnection.addonId));

        return c.json(
          {
            userAddon: updatedUserAddon,
          },
          200
        );
      } catch (error) {
        return c.json(formatErrorResponse('Error updating addon version', error), 400);
      }
    }
  )

  // Disconnect user from addon (uninstall)
  .delete(
    '/:userAddonId',
    describeRoute({
      description: 'Disconnect user from addon',
      tags: ['User Addons'],
      responses: { 200: { description: 'OK' } },
    }),
    getUser,
    zValidator(
      'param',
      z.object({
        userAddonId: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { userAddonId } = c.req.valid('param');

        // Verify user owns this connection
        const [existingConnection] = await db
          .select()
          .from(userAddonsTable)
          .where(and(eq(userAddonsTable.id, userAddonId), eq(userAddonsTable.userId, user.id)));

        if (!existingConnection) {
          throw new Error(`User addon connection not found with id ${userAddonId}`);
        }

        // Delete the connection
        await db.delete(userAddonsTable).where(eq(userAddonsTable.id, userAddonId));

        return c.json({ message: 'Addon disconnected successfully' }, 200);
      } catch (error) {
        return c.json(formatErrorResponse('Error disconnecting addon', error), 400);
      }
    }
  )

  // Toggle component enabled/disabled status for a user addon
  .put(
    '/:userAddonId/components/:componentName/toggle',
    describeRoute({
      description: 'Toggle component enabled/disabled',
      tags: ['User Addons'],
      responses: { 200: { description: 'OK' } },
    }),
    getUser,
    zValidator(
      'param',
      z.object({
        userAddonId: z.string(),
        componentName: z.string(),
      })
    ),
    async c => {
      try {
        const user = c.var.user;
        const { userAddonId, componentName } = c.req.valid('param');

        // Verify user owns this addon and get version info
        const [userAddonWithVersion] = await db
          .select()
          .from(userAddonsTable)
          .innerJoin(addonVersionsTable, eq(userAddonsTable.versionId, addonVersionsTable.id))
          .where(and(eq(userAddonsTable.id, userAddonId), eq(userAddonsTable.userId, user.id)));

        if (!userAddonWithVersion) {
          throw new Error(`User addon not found with id ${userAddonId}`);
        }

        // Verify the component exists in the current version
        const componentExists = userAddonWithVersion.addon_versions.components.some(
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
              eq(userComponentPreferencesTable.userAddonId, userAddonId),
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
            userAddonId: userAddonId,
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

export default userAddonsRoute;
