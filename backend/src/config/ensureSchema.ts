import pool from "./db";

export async function ensureDatabaseSchema() {
  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS owner_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_owner_user_id
    ON books (owner_user_id)
  `);
}
