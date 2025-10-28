import { Router } from "express";
import { handleValidation } from "../middlewares/validateRequest";
import {
  createBookReview,
  createSingleBook,
  deleteSingleBook,
  getBook,
  getBooks,
  updateSingleBook,
} from "../controllers/book";
import {
  createBookReviewValidation,
  createSingleBookValidation,
  deleteSingleBookValidation,
  getBookValidation,
  updateSingleBookValidation,
} from "../validation/book";

const router = Router();

router.get("/", getBooks);

router.get("/:bookId", getBookValidation, handleValidation, getBook);

router.post(
  "/",
  createSingleBookValidation,
  handleValidation,
  createSingleBook
);

router.post(
  "/:bookId/reviews",
  createBookReviewValidation,
  handleValidation,
  createBookReview
);

router.put(
  "/:bookId",
  updateSingleBookValidation,
  handleValidation,
  updateSingleBook
);

router.delete(
  "/:bookId",
  deleteSingleBookValidation,
  handleValidation,
  deleteSingleBook
);

export { router as BookRouter };
