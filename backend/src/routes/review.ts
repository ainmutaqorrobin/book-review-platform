import { Router } from "express";
import { getBookReviews, createBookReview } from "../controllers/review";
import { handleValidation } from "../middlewares/validateRequest";
import {
  createBookReviewValidation,
  getBookReviewsValidation,
} from "../validation/review";

const router = Router();

router.get(
  "/:bookId",
  getBookReviewsValidation,
  handleValidation,
  getBookReviews
);

router.post(
  "/:bookId",
  createBookReviewValidation,
  handleValidation,
  createBookReview
);

export { router as ReviewRouter };
