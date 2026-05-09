import express, { json } from "express";
import cors, { CorsOptions } from "cors";
import { BookRouter } from "./routes/book";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/appError";
import pool from "./config/db";
import { ReviewRouter } from "./routes/review";
import { SearchRouter } from "./routes/search";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import { Mastra } from "@mastra/core";
import { analyzeAgents } from "./mastra/agents/analyze-agent";
import { AuthRouter } from "./routes/auth";
import cookieParser from "cookie-parser";
const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://book-review.mutaqorrobin.online",
];

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ?? defaultAllowedOrigins.join(",")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(json());

app.use(globalRateLimiter);

export const mastra = new Mastra({
  agents: { analyzeAgents },
  observability: { default: { enabled: true } },
});

app.get("/", (req, res) => {
  res.json({ message: "📚 Book Review API is running!!" });
});

app.use("/auth", AuthRouter);
app.use("/books", BookRouter);
app.use("/reviews", ReviewRouter);
app.use("/search", SearchRouter);

app.get("/database", async (req, res) => {
  const result = await pool.query("SELECT NOW() as current_time");
  res.json({ db_connected: true, time: result.rows[0].current_time });
});

app.all(/.*/, async (req, res, next) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

app.use(errorHandler);

export { app };
