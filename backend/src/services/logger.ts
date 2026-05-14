import pino from "pino";
import { getLogLevel, isPrettyLoggingEnabled } from "../config/env";

const redactedPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  'res.headers["set-cookie"]',
  "req.body.password",
  "req.body.currentPassword",
  "req.body.newPassword",
  "req.body.token",
];

const transport = isPrettyLoggingEnabled()
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        translateTime: "SYS:standard",
      },
    })
  : undefined;

export const logger = pino(
  {
    level: getLogLevel(),
    redact: {
      paths: redactedPaths,
      remove: true,
    },
  },
  transport,
);
