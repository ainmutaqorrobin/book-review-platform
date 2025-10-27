import { NextFunction, Request, Response, Router } from "express";
import { param } from "express-validator";
import { handleValidation } from "../middlewares/validateRequest";
import { NotFoundError } from "../utils/notfoundError";
import { getBook, getBooks } from "../controllers/book";
import { AppError } from "../utils/appError";
import { getBookById } from "../models/book";

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

export { router as BookRouter };
