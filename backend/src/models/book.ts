import pool from "../config/db";

export const getAllBooks = async () => {
  const result = await pool.query(
    "SELECT * FROM books ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getBookById = async (id: number) => {
  console.log(id);
  const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  console.log(result);
  return result.rows[0];
};

export const createBook = async (data: {
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
}) => {
  const result = await pool.query(
    `INSERT INTO books (title, author, description, cover_image_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [
      data.title,
      data.author,
      data.description ?? null,
      data.cover_image_url ?? null,
    ]
  );
  return result.rows[0];
};
