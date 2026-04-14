import "dotenv/config";
import { readFile } from "node:fs/promises";
import { Client } from "pg";

const seedFile = new URL("../db/sample.sql", import.meta.url);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  const sql = await readFile(seedFile, "utf8");

  await client.connect();
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");

  console.log("Seed completed successfully.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
