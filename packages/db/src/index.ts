import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "./env.js";
import { tryMigrate } from "./migrate.js";
import { relations } from "./relations.js";
import { providerEnum } from "./schema.js";

export function createDatabase() {
  return drizzle(DATABASE_URL, { relations });
}

export { tryMigrate };

export const providers = providerEnum.enumValues;
