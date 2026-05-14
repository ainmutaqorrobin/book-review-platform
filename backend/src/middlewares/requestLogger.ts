import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import { logger } from "../services/logger";

function getRequestId(req: Request, res: Response) {
  const headerValue = req.headers["x-request-id"];
  const requestId =
    typeof headerValue === "string"
      ? headerValue.trim()
      : Array.isArray(headerValue)
        ? headerValue[0]?.trim()
        : undefined;

  if (requestId) {
    res.setHeader("X-Request-Id", requestId);
    return requestId;
  }

  const generatedRequestId = randomUUID();
  res.setHeader("X-Request-Id", generatedRequestId);
  return generatedRequestId;
}

export const requestLogger = pinoHttp({
  logger,
  genReqId: getRequestId,
  customAttributeKeys: {
    reqId: "requestId",
  },
  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
  serializers: {
    err: pino.stdSerializers.err,
    req(req) {
      const userAgentHeader = req.headers["user-agent"];

      return {
        id: req.id,
        method: req.method,
        path: req.originalUrl || req.path || req.url,
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: Array.isArray(userAgentHeader)
          ? userAgentHeader[0]
          : userAgentHeader,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customSuccessMessage() {
    return "request completed";
  },
  customErrorMessage() {
    return "request completed with error";
  },
  customProps(req) {
    return {
      userId: req.user?.userId,
      userRole: req.user?.role,
    };
  },
});
