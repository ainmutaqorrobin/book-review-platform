import { body, param } from "express-validator";

export const getBookValidation = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
];

export const createSingleBookValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required and cannot be empty"),
  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required and cannot be empty"),
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

export const updateSingleBookValidation = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("author")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Author cannot be empty"),
  body("description").optional().isString(),
  body("cover_image_url").optional().isString(),
];

export const deleteSingleBookValidation = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
];
