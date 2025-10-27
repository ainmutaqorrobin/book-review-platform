import { Request, Response, Router } from "express";
import { param } from "express-validator";
import { handleValidation } from "../middlewares/validateRequest";

const router = Router();

const books = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin" },
  { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt" },
];

router.get("/", (req, res) => {
  res.json(books);
});

router.get(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Book ID must be a positive integer"),
  ],
  handleValidation,
  (req: Request, res: Response) => {
    const bookId = Number(req.params.id);
    const book = books.find((b) => b.id === bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json(book);
  }
);

export { router as BookRouter };
