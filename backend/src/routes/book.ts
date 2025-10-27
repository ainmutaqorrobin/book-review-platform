import { Router } from "express";
import { body, param } from "express-validator";
import { handleValidation } from "../middlewares/validateRequest";
import {
  createSingleBook,
  deleteSingleBook,
  getBook,
  getBooks,
  updateSingleBook,
} from "../controllers/book";

const router = Router();

router.get("/", getBooks);

router.get(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a positive integer"),
  ],
  handleValidation,
  getBook
);

router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required and cannot be empty"),
    body("author")
      .trim()
      .notEmpty()
      .withMessage("Author is required and cannot be empty"),
  ],
  handleValidation,
  createSingleBook
);

router.put(
  "/:id",
  [
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
  ],
  handleValidation,
  updateSingleBook
);

router.delete(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a positive integer"),
  ],
  handleValidation,
  deleteSingleBook
);

export { router as BookRouter };
