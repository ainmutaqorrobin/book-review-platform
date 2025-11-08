import { Request, Response, NextFunction } from "express";
import { createUser, findUserById, findUserByUsername } from "../models/user";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { sendResponse } from "../utils/responseHelper";

const secretKey = process.env.JWT_SECRET!;
const expiresInMs = Number(process.env.JWT_EXPIRES_IN!);

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, name, role } = req.body;

    const existedUser = await findUserByUsername(username);
    if (existedUser) throw new AppError("Username already taken", 400);

    const user = await createUser(username, password, name, role);
    return sendResponse(res, 201, "User sucessfully", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    const user = await findUserByUsername(username);
    if (!user) throw new AppError("Invalid credentials", 401);

    const isValid = await compare(password, user.password_hash);
    if (!isValid) throw new AppError("Invalid credentials", 401);

    const loggedUser = { userId: user.id, role: user.role };
    const token = jwt.sign(loggedUser, secretKey, { expiresIn: expiresInMs });

    res.cookie("jwt", token, {
      httpOnly: true, // JS cannot access the cookie
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: "strict", // CSRF protection
      maxAge: expiresInMs, // must be in milliseconds
    });

    return sendResponse(res, 200, "Logged in", null);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    const user = await findUserById(req.user.userId);
    if (!user) throw new AppError("User not found", 404);

    return sendResponse(res, 200, "Current user", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return sendResponse(res, 200, "Logged out", null);
  } catch (err) {
    next(err);
  }
};
