import { getConnInfo } from "@hono/node-server/conninfo";
import { structuredLogger } from "@hono/structured-logger";
import { every } from "hono/combine";
import { requestId } from "hono/request-id";
import { join } from "path";
import pino from "pino";
import { env } from "./env.js";

const logger = pino(
  pino.transport({
    targets: [
      { target: process.stdout.isTTY ? "pino-pretty" : "file" },
      {
        target: "pino-roll",
        options: {
          file: join(env.LOGS_DIR, "log"),
          frequency: "daily",
          mkdir: true,
          dateFormat: "yyyyMMdd",
        },
      },
    ],
  }),
);

export const loggerMiddleware = every(
  requestId(),
  structuredLogger({
    createLogger: (c) => logger.child({ requestId: c.var.requestId }),
    onResponse: (logger, c, elapsedMs) => {
      const { address: remoteAddress, port: remotePort } =
        getConnInfo(c).remote;

      logger.info(
        {
          elapsedMs,
          remoteAddress,
          remotePort,
          userAgent: c.req.header("User-Agent"),
        },
        `${c.req.method} ${c.req.path} ${c.res.status}`,
      );
    },
  }),
);
