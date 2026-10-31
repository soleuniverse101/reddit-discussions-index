import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "node:path";
import type { Logger } from "pino";

export async function tryMigrate(db: NodePgDatabase, logger: Logger) {
  try {
    logger.info("Starting migrations...");
    await migrate(db, {
      migrationsFolder: join(import.meta.dirname, "../drizzle"),
    });
    logger.info("All migrations complete.");
  } catch (err) {
    logger.fatal({ err }, "Migration failed. Stopping process.");
    process.exit(1);
  }
}
