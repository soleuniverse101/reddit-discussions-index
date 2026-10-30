import { drizzle } from "drizzle-orm/node-postgres";
import { tryMigrate } from "./migrate";
import { relations } from "./relations";
import { providerEnum } from "./schema";

export function createDatabase(url: string) {
  return drizzle(url, { relations });
}

export { tryMigrate };

export const providers = providerEnum.enumValues;
