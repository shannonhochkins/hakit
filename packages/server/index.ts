import app from './app';
import { z } from 'zod';

const ServeEnv = z.object({
  PORT: z.string().regex(/^\d+$/, 'Port must be a numeric string').default('5000').transform(Number),
});
const ProcessEnv = ServeEnv.parse(process.env);

const server = Bun.serve({
  port: ProcessEnv.PORT,
  hostname: '0.0.0.0',
  fetch: app.fetch,
});

console.debug('server running', server.port);
