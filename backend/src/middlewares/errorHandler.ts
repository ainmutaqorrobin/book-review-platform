import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
