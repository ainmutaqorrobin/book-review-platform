import { Request, Response, NextFunction } from "express";
import { searchBooksAndReviews } from "../models/search";
import { sendResponse } from "../utils/responseHelper";
import { AppError } from "../utils/appError";

export const searchHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req.query.query as string)?.trim();

    if (!query || query.length < 2) {
      throw new AppError(
        "Query parameter is required and must be at least 2 characters",
        400
      );
    }

    const result = await searchBooksAndReviews(query);

    return sendResponse(
      res,
      200,
      "Search results fetched successfully",
      result
    );
  } catch (err) {
    next(err);
  }
};
