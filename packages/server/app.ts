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

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

const healthRoute = new Hono().get('/health', c => c.json({ status: 'ok' }));

export const apiRoutes = app
  .basePath('/api')
  .route('/dashboard', dashboardRoute)
  .route('/repositories', repositoriesRoutes)
  .route('/upload', uploadRoute)
  .route('/', authRoute)
  .route('/', healthRoute);

app.get('*', serveStatic({ root: './packages/client/dist' }));
app.get('*', serveStatic({ path: './packages/client/dist/index.html' }));

export default app;
export type ApiRoutes = typeof apiRoutes;
