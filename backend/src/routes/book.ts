import { Router } from "express";

const router = Router();

const books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin" },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt" },
];

router.get("/", (req, res) => {
  res.json(books);
});

router.get("/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ message: "Book not found" });

  res.json(book);
});

export { router as BookRouter };
