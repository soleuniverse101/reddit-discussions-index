import { serve } from "@hono/node-server";
import type { StructuredLoggerEnv } from "@hono/structured-logger";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import z from "zod";
import { relations } from "./db/relations.js";
import { env } from "./env.js";
import { createLogger, loggerMiddleware } from "./logging.js";
import { providerRefSchema } from "./zod-schemas.js";

const logger = createLogger();

const db = drizzle(env.DATABASE_URL, { relations });
const app = new Hono<StructuredLoggerEnv<Logger>>().basePath("/api");
app.use(loggerMiddleware(logger));

app.get(
  "/discussions",
  zValidator(
    "query",
    z.object({
      providerRef: z.union([
        providerRefSchema.transform((ref) => [ref]),
        z.array(providerRefSchema).max(20),
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

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.text("Internal Server Error", 500);
});

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
