import dotenv from "dotenv";
import { expand } from "dotenv-expand";
import z from "zod";

expand(dotenv.config());

const envSchema = z.object({
  DATABASE_URL: z.string(),
  LOGS_DIR: z.string().default("logs"),
});

export const env = envSchema.parse(process.env);
