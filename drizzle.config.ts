import { config as dotConfig } from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

dotConfig({ path: [".env.local", ".env"] });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set in env");

// Improved the type safety https://orm.drizzle.team/docs/drizzle-config-file
const config = defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

export default config;
