"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";
import BooksList from "@/components/common/book-list";
import BookSkeleton from "@/components/common/book-skeleton";
import DebouncedSearchInput from "@/components/common/debounced-input";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/hooks/useBooks";

export default function BooksListPage() {
  const { books, loading, error, search, refresh } = useBooks({
    autoFetch: false,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const currentQuery = searchParams.get("q") ?? "";

  const updateQueryString = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchTerm(currentQuery);

    if (currentQuery.trim()) {
      void search(currentQuery);
      return;
    }

    void refresh();
  }, [currentQuery, refresh, search]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    updateQueryString(query);
  };

  const handleRefresh = async () => {
    if (currentQuery.trim()) {
      await search(currentQuery);
      return;
    }

    await refresh();
  };

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
            {books.length}
          </p>
          <p>{currentQuery ? "Matching titles and authors" : "Books in view"}</p>
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
        <BooksList books={books} onBookDeleted={handleRefresh} />
      )}
    </section>
  );
}
