import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
// routes
// import uploadRoute from "./routes/upload";
import dashboardRoute from "./routes/dashboard";
import { authRoute } from "./routes/auth";

const app = new Hono();

app.use("*", logger());

const apiRoutes = app
  .basePath("/api")
  .route("/dashboard", dashboardRoute)
  .route("/", authRoute);

app.get("*", serveStatic({ root: "./packages/client/dist" }));
app.get("*", serveStatic({ path: "./packages/client/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoutes;