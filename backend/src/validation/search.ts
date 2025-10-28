import { query } from "express-validator";

export const searchValidation = [
  query("query")
    .trim()
    .notEmpty()
    .withMessage("Query parameter is required")
    .isLength({ min: 2 })
    .withMessage("Query must be at least 2 characters long"),
];
