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

export let queryClient: postgres.Sql<{}> | undefined = undefined;
if (process.env.DATABASE_URL) {
  queryClient = postgres(process.env.DATABASE_URL);
} else {
  console.warn("DATABASE_URL is not set");
}

export const db = queryClient
  ? drizzle({ client: queryClient, schema: { advocates } })
  : // Drizzle has their own mocking
    drizzle.mock({ schema: { advocates } });
