import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/appError";
import { logger } from "../services/logger";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestLogger = req.log ?? logger;

  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof MulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Cover image must be 5 MB or smaller"
        : err.message;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message || message;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  const errorPayload = {
    err,
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
  };

  if (statusCode >= 500) {
    requestLogger.error(errorPayload, "Request failed");
  } else {
    requestLogger.warn(errorPayload, "Request failed");
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
