import z from "zod";

const envSchema = z.object({
  LOGS_DIR: z.string().default("logs"),
});

export const env = envSchema.parse(process.env);
