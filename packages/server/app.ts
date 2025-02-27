import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
// routes
// import uploadRoute from "./routes/upload";
import configRoute from "./routes/config";
import { authRoute } from "./routes/auth";

const app = new Hono();

app.use("*", logger());

const apiRoutes = app
  .basePath("/api")
  .route("/config", configRoute)
  .route("/", authRoute);

app.get("*", serveStatic({ root: "./packages/client/dist" }));
app.get("*", serveStatic({ path: "./packages/client/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;