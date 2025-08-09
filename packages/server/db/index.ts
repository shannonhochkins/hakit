import { drizzle } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';
import { z } from 'zod/v4';

const PostgresEnv = z.object({
  DATABASE_URL: z.url(),
});
const ProcessEnv = PostgresEnv.parse(process.env);

// for query purposes
const queryClient = postgres(ProcessEnv.DATABASE_URL);
export const db = drizzle(queryClient);
