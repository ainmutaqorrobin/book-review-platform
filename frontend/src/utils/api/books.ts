import { ApiResponse, fetcher } from "@/lib/fetcher";

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
  created_at?: string;
}

export interface Review {
  id: number;
  book_id: number;
  reviewer_name: string;
  text: string;
  rating: number;
  created_at: string;
  book_title: string;
}

// For getBooks (list of books only)
export type BooksListResponse = ApiResponse<Book[]>;

// For search (books + reviews)
export interface SearchData {
  books: Book[];
  reviews: Review[];
}

export type SearchResponse = ApiResponse<SearchData>;

// Get all books
export async function getBooks(): Promise<BooksListResponse> {
  return fetcher<Book[]>("/books");
}

// Get one book
export async function getBookById(id: number) {
  return fetcher<Book>(`/books/${id}`);
}

// Create book
export async function createBook(book: Omit<Book, "id">) {
  return fetcher<Book>("/books", {
    method: "POST",
    data: book,
  });
}

// Update book
export async function updateBook(id: number, book: Partial<Book>) {
  return fetcher<Book>(`/books/${id}`, {
    method: "PUT",
    data: book,
  });
}

// Delete book
export async function deleteBook(id: number) {
  return fetcher<null>(`/books/${id}`, { method: "DELETE" });
}

// Search book
export async function searchBooks(query: string): Promise<SearchResponse> {
  return fetcher<SearchData>("/search", {
    params: { query },
  });
}
