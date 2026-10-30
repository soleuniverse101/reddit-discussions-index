import z from "zod";

const envSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string().default("5432"),
  POSTGRES_DB: z.string().default("rdi"),
  POSTGRES_USER: z.string().default("rdi"),
  POSTGRES_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

export const DATABASE_URL = `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
