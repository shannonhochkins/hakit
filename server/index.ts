/* istanbul ignore file */

import express from 'express';
import http from 'http';
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import cors from 'cors';
import { router } from '@server/trpc';
import * as routes from '@routes';
import { config } from "@root/config";
// root router to call
export const appRouter = router(routes);

// http server
const app = express();
const server = http.createServer(app);

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
// can pass the context here so even backend can be restricted with auth
export const caller = appRouter.createCaller({});
if (process.env.NODE_ENV !== 'test') {
  // express implementation
  // enable cors
  app.use(cors());

  // listen for api endpoints with /api as base
  app.use(
    '/api',
    createExpressMiddleware({
      router: appRouter
    })
  );

  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  app.get('/', (_req, res) => res.send(''));
  server.listen(config.ports.SERVER_PORT, '0.0.0.0', () => {
    console.log(`API listening on port ${config.ports.SERVER_PORT}`);
  });
  process.on('SIGTERM', () => {
    server.close();
  });
}
