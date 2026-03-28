import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { loadEnvFiles } from "@/lib/load-env-files";

import * as schema from "./schema";

loadEnvFiles();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
