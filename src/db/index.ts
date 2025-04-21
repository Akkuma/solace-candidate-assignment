import { config } from "@dotenvx/dotenvx";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { advocates } from "./schema";

/* This is only for interview purposes and not what I would normally do
The type returned here because of the mocking breaks types across the repo

const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return {
      select: () => ({
        from: () => [],
      }),
    };
  }

  // for query purposes
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);
  return db;
};
*/

config({ path: [".env.local", ".env"] });

export let sql: postgres.Sql<{}> | undefined = undefined;
if (process.env.DATABASE_URL) {
  sql = postgres(process.env.DATABASE_URL);
} else {
  console.warn("DATABASE_URL is not set");
}

export const db = sql
  ? drizzle({ client: sql, schema: { advocates } })
  : // Drizzle has their own mocking
    drizzle.mock({ schema: { advocates } });
