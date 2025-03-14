import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from 'hono/cors'
import { serveStatic } from "hono/bun";
// routes
// import uploadRoute from "./routes/upload";
import dashboardRoute from "./routes/dashboard";
import componentRoute from "./routes/component";
import authRoute from "./routes/auth";
import assetRoute from "./routes/asset";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

const apiRoutes = app
  .basePath("/api")
  .route("/dashboard", dashboardRoute)
  .route("/component", componentRoute)
  .route("/asset", assetRoute)
  .route("/", authRoute);

app.get("*", serveStatic({ root: "./packages/client/dist" }));
app.get("*", serveStatic({ path: "./packages/client/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;