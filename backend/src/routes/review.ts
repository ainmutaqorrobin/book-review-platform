import { Router } from "express";
import { getBookReviews, createBookReview } from "../controllers/review";
import { handleValidation } from "../middlewares/validateRequest";
import {
  createBookReviewValidation,
  getBookReviewsValidation,
} from "../validation/review";
import { optionalAuth } from "../middlewares/auth";
import { reviewCreateRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get(
  "/:bookId",
  getBookReviewsValidation,
  handleValidation,
  getBookReviews,
);

router.post(
  "/:bookId",
  reviewCreateRateLimiter,
  optionalAuth,
  createBookReviewValidation,
  handleValidation,
  createBookReview,
);

export { router as ReviewRouter };
