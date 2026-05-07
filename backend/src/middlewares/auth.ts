import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";
import { getBookById } from "../models/book";
import { PersistedRole, Role } from "../models/type";
import { NotFoundError } from "../utils/notfoundError";

function getAuthenticatedUser(req: Request) {
  const token = req.cookies.jwt;
  if (!token) return null;

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: number;
    role: PersistedRole;
  };

  return { userId: payload.userId, role: payload.role };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    req.user = getAuthenticatedUser(req) ?? undefined;
    return next();
  } catch {
    req.user = undefined;
    return next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) return next(new AppError("Authentication required", 401));

    req.user = user;
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}

export function authorizeRoles(...allowedRoles: PersistedRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("Authentication required", 401));

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You don't have access for this action", 403));
    }

    return next();
  };
}

export async function authorizeBookOwnerOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    if (req.user.role === Role.ADMIN) return next();

    const bookId = Number(req.params.bookId);
    const book = await getBookById(bookId);

    if (!book) throw new NotFoundError(`Book with ID ${bookId} not found`);

    if (book.owner_user_id !== req.user.userId) {
      throw new AppError("You don't have access for this action", 403);
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
