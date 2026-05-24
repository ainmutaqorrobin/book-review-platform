import { Request, Response, NextFunction } from "express";
import { getReviewsByBookId } from "../models/review";
import { sendResponse } from "../utils/responseHelper";
import pool from "../config/db";
import { NotFoundError } from "../utils/notfoundError";
import { getPaginationQuery } from "../utils/pagination";
import { submitReviewForEnrichment } from "../services/review-enrichment";

const REVIEWS_DEFAULT_LIMIT = 5;

export const getBookReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookId = Number(req.params.bookId);
    const { page, limit } = getPaginationQuery(
      req.query.page,
      req.query.limit,
      REVIEWS_DEFAULT_LIMIT,
    );

    const book = await pool.query("SELECT id FROM books WHERE id = $1", [
      bookId,
    ]);

    if (book.rowCount === 0)
      throw new NotFoundError(`Book with ID ${bookId} not found`);

    const reviews = await getReviewsByBookId(bookId, { page, limit });
    return sendResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (err) {
    next(err);
  }
};

export const createBookReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const review = await submitReviewForEnrichment({
      bookId: Number(req.params.bookId),
      reviewer_name: req.body.reviewer_name,
      text: req.body.text,
      rating: req.body.rating,
    });

    return sendResponse(res, 201, "Review added successfully", review);
  } catch (err) {
    next(err);
  }
};
