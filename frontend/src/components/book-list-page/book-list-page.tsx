"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";
import BooksList from "@/components/common/book-list";
import BookSkeleton from "@/components/common/book-skeleton";
import DebouncedSearchInput from "@/components/common/debounced-input";
import PaginationControls from "@/components/common/pagination-controls";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/hooks/useBooks";

const BOOKS_PER_PAGE = 9;

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export default function BooksListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const currentQuery = searchParams.get("q") ?? "";
  const currentPage = parsePageParam(searchParams.get("page"));
  const { books, pagination, loading, error, refresh } = useBooks({
    autoFetch: true,
    page: currentPage,
    limit: BOOKS_PER_PAGE,
    query: currentQuery,
  });

  const updateQueryString = useCallback(
    (nextQuery: string, nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      } else {
        params.delete("q");
      }

      if (nextPage > 1) {
        params.set("page", String(nextPage));
      } else {
        params.delete("page");
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    updateQueryString(query, 1);
  };

  const handlePageChange = (page: number) => {
    updateQueryString(currentQuery, page);
  };

  const handleRefresh = async () => {
    await refresh();
  };

  const startItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const endItem =
    pagination.totalItems === 0 ? 0 : startItem + books.length - 1;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="grid gap-6 rounded-[2rem] border border-stone-900/10 bg-[linear-gradient(135deg,_rgba(255,250,242,0.92),_rgba(239,224,207,0.88))] p-6 shadow-[0_20px_60px_rgba(64,38,24,0.1)] lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Collection Index
          </p>
          <div className="space-y-3">
            <h1 className="font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-900 sm:text-5xl">
              Browse the shelf like an editor, not a spreadsheet.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              Search titles and authors, revisit your collection, and keep
              discovery feeling deliberate instead of overloaded.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-stone-900/8 bg-white/65 p-4 text-sm text-stone-600 sm:min-w-[280px]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
            Live Snapshot
          </p>
          <p className="font-[family-name:Georgia,serif] text-3xl text-stone-900">
            {pagination.totalItems}
          </p>
          <p>{currentQuery ? "Matching titles and authors" : "Books in catalog"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-900/10 bg-white/60 p-4 shadow-[0_18px_40px_rgba(64,38,24,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <DebouncedSearchInput value={searchTerm} onChange={handleSearch} />

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="h-11 rounded-full border-stone-300 bg-[#fffaf2] px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
        >
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
              Refreshing…
            </>
          ) : (
            <>
              <RefreshCcw aria-hidden="true" className="mr-2 h-4 w-4" />
              Refresh Shelf
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <BookSkeleton />
      ) : error ? (
        <div className="rounded-[1.75rem] border border-red-300/70 bg-red-50 px-5 py-4 text-red-700">
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-[1.75rem] border border-stone-900/8 bg-white/60 px-5 py-10 text-center text-stone-600 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
          <p className="font-[family-name:Georgia,serif] text-3xl text-stone-900">
            Nothing on this shelf yet.
          </p>
          <p className="mt-3 text-sm leading-7">
            Try another search, or refresh to pull the latest collection.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-900/8 bg-white/60 px-5 py-4 text-sm text-stone-600 shadow-[0_18px_40px_rgba(64,38,24,0.06)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {startItem}-{endItem} of {pagination.totalItems}
            </p>
            <p>
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>

          <BooksList books={books} onBookDeleted={handleRefresh} />

          <PaginationControls
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            disabled={loading}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
}
