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
  getBooksValidation,
  updateSingleBookValidation,
} from "../validation/book";
import {
  authorizeBookOwnerOrAdmin,
  authorizeRoles,
  optionalAuth,
  requireAuth,
} from "../middlewares/auth";
import { Role } from "../models/type";
import { reviewCreateRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/", optionalAuth, getBooksValidation, handleValidation, getBooks);

router.get("/:bookId", getBookValidation, handleValidation, getBook);

router.post(
  "/",
  requireAuth,
  authorizeRoles(Role.USER, Role.ADMIN),
  createSingleBookValidation,
  handleValidation,
  createSingleBook,
);

router.post(
  "/:bookId/reviews",
  reviewCreateRateLimiter,
  optionalAuth,
  createBookReviewValidation,
  handleValidation,
  createBookReview,
);

router.put(
  "/:bookId",
  requireAuth,
  updateSingleBookValidation,
  handleValidation,
  authorizeBookOwnerOrAdmin,
  updateSingleBook,
);

router.delete(
  "/:bookId",
  requireAuth,
  deleteSingleBookValidation,
  handleValidation,
  authorizeBookOwnerOrAdmin,
  deleteSingleBook,
);

export { router as BookRouter };
