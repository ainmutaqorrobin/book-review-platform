import { Router } from "express";
import { body, param } from "express-validator";
import { getBookReviews, createBookReview } from "../controllers/review";
import { handleValidation } from "../middlewares/validateRequest";

const router = Router();

router.get(
  "/:bookId",
  [
    param("bookId")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a positive integer"),
  ],
  handleValidation,
  getBookReviews
);

router.post(
  "/:bookId",
  [
    param("bookId")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a positive integer"),
    body("reviewer_name")
      .trim()
      .notEmpty()
      .withMessage("Reviewer name is required"),
    body("text").trim().notEmpty().withMessage("Review text cannot be empty"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],
  handleValidation,
  createBookReview
);

export { router as ReviewRouter };
