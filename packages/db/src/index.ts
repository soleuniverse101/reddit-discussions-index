import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "./env";
import { tryMigrate } from "./migrate";
import { relations } from "./relations";
import { providerEnum } from "./schema";

export function createDatabase() {
  return drizzle(DATABASE_URL, { relations });
}

export { tryMigrate };

export const providers = providerEnum.enumValues;
