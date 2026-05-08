import { query } from "express-validator";

export const createPaginationValidation = (maxLimit: number) => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: maxLimit })
    .withMessage(`Limit must be between 1 and ${maxLimit}`),
];
