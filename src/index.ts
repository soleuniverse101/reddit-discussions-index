import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import z from "zod";
import { relations } from "./db/relations.js";
import { providerRefSchema } from "./zod-schemas.js";

expand(dotenv.config());

const db = drizzle(process.env.DATABASE_URL!, { relations });
const app = new Hono().basePath("/api");

app.get(
  "/discussions",
  zValidator(
    "query",
    z.object({
      providerRef: z.union([
        providerRefSchema.transform((ref) => [ref]),
        z.array(providerRefSchema),
      ]),
    }),
  ),
  async (c) => {
    const { providerRef: providerRefs } = c.req.valid("query");

    return c.json(
      await db.query.discussions.findMany({
        columns: { url: true },
        where: {
          refs: {
            OR: providerRefs,
          },
        },
      }),
    );
  },
);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
