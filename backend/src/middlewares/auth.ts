import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";
import { Role } from "../models/type";

export function signedUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.jwt;
  if (!token) return next(new AppError("Authentication required", 401));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      role: string;
    };

    req.user = { userId: payload.userId, role: payload.role as Role };
    return next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.user);
    if (!req.user) return next(new AppError("Authentication required", 401));

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You don't have access for this action", 403));
    }

    return next();
  };
}
