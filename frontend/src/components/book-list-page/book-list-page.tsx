"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";
import BooksList from "@/components/common/book-list";
import BookSkeleton from "@/components/common/book-skeleton";
import DebouncedSearchInput from "@/components/common/debounced-input";
import PaginationControls from "@/components/common/pagination-controls";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/hooks/useBooks";

const BOOKS_PER_PAGE = 9;
const BOOK_SCOPE_OPTIONS = [
  { value: "all", label: "All books" },
  { value: "mine", label: "Your books" },
] as const;
const YOUR_BOOKS_NEXT_PATH = "/books?scope=mine";

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function parseScopeParam(value: string | null): "all" | "mine" {
  return value === "mine" ? "mine" : "all";
}

export default function BooksListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const currentQuery = searchParams.get("q") ?? "";
  const currentPage = parsePageParam(searchParams.get("page"));
  const currentScope = parseScopeParam(searchParams.get("scope"));
  const isResolvingMineAccess = currentScope === "mine" && authLoading;
  const shouldShowMineSignInPrompt =
    currentScope === "mine" && !authLoading && !isAuthenticated;
  const shouldPauseMineView =
    isResolvingMineAccess || shouldShowMineSignInPrompt;

  const { books, pagination, loading, error, refresh } = useBooks({
    autoFetch: !shouldPauseMineView,
    page: currentPage,
    limit: BOOKS_PER_PAGE,
    query: currentQuery,
    scope: currentScope,
    showToast: !shouldPauseMineView,
  });

  const updateQueryString = useCallback(
    (nextQuery: string, nextPage: number, nextScope: "all" | "mine") => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      } else {
        params.delete("q");
      }

      if (nextScope === "mine") {
        params.set("scope", "mine");
      } else {
        params.delete("scope");
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
    [pathname, router, searchParams],
  );

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    updateQueryString(query, 1, currentScope);
  };

  const handleScopeChange = (scope: "all" | "mine") => {
    updateQueryString(currentQuery, 1, scope);
  };

  const handlePageChange = (page: number) => {
    updateQueryString(currentQuery, page, currentScope);
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
              {currentScope === "mine"
                ? "Keep your own shelf tidy, visible, and easy to revisit."
                : "Browse the shelf like an editor, not a spreadsheet."}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              {currentScope === "mine"
                ? "Review only the books you added, refine entries, and return to your own collection without digging through the full catalog."
                : "Search titles and authors, revisit your collection, and keep discovery feeling deliberate instead of overloaded."}
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
          <p>
            {currentScope === "mine"
              ? currentQuery
                ? "Matching books from your shelf"
                : "Books you added"
              : currentQuery
                ? "Matching titles and authors"
                : "Books in catalog"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-900/10 bg-white/60 p-4 shadow-[0_18px_40px_rgba(64,38,24,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-1">
          <div className="inline-flex w-fit items-center rounded-full border border-stone-900/10 bg-[#f3e7d8] p-1">
            {BOOK_SCOPE_OPTIONS.map((option) => {
              const isActive = currentScope === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleScopeChange(option.value)}
                  aria-pressed={isActive}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow] ${
                    isActive
                      ? "bg-stone-900 text-stone-50 shadow-[0_10px_24px_rgba(42,26,18,0.18)]"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <DebouncedSearchInput value={searchTerm} onChange={handleSearch} />
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading || shouldPauseMineView}
          className="h-11 rounded-full border-stone-300 bg-[#fffaf2] px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
        >
          {loading ? (
            <>
              <Loader2
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin"
              />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCcw aria-hidden="true" className="mr-2 h-4 w-4" />
              Refresh Shelf
            </>
          )}
        </Button>
      </div>

      {isResolvingMineAccess ? (
        <BookSkeleton />
      ) : shouldShowMineSignInPrompt ? (
        <div className="rounded-[1.75rem] border border-stone-900/8 bg-white/65 px-6 py-10 text-center shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
          <p className="font-[family-name:Georgia,serif] text-3xl text-stone-900">
            Sign in to open your shelf.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            This shelf only appears for the account that created those books.
            Sign in to review your entries, edit details, and manage your own
            catalog.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-11 rounded-full bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
            >
              <Link
                href={`/login?next=${encodeURIComponent(YOUR_BOOKS_NEXT_PATH)}`}
              >
                Log In
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-stone-300 bg-[#fffaf2] px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
            >
              <Link
                href={`/signup?next=${encodeURIComponent(YOUR_BOOKS_NEXT_PATH)}`}
              >
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      ) : loading ? (
        <BookSkeleton />
      ) : error ? (
        <div className="rounded-[1.75rem] border border-red-300/70 bg-red-50 px-5 py-4 text-red-700">
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-[1.75rem] border border-stone-900/8 bg-white/60 px-5 py-10 text-center text-stone-600 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
          <p className="font-[family-name:Georgia,serif] text-3xl text-stone-900">
            {currentScope === "mine"
              ? "Your shelf is still empty."
              : "Nothing on this shelf yet."}
          </p>
          <p className="mt-3 text-sm leading-7">
            {currentScope === "mine"
              ? "Add your first book to start building a personal collection you can manage here."
              : "Try another search, or refresh to pull the latest collection."}
          </p>
          {currentScope === "mine" && (
            <div className="mt-6">
              <Button
                asChild
                className="h-11 rounded-full bg-stone-900 px-5 text-stone-50 hover:bg-stone-800"
              >
                <Link href="/create-book">Add a Book</Link>
              </Button>
            </div>
          )}
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
