import pool from "../config/db";
import { Review } from "./type";

export const getReviewsByBookId = async (bookId: number) => {
  const result = await pool.query(
    "SELECT * FROM reviews WHERE book_id = $1 ORDER BY created_at DESC",
    [bookId]
  );
  return result.rows;
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
    ]
  );
  return result.rows[0];
};
