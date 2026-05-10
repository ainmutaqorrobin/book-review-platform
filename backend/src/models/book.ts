import pool from "../config/db";
import { Book } from "./type";
import {
  createPaginationMeta,
  getPaginationOffset,
  PaginatedData,
} from "../utils/pagination";

interface GetAllBooksOptions {
  page: number;
  limit: number;
  query?: string;
  ownerUserId?: number;
}

export const getAllBooks = async ({
  page,
  limit,
  query,
  ownerUserId,
}: GetAllBooksOptions): Promise<PaginatedData<Record<string, unknown>>> => {
  const trimmedQuery = query?.trim();
  const filters: string[] = [];
  const params: Array<string | number> = [];

  if (trimmedQuery) {
    params.push(`%${trimmedQuery}%`);
    const queryPosition = params.length;
    filters.push(
      `(title ILIKE $${queryPosition} OR author ILIKE $${queryPosition} OR description ILIKE $${queryPosition})`,
    );
  }

  if (typeof ownerUserId === "number") {
    params.push(ownerUserId);
    filters.push(`owner_user_id = $${params.length}`);
  }

  const whereClause =
    filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM books ${whereClause}`,
    params,
  );
  const totalItems = countResult.rows[0]?.total ?? 0;
  const pagination = createPaginationMeta(page, limit, totalItems);
  const limitPosition = params.length + 1;
  const offsetPosition = params.length + 2;

  const result = await pool.query(
    `SELECT *
     FROM books
     ${whereClause}
     ORDER BY created_at DESC, id DESC
     LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
    [...params, pagination.limit, getPaginationOffset(pagination)],
  );

  return {
    items: result.rows,
    pagination,
  };
};

export const getBookById = async (id: number) => {
  const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
  return result.rows[0];
};

export const createBook = async (data: Book) => {
  const result = await pool.query(
    `INSERT INTO books (title, author, description, cover_image_url, owner_user_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      data.title,
      data.author,
      data.description ?? null,
      data.cover_image_url ?? null,
      data.owner_user_id ?? null,
    ],
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
    ],
  );

  return result.rows[0];
};

export const deleteBook = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM books WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};
