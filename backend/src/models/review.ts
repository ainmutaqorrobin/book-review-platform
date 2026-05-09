import pool from "../config/db";
import { Review } from "./type";
import {
  createPaginationMeta,
  getPaginationOffset,
  PaginatedData,
} from "../utils/pagination";

interface GetReviewsByBookIdOptions {
  page: number;
  limit: number;
}

export const getReviewsByBookId = async (
  bookId: number,
  { page, limit }: GetReviewsByBookIdOptions,
): Promise<PaginatedData<Record<string, unknown>>> => {
  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM reviews WHERE book_id = $1",
    [bookId],
  );
  const totalItems = countResult.rows[0]?.total ?? 0;
  const pagination = createPaginationMeta(page, limit, totalItems);
  const result = await pool.query(
    `SELECT *
     FROM reviews
     WHERE book_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2 OFFSET $3`,
    [bookId, pagination.limit, getPaginationOffset(pagination)],
  );

  return {
    items: result.rows,
    pagination,
  };
};

export const createReview = async (data: Review) => {
  const result = await pool.query(
    `INSERT INTO reviews (book_id, reviewer_name, text, rating, summary, sentiment_score, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.book_id,
      data.reviewer_name,
      data.text,
      data.rating,
      data.summary ?? null,
      data.sentiment_score ?? null,
      JSON.stringify(data.tags ?? []),
    ],
  );
  return result.rows[0];
};
