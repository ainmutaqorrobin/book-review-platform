import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err: any) => ({
        field: err.path || err.param || "unknown",
        message: err.msg,
      })),
    });
  }
  next();
};
