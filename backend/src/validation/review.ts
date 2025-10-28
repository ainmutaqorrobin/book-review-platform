import { body, param } from "express-validator";

export const getBookReviewsValidation = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
];

export const createBookReviewValidation = [
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
];
