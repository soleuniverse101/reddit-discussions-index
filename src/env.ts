import z from "zod";

const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_DB: z.string().default("rdi"),
  POSTGRES_USER: z.string().default("rdi"),
  POSTGRES_PASSWORD: z.string(),
  LOGS_DIR: z.string().default("logs"),
});

export const env = envSchema.parse(process.env);

export const DATABASE_URL = `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:5432/${env.POSTGRES_DB}`;
