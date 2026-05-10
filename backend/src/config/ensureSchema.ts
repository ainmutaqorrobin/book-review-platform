import { readFile } from "node:fs/promises";
import pool from "./db";

const schemaFile = new URL("../../db/schema.sql", import.meta.url);

export async function ensureDatabaseSchema() {
  const schemaSql = await readFile(schemaFile, "utf8");

  // Bootstrap the base schema first so startup does not crash on a fresh DB.
  await pool.query(schemaSql);

  // Keep this lightweight migration for older databases created before ownership.
  await pool.query(`
    ALTER TABLE books
    ADD COLUMN IF NOT EXISTS owner_user_id INTEGER REFERENCES users (id) ON DELETE SET NULL
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_books_owner_user_id
    ON books (owner_user_id)
  `);
}
