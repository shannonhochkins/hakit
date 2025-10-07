import app from './app';
import { z } from 'zod/v4';

const ServeEnv = z.object({
  PORT: z.string().regex(/^\d+$/, 'Port must be a numeric string').prefault('3002').transform(Number),
});
const ProcessEnv = ServeEnv.parse(process.env);

const server = Bun.serve({
  port: ProcessEnv.PORT,
  hostname: '0.0.0.0',
  fetch: app.fetch,
});

console.debug('server running', server.port);
