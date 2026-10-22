import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";

expand(dotenv.config());

const db = drizzle(process.env.DATABASE_URL!);
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
