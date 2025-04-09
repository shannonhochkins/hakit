import { Hono} from 'hono';
import { db } from '../db';
import { eq, and, sql } from 'drizzle-orm';
import { pagesTable, dashboardTable } from "../db/schema/db";
import { insertDashboardSchema, puckDataZodSchema, updateDashboardSchema } from "../db/schema/schemas";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from 'uuid';
import { getUser } from "../kinde";
import { z } from 'zod';
import type { PuckPageData } from '../../../typings/puck';
import type { DashboardPageWithData, DashboardWithoutPageData, DashboardWithPageData } from '../../../typings/dashboard';
import type { Json } from '@kinde-oss/kinde-typescript-sdk';
import { formatErrorResponse } from "../helpers/formatErrorResponse";



// type Page = {
//   id: string;
//   name: string;
//   path: string;
//   data: Json;
// }

// type DashboardWithPages = Dashboard & {
//   pages: Page[];
// }

// type DashboardWithPage = Dashboard & {
//   page: Page;
// }

// type Dashboards = DashboardWithPages[];

// type FullConfiguration = z.infer<typeof configZodSchema>;

// type PageConfiguration = FullConfiguration['pageConfigurations'][number];

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
  const pages = await db
    .select({ path: pagesTable.path })
    .from(pagesTable)
    .where(eq(pagesTable.dashboardId, dashboardId));

  const usedPaths = pages.map(p => p.path);

  // Find the first candidate not already used.
  for (const candidate of defaultPages) {
    if (!usedPaths.includes(candidate.path)) {
      return candidate;
    }
  }

  throw new Error("No available default page names left for this dashboard.");
}


const generateId = (type?: string | number) => (type ? `${type}-${uuidv4()}` : uuidv4());

function createDefaultPageConfiguration(): PuckPageData {
  return {
    zones: {},
    content: [],
    root: {
      props: {},
    },
  };
}



// async function getPageConfiguration({
//   userId,
//   dashboardPath,
//   pagePath,
// }: {
//   userId: string;
//   dashboardPath: string;
//   pagePath: string;
// }) {
//   // Retrieve common configuration parts and verify user ownership.
//   const { commonConfig, configSchemaId } = await getCommonConfigurationPartsForUser({
//     userId,
//     configId,
//   });

//   // Fetch the specific page configuration record.
//   const pageConfigRecord = await db
//     .select()
//     .from(pagesTable)
//     .where(
//       and(
//         eq(pagesTable.configSchemaId, configSchemaId),
//         eq(pagesTable.path, pagePath)
//       )
//     )
//     .then((rows) => rows[0]);

//   if (!pageConfigRecord) {
//     throw new Error(
//       `Page configuration with ID ${pageId} not found for the given config schema`
//     );
//   }

//   const config = pageConfigRecord.config as PageConfiguration["config"];
//   const puckData: PuckPageData = {
//     content: config.content,
//     zones: config.zones,
//     root: {
//       props: commonConfig,
//     },
//   };

//   const parsedPuckData = pageConfigurationZodSchema.shape.config.parse(puckData);

//   return parsedPuckData;
// }


// async function getFullConfiguration({
//   userId,
//   configId,
// }: {
//   userId: string;
//   configId: number;
// }) {
//   // Retrieve common configuration parts and verify user ownership.
//   const { commonConfig, configSchemaId } = await getCommonConfigurationPartsForUser({
//     userId,
//     configId,
//   });

//   // Query all page configurations for the schema.
//   const pageConfigurations = await db
//     .select()
//     .from(pageConfigurationsTable)
//     .where(eq(pageConfigurationsTable.configSchemaId, configSchemaId));

//   const fullConfiguration = {
//     pageConfigurations: pageConfigurations.map((pc) => ({
//       id: pc.id,
//       config: pc.config, // Expected shape: { zones: {}, content: [], root?: {} }
//     })),
//     config: commonConfig,
//   };

//   console.log('fullConfiguration', JSON.stringify(fullConfiguration, null, 2));

//   // Validate and return using your Zod schema.
//   const parsedConfiguration = configZodSchema.parse(fullConfiguration);
//   return parsedConfiguration;
// }

// interface Configuration {
//   id: number;
//   userId: string;
//   name: string;
//   pageConfigurationIds: string[] | null;
// }

// async function getConfigurations(userId: string): Promise<Configuration[]> {

//   const pageConfigsSubquery = db
//     .select({
//       configSchemaId: pageConfigurationsTable.configSchemaId,
//       // Explicitly tell TypeScript that this returns a string array.
//       pageConfigurationIds: sql<string[]>`array_agg(${pageConfigurationsTable.id})`.as("pageConfigurationIds"),
//     })
//     .from(pageConfigurationsTable)
//     .groupBy(pageConfigurationsTable.configSchemaId)
//     .as("pageConfigs");

//   // Now select all your configuration columns and join the subquery.
//   const configurations = await db
//     .select({
//       // List the columns from your configTable that you need.
//       id: configTable.id,
//       userId: configTable.userId,
//       name: configTable.name, // example column—replace with yours
//       // Add the computed column from the subquery.
//       pageConfigurationIds: pageConfigsSubquery.pageConfigurationIds,
//     })
//     .from(configTable)
//     .leftJoin(
//       pageConfigsSubquery,
//       eq(configTable.id, pageConfigsSubquery.configSchemaId)
//     )
//     .where(eq(configTable.userId, userId))
//     .execute();

//   return configurations;

// }

function sanitizePuckData(data: Json) {
  return puckDataZodSchema.parse(data);
}


const dashboardRoute = new Hono()
  // get a full dashboard object without the data
  .get('/:dashboardPath', getUser, zValidator("param", z.object({
    dashboardPath: z.string()
  })), async (c) => {
    try {
      const user = c.var.user;
      const { dashboardPath } = c.req.valid('param');
      const dashboards = await db
        .select({
          id: dashboardTable.id,
          name: dashboardTable.name,
          path: dashboardTable.path,
          data: dashboardTable.data,
          breakpoints: dashboardTable.breakpoints,
          pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'path', ${pagesTable.path}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`
        })
        .from(dashboardTable)
        .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
        .where(
          and(
            eq(dashboardTable.path, dashboardPath),
            eq(dashboardTable.userId, user.id)
          )
        )
        .groupBy(dashboardTable.id);
      return c.json(dashboards[0] as unknown as DashboardWithoutPageData, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboard Fetch Error', error), 400);
    }
  })
  .get('/:dashboardPath/data', getUser, zValidator("param", z.object({
    dashboardPath: z.string()
  })), async (c) => {
    try {
      const user = c.var.user;
      const { dashboardPath } = c.req.valid('param');
      const dashboards = await db
        .select({
          id: dashboardTable.id,
          name: dashboardTable.name,
          path: dashboardTable.path,
          data: dashboardTable.data,
          breakpoints: dashboardTable.breakpoints,
          pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'path', ${pagesTable.path},
                'data', ${pagesTable.data}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`
        })
        .from(dashboardTable)
        .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
        .where(
          and(
            eq(dashboardTable.path, dashboardPath),
            eq(dashboardTable.userId, user.id)
          )
        )
        .groupBy(dashboardTable.id);
      return c.json(dashboards[0] as unknown as DashboardWithPageData, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboard Fetch Error', error), 400);
    }
  })
  // get a full page object with the data
  .get('/:id/page/:pageId', getUser, zValidator("param", z.object({
    id: z.string(),
    pageId: z.string()
  })),  async (c) => {
    try {
      const user = c.var.user;
      const { id, pageId } = c.req.valid('param');
      // const [dashboardWithPage] = await db
      //   .select({
      //     id: dashboardTable.id,
      //     name: dashboardTable.name,
      //     path: dashboardTable.path,
      //     data: dashboardTable.data,
      //     page: {
      //       id: pagesTable.id,
      //       name: pagesTable.name,
      //       path: pagesTable.path,
      //       data: pagesTable.data
      //     }
      //   })
      //   .from(dashboardTable)
      //   .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
      //   .where(
      //     and(
      //       eq(dashboardTable.id, id),
      //       eq(pagesTable.id, pageId),
      //       eq(dashboardTable.userId, user.id)
      //     )
      //   );
      // find the dashboard to get the id
      const dashboards = await db
        .select({
          id: dashboardTable.id
        })
        .from(dashboardTable)
        .where(
          and(
            eq(dashboardTable.id, id),
            eq(dashboardTable.userId, user.id)
          )
        );
      // simply to validate that we're requesting by the right user
      // we don't use dashboards at all here, as there's no connection to a page and a user
      // we just need to check that the dashboard exists for this user
      if (!dashboards.length) {
        throw new Error(`Dashboard not found with id ${id}`);
      }
      const [page] = await db
        .select()
        .from(pagesTable)
        .where(
          and(
            eq(pagesTable.id, pageId),
            eq(pagesTable.dashboardId, id)
          )
        );
      return c.json(page as unknown as DashboardPageWithData, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboard Page Fetch Error', error), 400);
    }
  })
  // get all dashboards and pages without the page data
  .get('/', getUser, async (c) => {
    try {
      const user = c.var.user;
      const dashboards = await db
        .select({
          id: dashboardTable.id,
          name: dashboardTable.name,
          path: dashboardTable.path,
          data: dashboardTable.data,
          pages: sql`COALESCE(
            json_agg(
              json_build_object(
                'id', ${pagesTable.id},
                'name', ${pagesTable.name},
                'path', ${pagesTable.path}
              )
            ) FILTER (WHERE ${pagesTable.id} IS NOT NULL),
            '[]'
          )`,
        })
        .from(dashboardTable)
        .leftJoin(pagesTable, eq(dashboardTable.id, pagesTable.dashboardId))
        .where(
          eq(dashboardTable.userId, user.id)
        )
        .groupBy(dashboardTable.id);
      // have to cast here as the sql function is not typed
    return c.json(dashboards as unknown as DashboardWithoutPageData[], 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboards Fetch Error', error), 400);
    }
  })
  // delete a dashboard
  .delete('/:id', getUser, zValidator("param", z.object({
    id: z.string(),
  })), async (c) => {
    try {
      const user = c.var.user;
      const { id } = c.req.valid('param');
      await db
        .delete(dashboardTable)
        .where(
          and(
            eq(dashboardTable.id, id),
            eq(dashboardTable.userId, user.id)
          )
        )
      return c.json({
        message: 'Dashboard deleted successfully'
      }, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboards Delete Error', error), 400);
    }
  })
  // delete a dashboard page
  .delete('/:id/page/:pageId', getUser, zValidator("param", z.object({
    id: z.string(),
    pageId: z.string()
  })), async (c) => {
    try {
      const user = c.var.user;
      const { id, pageId } = c.req.valid('param');
      // find the dashboard to get the id
      const dashboards = await db
        .select({
          id: dashboardTable.id
        })
        .from(dashboardTable)
        .where(
          and(
            eq(dashboardTable.id, id),
            eq(dashboardTable.userId, user.id)
          )
        );
      if (!dashboards.length) {
        throw new Error(`Dashboard not found with id ${id}`);
      }
      const [dashboard] = dashboards;
      await db
        .delete(pagesTable)
        .where(
          and(
            eq(pagesTable.id, pageId),
            eq(pagesTable.dashboardId, dashboard.id)
          )
        )
      return c.json({
        message: 'Dashboard page deleted successfully'
      }, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboards Delete Error', error), 400);
    }
  })
  // update a dashboard page
  .put('/:id/page/:pageId', getUser, zValidator("param", z.object({
    id: z.string(),
    pageId: z.string()
  })), zValidator("json", updateDashboardSchema), async (c) => {
    try {
      const user = c.var.user;
      const data = await c.req.valid('json');
      const { id, pageId } = c.req.valid('param');
      
      if (!id) {
        throw new Error('No dashboard path provided');
      }
      if (!pageId) {
        throw new Error('No page path provided');
      }
      const dashboards = await db
        .select({
          id: dashboardTable.id
        })
        .from(dashboardTable)
        .where(
          and(
            eq(dashboardTable.id, id),
            eq(dashboardTable.userId, user.id)
          )
        );
      if (!dashboards.length) {
        throw new Error(`Dashboard not found with id ${id}`);
      }
      const [dashboard] = dashboards;
      const [pageRecord] = await db
        .update(pagesTable)
        .set({
          name: data.name,
          path: data.path,
          data: sanitizePuckData(data.data),
        })
        .where(
          and(
            eq(pagesTable.dashboardId, dashboard.id),
            eq(pagesTable.id, pageId),
          )
        )
        .returning();
      return c.json(pageRecord, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Page Update Error', error), 400);
    }
  })
  // update a dashboard
  .put('/:id', getUser, zValidator("param", z.object({
    id: z.string()
  })), zValidator("json", updateDashboardSchema), async (c) => {
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
          themeId: data.themeId,
        })
        .where(
          and(
            eq(dashboardTable.id, params.id),
            eq(dashboardTable.userId, user.id)
          )
        )
        .returning();
      return c.json(dashboardRecord, 200);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboards Update Error', error), 400);
    }
  })
  // create a new dashboard with a default page
  .post('/', getUser, zValidator("json", insertDashboardSchema), async (c) => {
    try {
      const user = c.var.user;
      const { data, name, path } = await c.req.valid('json');
      const [dashboardRecord] = await db
        .insert(dashboardTable)
        .values({
          id: generateId(),
          userId: user.id,
          name,
          path,
          // TODO - Sanitize input data
          data,
        })
        .returning();

      const defaultPage = await getAvailableDefaultPage(dashboardRecord.id);

      await db.insert(pagesTable).values({
        id: generateId(),
        dashboardId: dashboardRecord.id,
        name: defaultPage.name,
        path: defaultPage.path,
        data: createDefaultPageConfiguration(),
      });
      
      return c.json(dashboardRecord, 201);
    } catch (error) {
      return c.json(formatErrorResponse('Dashboard Creation Error', error), 400);
    }
  })

export default dashboardRoute;