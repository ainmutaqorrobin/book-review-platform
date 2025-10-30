import { Book as BookModel } from "@/utils/api/books";
import Book from "./book";

interface IProps {
  books: BookModel[];
  onBookDeleted: () => void;
}
export default function BooksList({ books, onBookDeleted }: IProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((b) => (
        <Book key={b.id} book={b} onBookDeleteCallback={onBookDeleted} />
      ))}
    </div>
  );
}
