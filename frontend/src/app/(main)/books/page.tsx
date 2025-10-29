"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import BooksList from "@/components/common/book-list";
import BookSkeleton from "@/components/common/book-skeleton";
import { getBooks, searchBooks } from "@/utils/api/books";
import DebouncedSearchInput from "@/components/common/debounced-input";

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null); // reset previous errors
      setBooks([]); // optionally clear previous list

      const res = await getBooks();

      if (res.success) {
        setBooks(res.data ?? []);
      } else {
        setBooks([]);
        setError(res.message || "Failed to load books.");
      }
    } catch (err) {
      console.error("Unexpected error fetching books:", err);
      setBooks([]);
      setError("Failed to fetch books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);

    // If input is cleared, reload all books
    if (!query.trim()) {
      fetchBooks();
      return;
    }

    try {
      setSearching(true);
      const res = await searchBooks(query);
      setBooks(res.data.books);
    } catch {
      setError("Failed to search books.");
    } finally {
      setSearching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const isLoading = loading || searching;

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">📚 Books List</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DebouncedSearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by title or author..."
          />

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <BookSkeleton />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : books.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <BooksList books={books} />
      )}
    </main>
  );
}
