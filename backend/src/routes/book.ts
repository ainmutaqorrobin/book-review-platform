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

router.get("/:id", getBookValidation, handleValidation, getBook);

router.post(
  "/",
  createSingleBookValidation,
  handleValidation,
  createSingleBook
);

router.post(
  "/:id/reviews",
  createBookReviewValidation,
  handleValidation,
  createBookReview
);

router.put(
  "/:id",
  updateSingleBookValidation,
  handleValidation,
  updateSingleBook
);

router.delete(
  "/:id",
  deleteSingleBookValidation,
  handleValidation,
  deleteSingleBook
);

export { router as BookRouter };
