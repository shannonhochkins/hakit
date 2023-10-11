import path from 'path';
import express from 'express';
import http from 'http';
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { router } from '@server/trpc';
import * as routes from '@routes';
import { config } from "../app-config";
import cors from 'cors';
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
  // Additional Middleware for logging
  app.use((req, _res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} from ${req.hostname}`);
    console.log('supervisor', process.env.SUPERVISOR_TOKEN ?? 'unknown');
    next();
  });
  // listen for api endpoints with /api as base

  if (process.env.NODE_ENV === 'production') {
    app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets')));
    app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  } else {
    // enable cors
    app.use(cors());
  }
  app.use(
    '/api',
    createExpressMiddleware({
      router: appRouter
    })
  );
  server.listen(config.ports.SERVER_PORT, '0.0.0.0', () => {
    console.log(`API listening on port ${config.ports.SERVER_PORT}`);
  });
  process.on('SIGTERM', () => {
    server.close();
  });
}
