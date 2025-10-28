import { body, param } from "express-validator";

export const getBookValidation = [
  param("id")
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

export const updateSingleBookValidation = [
  param("id")
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
  param("id")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
];
