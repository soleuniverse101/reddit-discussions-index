import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  snakeCase,
  text,
} from "drizzle-orm/pg-core";

export const discussions = pgTable("discussions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text().notNull(),
});

export const providerEnum = pgEnum("provider", [
  "anidb",
  "anilist",
  "myanimelist",
]);

export const discussionRefs = snakeCase.table(
  "discussion_refs",
  {
    discussionId: integer()
      .notNull()
      .references(() => discussions.id, {}),
    provider: providerEnum().notNull(),
    externalId: text().notNull(),
  },
  (t) => [primaryKey({ columns: [t.discussionId, t.provider] })],
);
