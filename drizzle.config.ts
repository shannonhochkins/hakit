import { defineConfig } from "drizzle-kit";

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/server/db/schema/*",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});