import { Hono} from 'hono';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { configTable, pageConfigurationsTable, dashboardsTable, viewportsTable, themesTable, configZodSchema, pageConfigurationZodSchema, insertConfigSchema, updateConfigSchema } from "../db/schema/config";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from 'uuid';
import { getUser } from "../kinde";
import { uploadFileFromPath } from '../helpers/gcloud-file';
import { z } from 'zod';
import { defaultViewports } from '../../client/src/lib/editor/components/Root/viewports';
import type { PuckPageData } from '../../client/typings/puck';

const DEFAULT_DASHBOARD_TITLE = 'Dashboard';

type FullConfiguration = z.infer<typeof configZodSchema>;

type PageConfiguration = FullConfiguration['pageConfigurations'][number];

const generateId = (type?: string | number) => (type ? `${type}-${uuidv4()}` : uuidv4());

function createDefaultPageConfiguration():PageConfiguration['config'] {
  return {
    zones: {},
    content: [],
    root: {
      props: {},
    },
  };
}

type CommonConfigType = z.infer<typeof configZodSchema.shape.config>;

// Helper: verifies ownership and retrieves common configuration parts.
async function getCommonConfigurationPartsForUser({
  userId,
  configId,
}: {
  userId: string;
  configId: number;
}): Promise<{ commonConfig: CommonConfigType; configSchemaId: number }> {
  // Verify the config schema belongs to the given user.
  const configSchemaRecord = await db
    .select()
    .from(configTable)
    .where(
      and(eq(configTable.id, configId), eq(configTable.userId, userId))
    )
    .then((rows) => rows[0]);

  if (!configSchemaRecord) {
    throw new Error("Configuration not found for the given user and ID");
  }

  // Get dashboards related to the config schema.
  const dashboards = await db
    .select()
    .from(dashboardsTable)
    .where(eq(dashboardsTable.configSchemaId, configSchemaRecord.id));

  // Get viewports related to the config schema.
  const viewports = await db
    .select()
    .from(viewportsTable)
    .where(eq(viewportsTable.configSchemaId, configSchemaRecord.id));

  // Get the theme for the config schema (assumed to be a single record).
  const theme = await db
    .select()
    .from(themesTable)
    .where(eq(themesTable.configSchemaId, configSchemaRecord.id))
    .then((rows) => rows[0]);

  const commonConfig: CommonConfigType = {
    dashboards: dashboards.map((d) => ({
      id: d.id,
      title: d.title,
    })),
    viewports: viewports.map((v) => ({
      label: v.label,
      width: v.width,
      disabled: v.disabled,
    })),
    theme: {
      hue: theme.hue,
      saturation: theme.saturation,
      lightness: theme.lightness,
      tint: Number(theme.tint), // convert to number if necessary
      darkMode: theme.darkMode,
      contrastThreshold: theme.contrastThreshold,
    },
  };

  return { commonConfig, configSchemaId: configSchemaRecord.id };
}


async function getPageConfiguration({
  userId,
  configId,
  pageId,
}: {
  userId: string;
  configId: number;
  pageId: string;
}) {
  // Retrieve common configuration parts and verify user ownership.
  const { commonConfig, configSchemaId } = await getCommonConfigurationPartsForUser({
    userId,
    configId,
  });

  // Fetch the specific page configuration record.
  const pageConfigRecord = await db
    .select()
    .from(pageConfigurationsTable)
    .where(
      and(
        eq(pageConfigurationsTable.configSchemaId, configSchemaId),
        eq(pageConfigurationsTable.id, Number(pageId))
      )
    )
    .then((rows) => rows[0]);

  if (!pageConfigRecord) {
    throw new Error(
      `Page configuration with ID ${pageId} not found for the given config schema`
    );
  }

  const config = pageConfigRecord.config as PageConfiguration["config"];
  const puckData: PuckPageData = {
    content: config.content,
    zones: config.zones,
    root: {
      props: commonConfig,
    },
  };

  const parsedPuckData = pageConfigurationZodSchema.shape.config.parse(puckData);

  return parsedPuckData;
}


async function getFullConfiguration({
  userId,
  configId,
}: {
  userId: string;
  configId: number;
}) {
  // Retrieve common configuration parts and verify user ownership.
  const { commonConfig, configSchemaId } = await getCommonConfigurationPartsForUser({
    userId,
    configId,
  });

  // Query all page configurations for the schema.
  const pageConfigurations = await db
    .select()
    .from(pageConfigurationsTable)
    .where(eq(pageConfigurationsTable.configSchemaId, configSchemaId));

  const fullConfiguration = {
    pageConfigurations: pageConfigurations.map((pc) => ({
      id: pc.id,
      config: pc.config, // Expected shape: { zones: {}, content: [], root?: {} }
    })),
    config: commonConfig,
  };

  // Validate and return using your Zod schema.
  const parsedConfiguration = configZodSchema.parse(fullConfiguration);
  return parsedConfiguration;
}

interface Configuration {
  id: number;
  userId: string;
  name: string;
  pageConfigurationIds: string[] | null;
}

async function getConfigurations(userId: string): Promise<Configuration[]> {

  const pageConfigsSubquery = db
    .select({
      configSchemaId: pageConfigurationsTable.configSchemaId,
      // Explicitly tell TypeScript that this returns a string array.
      pageConfigurationIds: sql<string[]>`array_agg(${pageConfigurationsTable.id})`.as("pageConfigurationIds"),
    })
    .from(pageConfigurationsTable)
    .groupBy(pageConfigurationsTable.configSchemaId)
    .as("pageConfigs");

  // Now select all your configuration columns and join the subquery.
  const configurations = await db
    .select({
      // List the columns from your configTable that you need.
      id: configTable.id,
      userId: configTable.userId,
      name: configTable.name, // example column—replace with yours
      // Add the computed column from the subquery.
      pageConfigurationIds: pageConfigsSubquery.pageConfigurationIds,
    })
    .from(configTable)
    .leftJoin(
      pageConfigsSubquery,
      eq(configTable.id, pageConfigsSubquery.configSchemaId)
    )
    .where(eq(configTable.userId, userId))
    .execute();

  return configurations;

}


const configRoute = new Hono()
  .get('/:configId', getUser, zValidator("param", z.object({
    configId: z.string()
  })),  async (c) => {
    const user = c.var.user;
    const { configId } = c.req.valid('param');

    try {
      const config = await getFullConfiguration({
        userId: user.id,
        configId: Number(configId),
      });
      return c.json(config, 200);
    } catch (error) {
      return c.json(
        { error: 'Failed to fetch config', detail: String(error) },
        400
      );
    }
  })
  .get('/:configId/:pageId', getUser, zValidator("param", z.object({
    configId: z.string(),
    pageId: z.string()
  })),  async (c) => {
    const user = c.var.user;
    const { configId, pageId } = c.req.valid('param');

    try {
      const config = await getPageConfiguration({
        userId: user.id,
        configId: Number(configId),
        pageId,
      });
      return c.json(config, 200);
    } catch (error) {
      return c.json(
        { error: 'Failed to fetch config', detail: String(error) },
        400
      );
    }
  })
  .get('/', getUser, async (c) => {
    const user = c.var.user;

    try {
      const configurations = await getConfigurations(user.id);
      
      return c.json(configurations, 200);
    } catch (error) {
      return c.json(
        { error: 'Failed to fetch config', detail: String(error) },
        400
      );
    }
  })
  .put('/', getUser, zValidator("json", updateConfigSchema), async (c) => {
    try {
      // const user = c.var.user;
      // const data = await c.req.valid('json')
      // const [newConfig] = await db
      //   .update(configTable)
      //   .set({
      //     config: data.config,
      //   })
      //   .returning();
      
      // return c.json(newConfig, 201);
    } catch (error) {
      console.log('err', error);
      return c.json(
        { error: 'Failed to create config', detail: String(error) },
        400
      );
    }
  })
  .post('/', getUser, zValidator("json", insertConfigSchema), async (c) => {
    try {
      const user = c.var.user;
      const [configSchemaRecord] = await db
        .insert(configTable)
        .values({
          userId: user.id,
          name: c.req.valid('json').name,
        })
        .returning();

      const defaultPageConfig = createDefaultPageConfiguration();

      // Insert default page configuration (JSONB blob)
      await db.insert(pageConfigurationsTable).values({
        configSchemaId: configSchemaRecord.id,
        config: defaultPageConfig,
      });

      // Insert default dashboard tied to the page configuration.
      await db.insert(dashboardsTable).values({
        title: DEFAULT_DASHBOARD_TITLE,
        configSchemaId: configSchemaRecord.id,
      });

      // Insert default viewports (one row per viewport).
      for (const viewport of defaultViewports) {
        await db.insert(viewportsTable).values({
          label: viewport.label,
          width: viewport.width,
          disabled: viewport.disabled,
          configSchemaId: configSchemaRecord.id,
        });
      }

      // Use your Zod schema to get default theme values.
      const defaultTheme = configZodSchema.shape.config.shape.theme.parse({});

      // Insert default theme record.
      await db.insert(themesTable).values({
        configSchemaId: configSchemaRecord.id,
        hue: defaultTheme.hue,
        saturation: defaultTheme.saturation,
        lightness: defaultTheme.lightness,
        tint: defaultTheme.tint,
        darkMode: defaultTheme.darkMode,
        contrastThreshold: defaultTheme.contrastThreshold,
      });
      
      return c.json(configSchemaRecord, 201);
    } catch (error) {
      console.log('err', error);
      return c.json(
        { error: 'Failed to create config', detail: String(error) },
        400
      );
    }
  })

export default configRoute;