import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { json } from "body-parser";
import { BookRouter } from "./routes/book";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({ message: "📚 Book Review API is running!!" });
});

app.use("/books", BookRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
