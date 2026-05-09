"use client";

import { useState, useCallback, useEffect } from "react";
import { PaginationMeta } from "@/lib/fetcher";
import { getBooks } from "@/utils/api/books";
import { toast } from "sonner";

interface UseBooksOptions {
  page?: number;
  limit?: number;
  query?: string;
  autoFetch?: boolean;
  showToast?: boolean;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 9,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useBooks({
  page = 1,
  limit = 9,
  query = "",
  autoFetch = true,
  showToast = true,
}: UseBooksOptions = {}) {
  const [books, setBooks] = useState<any[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBooks({
        page,
        limit,
        query: query.trim() || undefined,
      });

      if (res.success && res.data) {
        setBooks(res.data.items ?? []);
        setPagination(res.data.pagination ?? DEFAULT_PAGINATION);
      } else {
        const msg = res.message || "Failed to load books.";
        setBooks([]);
        setPagination({
          ...DEFAULT_PAGINATION,
          page,
          limit,
        });
        setError(msg);
        if (showToast) toast.error(msg);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      const msg = "Failed to fetch books. Please try again later.";
      setBooks([]);
      setPagination({
        ...DEFAULT_PAGINATION,
        page,
        limit,
      });
      setError(msg);
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [limit, page, query, showToast]);

  const refresh = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (autoFetch) fetchBooks();
  }, [autoFetch, fetchBooks]);

  return {
    books,
    pagination,
    loading,
    error,
    fetchBooks,
    refresh,
  };
}
