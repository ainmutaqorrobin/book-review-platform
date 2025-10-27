import pool from "../config/db";
import { Book } from "./type";

export const getAllBooks = async () => {
  const result = await pool.query(
    "SELECT * FROM books ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getBookById = async (id: number) => {
  const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0];
};

export const createBook = async (data: Book) => {
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

export const updateBook = async (id: number, data: Partial<Book>) => {
  const result = await pool.query(
    `UPDATE books
     SET title = COALESCE($1, title),
         author = COALESCE($2, author),
         description = COALESCE($3, description),
         cover_image_url = COALESCE($4, cover_image_url)
     WHERE id = $5
     RETURNING *`,
    [
      data.title ?? null,
      data.author ?? null,
      data.description ?? null,
      data.cover_image_url ?? null,
      id,
    ]
  );

  return result.rows[0];
};

export const deleteBook = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM books WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
