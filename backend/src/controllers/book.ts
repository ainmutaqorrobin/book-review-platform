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
    const book = await getBookById(Number(req.params.id));
    if (!book)
      throw new NotFoundError(`Book with ID ${req.params.id} not found`);

    return sendResponse(res, 200, "Book retrieved successfully", book);
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

export const updateSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
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
    const id = Number(req.params.id);
    const deleted = await deleteBook(id);

    if (!deleted) {
      return next(new NotFoundError(`Book with ID ${id} not found`));
    }

    return sendResponse(res, 200, "Book deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
