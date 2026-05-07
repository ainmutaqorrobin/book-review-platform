import { Request } from "express";
import { rateLimit } from "express-rate-limit";

const GLOBAL_WINDOW_MS = 15 * 60 * 1000;
const GLOBAL_LIMIT = 100;
const REVIEW_WINDOW_MS = Number(
  process.env.REVIEW_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
);
const REVIEW_LIMIT = Number(process.env.REVIEW_RATE_LIMIT_MAX || 300);

function isReviewCreateRequest(req: Request) {
  if (req.method !== "POST") return false;

  return (
    /^\/reviews\/\d+$/.test(req.path) || /^\/books\/\d+\/reviews$/.test(req.path)
  );
}

export const globalRateLimiter = rateLimit({
  windowMs: GLOBAL_WINDOW_MS,
  limit: Number(process.env.GLOBAL_RATE_LIMIT_MAX || GLOBAL_LIMIT),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => isReviewCreateRequest(req),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

export const reviewCreateRateLimiter = rateLimit({
  windowMs: REVIEW_WINDOW_MS,
  limit: REVIEW_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many review submissions from this IP, please try again later.",
  },
});
