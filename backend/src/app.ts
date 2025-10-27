import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { json } from "body-parser";
import { BookRouter } from "./routes/book";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/appError";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({ message: "📚 Book Review API is running!!" });
});

app.use("/books", BookRouter);

app.all(/.*/, async (req, res, next) => {
  throw new AppError(`Route ${req.originalUrl} not found`, 404);
});

app.use(errorHandler);

export { app };
