import { Request, Response, NextFunction } from "express";
import { getAllBooks, getBookById } from "../models/book";
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
