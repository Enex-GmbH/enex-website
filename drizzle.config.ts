// drizzle.config.ts — loaded by drizzle-kit CLI (dotenv so DATABASE_URL works without manual export)
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
