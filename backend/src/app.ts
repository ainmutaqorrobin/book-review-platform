import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { json } from "body-parser";
import { BookRouter } from "./routes/book";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/appError";
import pool from "./config/db";
import { ReviewRouter } from "./routes/review";
import { SearchRouter } from "./routes/search";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({ message: "📚 Book Review API is running!!" });
});

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
