import { Pool } from "pg";
import { getDatabaseUrl } from "./env";
import { logger } from "../services/logger";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

pool.on("connect", () => {
  logger.info("Connected to PostgreSQL database");
});

export default pool;
