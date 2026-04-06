import { migrate } from "drizzle-orm/libsql/migrator";

import { logger } from "@/lib/logger";
import { getDb } from "./index";

async function main() {
  logger.info("Running migrations...");
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  logger.info("Migrations complete.");
  process.exit(0);
}

main().catch((error) => {
  logger.error(
    { error: error instanceof Error ? error.message : "Unknown error" },
    "Migration failed",
  );
  process.exit(1);
});
