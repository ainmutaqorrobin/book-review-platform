import { Request, Response, NextFunction } from "express";
import {
  createUser,
  findUserById,
  findUserByUsername,
  findUserWithPasswordById,
  updateUserPassword,
} from "../models/user";
import { AppError } from "../utils/appError";
import jwt, { type SignOptions } from "jsonwebtoken";
import { compare } from "bcrypt";
import { sendResponse } from "../utils/responseHelper";

const secretKey = process.env.JWT_SECRET!;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN!;

function parseDurationToMilliseconds(value: string) {
  const trimmedValue = value.trim();

  if (/^\d+$/.test(trimmedValue)) {
    return Number(trimmedValue);
  }

  const match = trimmedValue.match(
    /^(\d+)\s*(ms|milliseconds?|s|sec|secs|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?)$/i,
  );

  if (!match) {
    throw new Error(
      "JWT_EXPIRES_IN must be a number in milliseconds or a duration like 1d, 12h, or 30m",
    );
  }

  const [, amountText, unitText] = match;
  const amount = Number(amountText);
  const unit = unitText.toLowerCase();

  const unitMap: Record<string, number> = {
    ms: 1,
    millisecond: 1,
    milliseconds: 1,
    s: 1000,
    sec: 1000,
    secs: 1000,
    second: 1000,
    seconds: 1000,
    m: 60_000,
    min: 60_000,
    mins: 60_000,
    minute: 60_000,
    minutes: 60_000,
    h: 3_600_000,
    hr: 3_600_000,
    hrs: 3_600_000,
    hour: 3_600_000,
    hours: 3_600_000,
    d: 86_400_000,
    day: 86_400_000,
    days: 86_400_000,
    w: 604_800_000,
    week: 604_800_000,
    weeks: 604_800_000,
  };

  return amount * unitMap[unit];
}

function getJwtExpiryConfig(value: string) {
  const expiresInMs = parseDurationToMilliseconds(value);
  const expiresInSeconds = Math.max(1, Math.floor(expiresInMs / 1000));

  return {
    cookieMaxAgeMs: expiresInMs,
    jwtExpiresIn: (/^\d+$/.test(value.trim())
      ? expiresInSeconds
      : value.trim()) as SignOptions["expiresIn"],
  };
}

const { cookieMaxAgeMs, jwtExpiresIn: jwtExpiresInOption } =
  getJwtExpiryConfig(jwtExpiresIn);

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password, name } = req.body;

    const existedUser = await findUserByUsername(username);
    if (existedUser) throw new AppError("Username already taken", 400);

    const user = await createUser(username, password, name);
    return sendResponse(res, 201, "User sucessfully", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;

    const user = await findUserByUsername(username);
    if (!user) throw new AppError("Invalid credentials", 401);

    const isValid = await compare(password, user.password_hash);
    if (!isValid) throw new AppError("Invalid credentials", 401);

    const loggedUser = { userId: user.id, role: user.role };
    const token = jwt.sign(loggedUser, secretKey, {
      expiresIn: jwtExpiresInOption,
    });

    res.cookie("jwt", token, {
      httpOnly: true, // JS cannot access the cookie
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: "strict", // CSRF protection
      maxAge: cookieMaxAgeMs, // must be in milliseconds
    });

    return sendResponse(res, 200, "Logged in", null);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
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

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const { currentPassword, newPassword } = req.body;
    const user = await findUserWithPasswordById(req.user.userId);

    if (!user) throw new AppError("User not found", 404);

    const isCurrentPasswordValid = await compare(
      currentPassword,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError(
        "New password must be different from your current password",
        400,
      );
    }

    const updatedUser = await updateUserPassword(req.user.userId, newPassword);

    if (!updatedUser) throw new AppError("User not found", 404);

    return sendResponse(res, 200, "Password changed successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};
