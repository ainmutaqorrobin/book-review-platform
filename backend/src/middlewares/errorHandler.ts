import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/appError";

export const errorHandler = (
  err: AppError | MulterError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Request error:", err.message);

  if (err instanceof MulterError) {
    const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Cover image must be 5 MB or smaller"
        : err.message;

    res.status(statusCode).json({
      success: false,
      message,
    });
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
