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
import { createReview } from "../models/review";
import pool from "../config/db";
import { enrichReviewText } from "../mastra/agents/analyze-agent";
import { AppError } from "../utils/appError";
import { getPaginationQuery } from "../utils/pagination";
import {
  deleteStoredCoverObject,
  serializeBookCollection,
  serializeBookRecord,
  uploadBookCover,
} from "../storage/bookCovers";

const BOOKS_DEFAULT_LIMIT = 9;

function getOptionalTrimmedString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : "";
}

function getNullableBookDescription(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

async function deleteStoredCoverObjectSafely(
  coverImageValue: string | null | undefined,
) {
  try {
    await deleteStoredCoverObject(coverImageValue);
  } catch (error) {
    console.error("Failed to delete stored cover object", {
      coverImageValue,
      error,
    });
  }
}

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = getPaginationQuery(
      req.query.page,
      req.query.limit,
      BOOKS_DEFAULT_LIMIT,
    );
    const query =
      typeof req.query.query === "string" ? req.query.query.trim() : undefined;
    const scope = req.query.scope === "mine" ? "mine" : "all";

    if (scope === "mine" && !req.user) {
      throw new AppError("Sign in to view your books", 401);
    }

    const books = await getAllBooks({
      page,
      limit,
      query,
      ownerUserId: scope === "mine" ? req.user?.userId : undefined,
    });
    const serializedBooks = {
      ...books,
      items: serializeBookCollection(books.items),
    };

    return sendResponse(
      res,
      200,
      "Books retrieved successfully",
      serializedBooks,
    );
  } catch (err) {
    next(err);
  }
};

export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookId = Number(req.params.bookId);
    const book = await getBookById(bookId);

    if (!book) throw new NotFoundError(`Book with ID ${bookId} not found`);

    return sendResponse(
      res,
      200,
      "Book retrieved successfully",
      serializeBookRecord(book),
    );
  } catch (err) {
    next(err);
  }
};

export const createSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { title, author } = req.body;
    const description = getNullableBookDescription(req.body.description);
    const externalCoverUrl = getOptionalTrimmedString(req.body.cover_image_url);
    const uploadedCover = req.file;

    const createdBook = await createBook({
      title,
      author,
      description,
      cover_image_url: uploadedCover ? null : externalCoverUrl || null,
      owner_user_id: req.user.userId,
    });

    if (!uploadedCover) {
      return sendResponse(
        res,
        201,
        "Book created successfully",
        serializeBookRecord(createdBook),
      );
    }

    try {
      const coverKey = await uploadBookCover({
        bookId: createdBook.id,
        buffer: uploadedCover.buffer,
        mimeType: uploadedCover.mimetype,
      });

      const updatedBook = await updateBook(createdBook.id, {
        cover_image_url: coverKey,
      });

      if (!updatedBook) {
        throw new NotFoundError(`Book with ID ${createdBook.id} not found`);
      }

      return sendResponse(
        res,
        201,
        "Book created successfully",
        serializeBookRecord(updatedBook),
      );
    } catch (error) {
      try {
        await deleteBook(createdBook.id);
      } catch (rollbackError) {
        console.error("Failed to roll back book creation after cover upload", {
          rollbackError,
        });
      }

      throw error;
    }
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
    const bookId = Number(req.params.bookId);
    const { reviewer_name, text, rating } = req.body;

    const book = await pool.query("SELECT id FROM books WHERE id = $1", [
      bookId,
    ]);

    if (book.rowCount === 0) {
      throw new NotFoundError(`Book with ID ${bookId} not found`);
    }

    const { sentimentScore, summary, tags } = await enrichReviewText(text);

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
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.bookId);
    const existingBook = await getBookById(id);

    if (!existingBook) throw new NotFoundError(`Book with ID ${id} not found`);

    const { title, author } = req.body;
    const description = getNullableBookDescription(req.body.description);
    const uploadedCover = req.file;
    const hasCoverImageUrlField =
      typeof req.body.cover_image_url === "string" &&
      req.body.cover_image_url !== undefined;
    const externalCoverUrl = getOptionalTrimmedString(req.body.cover_image_url);

    let coverUpdateValue: string | null | undefined;

    if (uploadedCover) {
      const uploadedCoverKey = await uploadBookCover({
        bookId: id,
        buffer: uploadedCover.buffer,
        mimeType: uploadedCover.mimetype,
      });

      try {
        const updatedBook = await updateBook(id, {
          title,
          author,
          description,
          cover_image_url: uploadedCoverKey,
        });

        if (!updatedBook) {
          throw new NotFoundError(`Book with ID ${id} not found`);
        }

        if (
          existingBook.cover_image_url &&
          existingBook.cover_image_url !== uploadedCoverKey
        ) {
          await deleteStoredCoverObjectSafely(existingBook.cover_image_url);
        }

        return sendResponse(
          res,
          200,
          "Book updated successfully",
          serializeBookRecord(updatedBook),
        );
      } catch (error) {
        await deleteStoredCoverObjectSafely(uploadedCoverKey);
        throw error;
      }
    }

    if (hasCoverImageUrlField) {
      coverUpdateValue = externalCoverUrl || null;
    }

    const updated = await updateBook(id, {
      title,
      author,
      description,
      cover_image_url: coverUpdateValue,
    });

    if (!updated) throw new NotFoundError(`Book with ID ${id} not found`);

    if (
      coverUpdateValue !== undefined &&
      existingBook.cover_image_url &&
      existingBook.cover_image_url !== coverUpdateValue
    ) {
      await deleteStoredCoverObjectSafely(existingBook.cover_image_url);
    }

    return sendResponse(
      res,
      200,
      "Book updated successfully",
      serializeBookRecord(updated),
    );
  } catch (err) {
    next(err);
  }
};

export const deleteSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.bookId);
    const deleted = await deleteBook(id);

    if (!deleted) throw new NotFoundError(`Book with ID ${id} not found`);

    await deleteStoredCoverObjectSafely(deleted.cover_image_url);

    return sendResponse(
      res,
      200,
      "Book deleted successfully",
      serializeBookRecord(deleted),
    );
  } catch (err) {
    next(err);
  }
};
