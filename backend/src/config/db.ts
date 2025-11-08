import { config } from "dotenv";
import { Pool } from "pg";

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

export default pool;
