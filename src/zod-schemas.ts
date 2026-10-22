import z from "zod";
import { providerEnum } from "./db/schema.js";

type ProviderId = (typeof providerEnum.enumValues)[number];

export const providerRefSchema = z
  .templateLiteral([z.enum(providerEnum.enumValues), ":", z.int()])
  .transform((ref) => {
    const parts = ref.split(":");
    return {
      provider: parts[0] as ProviderId,
      externalId: parts[1],
    };
  });
