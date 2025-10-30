import { Request, Response, NextFunction } from "express";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook,
} from "../models/book";
import { sendResponse } from "../utils/responseHelper";
import { NotFoundError } from "../utils/notfoundError";
import { createReview, getReviewsByBookId } from "../models/review";
import pool from "../config/db";
import { enrichReviewText } from "../mastra/agents/analyze-agent";

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await getAllBooks();
    return sendResponse(res, 200, "Books retrieved successfully", books);
  } catch (err) {
    next(err);
  }
};

export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = Number(req.params.bookId);
    const book = await getBookById(bookId);

    if (!book) throw new NotFoundError(`Book with ID ${bookId} not found`);

    const reviews = await getReviewsByBookId(bookId);

    const combined = {
      ...book,
      reviews,
    };

    return sendResponse(res, 200, "Book retrieved successfully", combined);
  } catch (err) {
    next(err);
  }
};

export const createSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, author, description, cover_image_url } = req.body;

    const newBook = await createBook({
      title,
      author,
      description,
      cover_image_url,
    });

    return sendResponse(res, 201, "Book created successfully", newBook);
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

    if (book.rowCount === 0) {
      throw new NotFoundError(`Book with ID ${bookId} not found`);
    }

    const { sentimentLabel, sentimentScore, summary, tags } =
      await enrichReviewText(text);

    // Create review with enriched data
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

export const updateSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.bookId);
    const { title, author, description, cover_image_url } = req.body;

    const updated = await updateBook(id, {
      title,
      author,
      description,
      cover_image_url,
    });

    if (!updated) throw new NotFoundError(`Book with ID ${id} not found`);

    return sendResponse(res, 200, "Book updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

export const deleteSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.bookId);
    const deleted = await deleteBook(id);

    if (!deleted) throw new NotFoundError(`Book with ID ${id} not found`);

    return sendResponse(res, 200, "Book deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
