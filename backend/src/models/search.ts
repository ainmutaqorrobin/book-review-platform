import pool from "../config/db";

export const searchBooksAndReviews = async (query: string) => {
  const searchTerm = `%${query}%`;

  const books = await pool.query(
    `SELECT id, title, author, description, cover_image_url, created_at
     FROM books
     WHERE title ILIKE $1 OR author ILIKE $1 OR description ILIKE $1
     ORDER BY created_at DESC`,
    [searchTerm]
  );

  const reviews = await pool.query(
    `SELECT r.id, r.book_id, r.reviewer_name, r.text, r.rating, r.created_at, b.title AS book_title
     FROM reviews r
     JOIN books b ON b.id = r.book_id
     WHERE r.text ILIKE $1 OR r.reviewer_name ILIKE $1
     ORDER BY r.created_at DESC`,
    [searchTerm]
  );

  return {
    books: books.rows,
    reviews: reviews.rows,
  };
};
