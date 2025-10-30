"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import BooksList from "@/components/common/book-list";
import BookSkeleton from "@/components/common/book-skeleton";
import { useBooks } from "@/hooks/useBooks";
import { useState } from "react";
import DebouncedSearchInput from "../common/debounced-input";

export default function BooksListPage() {
  const { books, loading, error, search, refresh } = useBooks();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) {
      await refresh();
      return;
    }
    try {
      await search(query);
    } catch {
      console.error(error);
    }
  };

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

          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? (
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

      {loading ? (
        <BookSkeleton />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : books.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <BooksList books={books} onBookDeleted={refresh} />
      )}
    </main>
  );
}
