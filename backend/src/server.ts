import { config } from "dotenv";
import { app } from "./app";
import { ensureDatabaseSchema } from "./config/ensureSchema";

config();

if (!process.env.PORT)
  throw new Error("PORT is not defined in environment variables");

if (!process.env.DATABASE_URL)
  throw new Error("DATABASE_URL is not defined in environment variables");

if (!process.env.ANTHROPIC_API_KEY)
  throw new Error("ANTHROPIC_API_KEY is not defined in environment variables");

if (!process.env.JWT_SECRET)
  throw new Error("JWT_SECRET is not defined in environment variables");

if (!process.env.JWT_EXPIRES_IN)
  throw new Error("JWT_EXPIRES_IN is not defined in environment variables");

const PORT = process.env.PORT || 4000;

await ensureDatabaseSchema();

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
