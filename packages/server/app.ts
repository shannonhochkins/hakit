import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
// routes
// import uploadRoute from "./routes/upload";
import dashboardRoute from './routes/dashboard';
import repositoriesRoutes from './routes/repositories';
import authRoute from './routes/auth';
import uploadRoute from './routes/upload';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPISpecs, describeRoute } from 'hono-openapi';
import issuesRoute from './routes/issues';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

const healthRoute = new Hono().get(
  '/health',
  describeRoute({
    description: 'Health check',
    responses: {
      200: { description: 'OK' },
    },
    tags: ['Health'],
  }),
  c => c.json({ status: 'ok' })
);

export const apiRoutes = app
  .basePath('/api')
  .route('/dashboard', dashboardRoute)
  .route('/repositories', repositoriesRoutes)
  .route('/upload', uploadRoute)
  .route('/issues', issuesRoute)
  .route('/', authRoute)
  .route('/', healthRoute)
  // OpenAPI JSON (document)
  .get(
    '/doc',
    openAPISpecs(app, {
      documentation: {
        info: {
          title: 'Hakit API',
          version: '1.0.0',
          description: 'OpenAPI specification for Hakit server',
        },
        servers: [
          { url: 'http://localhost:3000', description: 'Local proxy' },
          { url: 'http://localhost:5000', description: 'Direct' },
        ],
      },
    })
  )
  // Scalar UI
  .get(
    '/docs',
    Scalar({
      url: '/api/doc',
      pageTitle: 'Hakit API',
    })
  );

app.get('*', serveStatic({ root: './packages/client/dist' }));
app.get('*', serveStatic({ path: './packages/client/dist/index.html' }));

export default app;
export type ApiRoutes = typeof apiRoutes;
