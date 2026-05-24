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

  await pool.query(`
    ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS ai_enrichment_status VARCHAR(20)
  `);

  await pool.query(`
    ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS ai_enrichment_error TEXT
  `);

  await pool.query(`
    ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS ai_enrichment_started_at TIMESTAMP
  `);

  await pool.query(`
    ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS ai_enrichment_completed_at TIMESTAMP
  `);

  await pool.query(`
    UPDATE reviews
    SET ai_enrichment_status = 'completed'
    WHERE ai_enrichment_status IS NULL
  `);

  await pool.query(`
    ALTER TABLE reviews
    ALTER COLUMN ai_enrichment_status SET DEFAULT 'pending',
    ALTER COLUMN ai_enrichment_status SET NOT NULL
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reviews_ai_enrichment_status_check'
      ) THEN
        ALTER TABLE reviews
        ADD CONSTRAINT reviews_ai_enrichment_status_check CHECK (
          ai_enrichment_status IN ('pending', 'processing', 'completed', 'failed')
        );
      END IF;
    END $$;
  `);
}
