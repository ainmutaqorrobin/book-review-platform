import "dotenv/config";
import { readFile } from "node:fs/promises";
import { hash } from "bcrypt";
import { Client } from "pg";

const seedFile = new URL("../db/sample.sql", import.meta.url);
const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === "production";
const adminUsername = process.env.ADMIN_SEED_USERNAME || "admin";
const adminName = process.env.ADMIN_SEED_NAME || "Platform Admin";
const adminPassword =
  process.env.ADMIN_SEED_PASSWORD || (isProduction ? null : "admin12345");

if (!connectionString) {
  console.error("DATABASE_URL is not defined.");
  process.exit(1);
}

if (!adminPassword) {
  console.error(
    "ADMIN_SEED_PASSWORD is required when seeding admin credentials in production."
  );
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  const sql = await readFile(seedFile, "utf8");
  const passwordHash = await hash(adminPassword, 10);

  await client.connect();
  await client.query("BEGIN");
  await client.query(sql);
  await client.query(
    `INSERT INTO users (username, password_hash, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (username)
     DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name,
       role = 'admin'`,
    [adminUsername, passwordHash, adminName]
  );
  await client.query("COMMIT");

  console.log(`Seed completed successfully. Admin username: ${adminUsername}`);

  if (!process.env.ADMIN_SEED_PASSWORD && !isProduction) {
    console.log("Default local admin password: admin12345");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
