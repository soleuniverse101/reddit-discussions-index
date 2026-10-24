import { getConnInfo } from "@hono/node-server/conninfo";
import { structuredLogger } from "@hono/structured-logger";
import type { Context } from "hono";
import { every } from "hono/combine";
import { requestId } from "hono/request-id";
import { join } from "path";
import pino, { type Logger } from "pino";
import type { PrettyOptions } from "pino-pretty";
import { env } from "./env.js";

export function createLogger() {
  return pino(
    { base: null }, // removes pid and hostname
    pino.transport({
      targets: [
        process.env.NODE_ENV == "development"
          ? {
              target: "pino-pretty",
              options: {
                messageFormat:
                  "{if method}[{method} {path} {status}] {end}{msg}",
              } satisfies PrettyOptions,
            }
          : { target: "pino/file" }, // stdout
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
}

function responseInfo(c: Context, elapsedMs: number) {
  const { address: remoteAddress, port: remotePort } = getConnInfo(c).remote;

  return {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    elapsedMs,
    userAgent: c.req.header("User-Agent"),
    remoteAddress,
    remotePort,
  };
}

export function loggerMiddleware(logger: Logger) {
  return every(
    requestId(),
    structuredLogger({
      createLogger: (c) => logger.child({ requestId: c.var.requestId }),
      onResponse: (logger, c, elapsedMs) =>
        logger.info(responseInfo(c, elapsedMs)),
      onError: (logger, err, c, elapsedMs) =>
        logger.error({ err, ...responseInfo(c, elapsedMs) }),
    }),
  );
}
