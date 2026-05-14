import { body, param, query } from "express-validator";
import { createPaginationValidation } from "./pagination";

function validateCoverUrl(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string") {
    throw new Error("Cover image URL must be a string");
  }

  const parsedUrl = new URL(value);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Cover image URL must use http or https");
  }

  return true;
}

const validateSingleCoverSource = body().custom((_, { req }) => {
  const hasFile = Boolean(req.file);
  const hasCoverUrl =
    typeof req.body.cover_image_url === "string" &&
    req.body.cover_image_url.trim().length > 0;

  if (hasFile && hasCoverUrl) {
    throw new Error("Provide either a cover image URL or a cover file");
  }

  return true;
});

export const getBooksValidation = [
  ...createPaginationValidation(24),
  query("query")
    .optional()
    .isString()
    .withMessage("Query must be a string")
    .trim(),
  query("scope")
    .optional()
    .isIn(["all", "mine"])
    .withMessage("Scope must be either all or mine"),
];

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
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("cover_image_url").custom(validateCoverUrl),
  validateSingleCoverSource,
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
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("cover_image_url").custom(validateCoverUrl),
  validateSingleCoverSource,
];

export const deleteSingleBookValidation = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("Book ID must be a positive integer"),
];
