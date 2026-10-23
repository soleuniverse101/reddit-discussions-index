import { getConnInfo } from "@hono/node-server/conninfo";
import { structuredLogger } from "@hono/structured-logger";
import type { Context } from "hono";
import { every } from "hono/combine";
import { requestId } from "hono/request-id";
import { join } from "path";
import pino from "pino";
import { env } from "./env.js";

const logger = pino(
  { base: null }, // removes pid and hostname
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

function responseInfo(c: Context, elapsedMs: number) {
  const { address: remoteAddress, port: remotePort } = getConnInfo(c).remote;

  return {
    elapsedMs,
    remoteAddress,
    remotePort,
    userAgent: c.req.header("User-Agent"),
  };
}

export const loggerMiddleware = every(
  requestId(),
  structuredLogger({
    createLogger: (c) => logger.child({ requestId: c.var.requestId }),
    onResponse: (logger, c, elapsedMs) =>
      logger.info(
        responseInfo(c, elapsedMs),
        `${c.req.method} ${c.req.path} ${c.res.status}`,
      ),
    onError: (logger, err, c, elapsedMs) =>
      logger.error(
        { err, ...responseInfo(c, elapsedMs) },
        `${c.req.method} ${c.req.path} ${c.res.status}`,
      ),
  }),
);
