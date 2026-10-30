import "@reddit-discussions-index/db";
import { providers } from "@reddit-discussions-index/db";
import z from "zod";

type ProviderId = (typeof providers)[number];

export const providerRefSchema = z
  .templateLiteral([z.enum(providers), ":", z.int()])
  .transform((ref) => {
    const parts = ref.split(":");
    return {
      provider: parts[0] as ProviderId,
      externalId: parts[1],
    };
  });
