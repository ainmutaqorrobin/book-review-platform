"use client";

import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) pages.add(2);
  if (currentPage >= totalPages - 2) pages.add(totalPages - 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Books pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full border-stone-300 bg-white px-4 text-stone-700 hover:border-stone-500 hover:bg-stone-50"
        disabled={disabled || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      {visiblePages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-stone-500"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === currentPage ? "default" : "outline"}
            className={
              item === currentPage
                ? "h-10 min-w-10 rounded-full bg-stone-900 px-4 text-stone-50 hover:bg-stone-800"
                : "h-10 min-w-10 rounded-full border-stone-300 bg-white px-4 text-stone-700 hover:border-stone-500 hover:bg-stone-50"
            }
            disabled={disabled}
            aria-current={item === currentPage ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="outline"
        className="h-10 rounded-full border-stone-300 bg-white px-4 text-stone-700 hover:border-stone-500 hover:bg-stone-50"
        disabled={disabled || currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
