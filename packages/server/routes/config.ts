import { Hono} from 'hono';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { configTable, pageConfigurationsTable, dashboardsTable, viewportsTable, themesTable, configZodSchema, insertConfigSchema, updateConfigSchema } from "../db/schema/config";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from 'uuid';
import { getUser } from "../kinde";
import { uploadFileFromPath } from '../helpers/gcloud-file';
import { z } from 'zod';
import { defaultViewports } from '../../client/src/lib/editor/components/Root/viewports';

const DEFAULT_DASHBOARD_TITLE = 'Dashboard';

type FullConfiguration = z.infer<typeof configZodSchema>;

type PageConfiguration = FullConfiguration['pageConfigurations'][number];

const generateId = (type?: string | number) => (type ? `${type}-${uuidv4()}` : uuidv4());

function createDefaultPageConfiguration():PageConfiguration['config'] {
  return {
    zones: {},
    content: [],
  };
}

async function getFullConfiguration(
  userId: string,
  configSchemaId: number
) {
  // 1. Verify the configSchema belongs to the given user.
  const configSchemaRecord = await db
    .select()
    .from(configTable)
    .where(
      and(eq(configTable.id, configSchemaId), eq(configTable.userId, userId))
    )
    .then((rows) => rows[0]);

  if (!configSchemaRecord) {
    throw new Error("Configuration not found for the given user and ID");
  }

  // 2. Query global configuration parts.

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

  // 3. Query page configurations. 
  // Each record already contains a JSONB blob for the nested page config.
  const pageConfigurations = await db
    .select()
    .from(pageConfigurationsTable)
    .where(eq(pageConfigurationsTable.configSchemaId, configSchemaRecord.id));

  // 4. Combine into the expected structure.
  const fullConfiguration = {
    pageConfigurations: pageConfigurations.map((pc) => ({
      id: pc.id,
      config: pc.config, // Should match { zones: {}, content: [], root?: {} }
    })),
    config: {
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
        // If stored as a numeric type (and possibly as a string), convert to number:
        tint: Number(theme.tint),
        darkMode: theme.darkMode,
        contrastThreshold: theme.contrastThreshold,
      },
    },
  };

  // 5. Validate and format using the Zod schema.
  const parsedConfiguration = configZodSchema.parse(fullConfiguration);
  return parsedConfiguration;
}


const configRoute = new Hono()
  .get('/:id', getUser, zValidator("param", z.object({
    id: z.string()
  })),  async (c) => {
    const user = c.var.user;
    const id = c.req.valid('param').id;

    try {
      const config = await getFullConfiguration(user.id, Number(id));
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
      const configurations = await db
        .select()
        .from(configTable)
        .where(
          eq(configTable.userId, user.id)
        );
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

      // Generate a new page configuration ID and default configuration blob.
      const pageConfigId = generateId();
      const defaultPageConfig = createDefaultPageConfiguration();

      // Insert default page configuration (JSONB blob)
      await db.insert(pageConfigurationsTable).values({
        id: pageConfigId,
        configSchemaId: configSchemaRecord.id,
        config: defaultPageConfig,
      });

      // Insert default dashboard tied to the page configuration.
      await db.insert(dashboardsTable).values({
        id: pageConfigId, // tying dashboard id to the page config id
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