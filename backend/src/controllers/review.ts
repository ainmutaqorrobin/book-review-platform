import { Request, Response, NextFunction } from "express";
import { getReviewsByBookId, createReview } from "../models/review";
import { sendResponse } from "../utils/responseHelper";
import pool from "../config/db";
import { NotFoundError } from "../utils/notfoundError";
import { enrichReviewText } from "../mastra/agents/analyze-agent";

export const getBookReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = Number(req.params.bookId);

    const book = await pool.query("SELECT id FROM books WHERE id = $1", [
      bookId,
    ]);

    if (book.rowCount === 0)
      throw new NotFoundError(`Book with ID ${bookId} not found`);

    const reviews = await getReviewsByBookId(bookId);
    return sendResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (err) {
    next(err);
  }
};

export const createBookReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = Number(req.params.bookId);
    const { reviewer_name, text, rating } = req.body;

    const book = await pool.query("SELECT id FROM books WHERE id = $1", [
      bookId,
    ]);

    if (book.rowCount === 0)
      throw new NotFoundError(`Book with ID ${bookId} not found`);

    const { sentimentLabel, sentimentScore, summary, tags } =
      await enrichReviewText(text);

    const newReview = await createReview({
      book_id: bookId,
      reviewer_name,
      text,
      rating,
      summary,
      sentiment_score: sentimentScore,
      tags,
    });

    return sendResponse(res, 201, "Review added successfully", newReview);
  } catch (err) {
    next(err);
  }
};
