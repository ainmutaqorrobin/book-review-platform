"use client";

import { useState, useCallback, useEffect } from "react";
import { getBooks, searchBooks } from "@/utils/api/books";
import { toast } from "sonner";

interface UseBooksOptions {
  autoFetch?: boolean;
  showToast?: boolean;
}

export function useBooks({
  autoFetch = true,
  showToast = true,
}: UseBooksOptions = {}) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBooks();

      if (res.success) {
        setBooks(res.data ?? []);
      } else {
        const msg = res.message || "Failed to load books.";
        setBooks([]);
        setError(msg);
        if (showToast) toast.error(msg);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      const msg = "Failed to fetch books. Please try again later.";
      setBooks([]);
      setError(msg);
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) return fetchBooks();

      try {
        setSearching(true);
        const res = await searchBooks(query);
        setBooks(res.data.books ?? []);
      } catch (err) {
        console.error("Error searching books:", err);
        setError("Failed to search books.");
        if (showToast) toast.error("Failed to search books.");
      } finally {
        setSearching(false);
      }
    },
    [fetchBooks, showToast]
  );

  const refresh = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (autoFetch) fetchBooks();
  }, [autoFetch, fetchBooks]);

  return {
    books,
    loading: loading || searching,
    error,
    fetchBooks,
    search,
    refresh,
  };
}
