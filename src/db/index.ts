import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl) {
    throw new Error(
      "Missing required environment variable: TURSO_DATABASE_URL",
    );
  }

  if (!authToken) {
    throw new Error("Missing required environment variable: TURSO_AUTH_TOKEN");
  }

  const client = createClient({
    url: databaseUrl,
    authToken,
  });

  return drizzle(client, { schema });
}

let dbInstance: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (dbInstance === undefined) {
    dbInstance = createDb();
  }

  return dbInstance;
}
