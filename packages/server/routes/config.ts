import { Hono} from 'hono';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { configTable, insertConfigSchema, selectConfigSchema } from "../db/schema/config";
import { zValidator } from "@hono/zod-validator";

import { getUser } from "../kinde";

const configRoute = new Hono()
  .get('/', getUser, zValidator("query", selectConfigSchema),  async (c) => {
    const user = c.var.user;

    try {
      const configs = await db
        .select()
        .from(configTable)
        .where(
          and(
            eq(configTable.userId, Number(user.id)),
          )
        );
      return c.json(configs);
    } catch (error) {
      return c.json(
        { error: 'Failed to fetch config', detail: String(error) },
        400
      );
    }
  })
  .post('/', getUser, zValidator("json", insertConfigSchema), async (c) => {
    try {
      // Parse request body. Expect { userId, userEmail, config }
      const data = await c.req.valid('json')
      // If you want Zod-based validation, see the snippet below.
      
      const [newConfig] = await db
        .insert(configTable)
        .values(data)
        .returning();
      
      return c.json(newConfig, 201);
    } catch (error) {
      console.log('err', error);
      return c.json(
        { error: 'Failed to create config', detail: String(error) },
        400
      );
    }
  })

export default configRoute;