"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  deleteBook,
  getBookById,
  BookDetail as Model,
  Review as ReviewModel,
} from "@/utils/api/books";
import { PaginationMeta } from "@/lib/fetcher";
import { FALLBACK_IMAGE } from "@/utils/const/image";
import { formatDate } from "@/lib/format";
import { shouldBypassImageOptimization } from "@/lib/image";
import ConfirmationDialog from "./confirmation-dialog";
import BackButton from "./back-button";
import Review from "./review";
import { useAuth } from "../providers/auth-provider";
import { getReviews } from "@/utils/api/reviews";

interface BookDetailProps {
  bookId: number;
}

const REVIEWS_PER_PAGE = 5;
const REVIEW_ENRICHMENT_POLL_INTERVAL_MS = 5_000;
const REVIEW_ENRICHMENT_POLL_TIMEOUT_MS = 60_000;
const DEFAULT_REVIEW_PAGINATION: PaginationMeta = {
  page: 1,
  limit: REVIEWS_PER_PAGE,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function BookDetail({ bookId }: BookDetailProps) {
  const router = useRouter();
  const { isLoading: authLoading, role, user } = useAuth();
  const [book, setBook] = useState<Model | null>(null);
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [reviewPagination, setReviewPagination] = useState<PaginationMeta>(
    DEFAULT_REVIEW_PAGINATION,
  );
  const [error, setError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const applyReviewPage = useCallback(
    (
      items: ReviewModel[],
      pagination: PaginationMeta,
      preserveLoadedPages = false,
    ) => {
      startTransition(() => {
        setReviews((currentReviews) => {
          if (!preserveLoadedPages) {
            return items;
          }

          return [...items, ...currentReviews.slice(REVIEWS_PER_PAGE)];
        });

        setReviewPagination((currentPagination) => {
          if (!preserveLoadedPages) {
            return pagination;
          }

          const activePage = Math.min(
            currentPagination.page,
            pagination.totalPages || 1,
          );

          return {
            ...pagination,
            page: activePage,
            hasPreviousPage: activePage > 1,
            hasNextPage: activePage < pagination.totalPages,
          };
        });
      });
    },
    [],
  );

  const refreshFirstReviewPage = useCallback(async () => {
    const response = await getReviews(bookId, {
      page: 1,
      limit: REVIEWS_PER_PAGE,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to refresh reviews.");
    }

    applyReviewPage(
      response.data.items ?? [],
      response.data.pagination ?? DEFAULT_REVIEW_PAGINATION,
      true,
    );
    setReviewsError(null);

    return response.data.items ?? [];
  }, [applyReviewPage, bookId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookResponse, reviewsResponse] = await Promise.all([
        getBookById(bookId),
        getReviews(bookId, { page: 1, limit: REVIEWS_PER_PAGE }),
      ]);

      if (bookResponse.success && bookResponse.data) {
        setBook(bookResponse.data);
        setError(null);
      } else {
        setError(bookResponse.message || "Book not found.");
      }

      if (reviewsResponse.success && reviewsResponse.data) {
        applyReviewPage(
          reviewsResponse.data.items ?? [],
          reviewsResponse.data.pagination ?? DEFAULT_REVIEW_PAGINATION,
        );
        setReviewsError(null);
      } else {
        setReviews([]);
        setReviewPagination(DEFAULT_REVIEW_PAGINATION);
        setReviewsError(reviewsResponse.message || "Failed to load reviews.");
      }
    } catch {
      setError("An error occurred while fetching the book.");
    } finally {
      setLoading(false);
    }
  }, [applyReviewPage, bookId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refreshIfNeeded = () => {
      if (typeof window === "undefined") {
        return;
      }

      const shouldRefresh = window.sessionStorage.getItem(
        "refresh-book-detail",
      );

      if (shouldRefresh !== String(bookId)) {
        return;
      }

      window.sessionStorage.removeItem("refresh-book-detail");
      void fetchData();
    };

    refreshIfNeeded();
    window.addEventListener("focus", refreshIfNeeded);
    window.addEventListener("pageshow", refreshIfNeeded);

    return () => {
      window.removeEventListener("focus", refreshIfNeeded);
      window.removeEventListener("pageshow", refreshIfNeeded);
    };
  }, [bookId, fetchData]);

  useEffect(() => {
    const shouldPoll =
      !loading &&
      !reviewsError &&
      reviews
        .slice(0, REVIEWS_PER_PAGE)
        .some(
          (review) =>
            review.ai_enrichment_status === "pending" ||
            review.ai_enrichment_status === "processing",
        );

    if (!shouldPoll) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const deadline = Date.now() + REVIEW_ENRICHMENT_POLL_TIMEOUT_MS;

    const poll = async () => {
      if (cancelled || Date.now() >= deadline) {
        return;
      }

      try {
        const firstPageReviews = await refreshFirstReviewPage();
        const hasPendingReview = firstPageReviews.some(
          (review) =>
            review.ai_enrichment_status === "pending" ||
            review.ai_enrichment_status === "processing",
        );

        if (!cancelled && hasPendingReview && Date.now() < deadline) {
          timeoutId = setTimeout(() => {
            void poll();
          }, REVIEW_ENRICHMENT_POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled && Date.now() < deadline) {
          timeoutId = setTimeout(() => {
            void poll();
          }, REVIEW_ENRICHMENT_POLL_INTERVAL_MS);
        }
      }
    };

    timeoutId = setTimeout(() => {
      void poll();
    }, REVIEW_ENRICHMENT_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, refreshFirstReviewPage, reviews, reviewsError]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Skeleton className="h-16 rounded-[1.75rem]" />
        <Skeleton className="h-[420px] rounded-[2rem]" />
        <Skeleton className="h-52 rounded-[1.75rem]" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto w-full max-w-5xl rounded-[1.75rem] border border-red-300/70 bg-red-50 px-5 py-6 text-red-700">
        {error || "Book not found."}
      </div>
    );
  }

  const {
    id,
    title,
    author,
    description,
    cover_image_url,
    owner_user_id,
    created_at,
  } = book;
  const shouldBypassOptimization =
    shouldBypassImageOptimization(cover_image_url);
  const canManageBook =
    !authLoading &&
    (role === "admin" || (role === "user" && user?.id === owner_user_id));

  const handleDelete = async () => {
    const response = await deleteBook(id);

    if (!response.success) {
      toast.error(response.message || "Failed to delete book.");
      return;
    }

    toast.success("Book deleted successfully.");
    router.push("/books");
    router.refresh();
  };

  const handleLoadMoreReviews = async () => {
    if (!reviewPagination.hasNextPage) {
      return;
    }

    try {
      setLoadingMoreReviews(true);
      const response = await getReviews(bookId, {
        page: reviewPagination.page + 1,
        limit: reviewPagination.limit,
      });

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to load more reviews.");
        return;
      }

      setReviews((currentReviews) => [
        ...currentReviews,
        ...(response.data.items ?? []),
      ]);
      setReviewPagination(response.data.pagination ?? reviewPagination);
      setReviewsError(null);
    } catch {
      toast.error("Failed to load more reviews.");
    } finally {
      setLoadingMoreReviews(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-stone-900/10 bg-white/60 p-5 shadow-[0_18px_40px_rgba(64,38,24,0.08)] lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Book Detail
          </p>
          <h1 className="font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-900 sm:text-5xl">
            {title}
          </h1>
          <p className="text-sm uppercase tracking-[0.14em] text-stone-600">
            by {author}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {canManageBook && (
            <>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-stone-300 bg-[#fffaf2] px-5 text-stone-700 hover:border-stone-500 hover:bg-white"
              >
                <Link href={`/books/${id}/edit`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </Button>
              <ConfirmationDialog
                title={`Delete "${title}"?`}
                description="This action cannot be undone."
                actionText="Confirm Delete"
                onConfirm={handleDelete}
              >
                <Button
                  variant="destructive"
                  className="h-10 rounded-full px-5"
                >
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </ConfirmationDialog>
            </>
          )}
          <BackButton fallbackHref="/books" />
        </div>
      </div>

      <div className="grid gap-6 lg:items-start lg:grid-cols-[0.85fr_1.15fr]">
        <article className="overflow-hidden rounded-[2rem] border border-stone-900/10 bg-[#201814] text-stone-100 shadow-[0_24px_70px_rgba(42,26,18,0.24)] lg:sticky lg:top-24">
          <div className="relative h-[420px]">
            <Image
              src={cover_image_url || FALLBACK_IMAGE}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              unoptimized={shouldBypassOptimization}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#201814] via-[#201814]/10 to-transparent" />
          </div>
          <div className="space-y-4 p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">
              Added {formatDate(created_at || "")}
            </p>
            <p className="text-sm leading-7 text-stone-300">
              {description ||
                "No description has been added for this book yet."}
            </p>
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-stone-900/10 bg-white/65 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Editorial Note
            </p>
            <h2 className="mt-4 font-[family-name:Georgia,serif] text-3xl text-stone-900">
              Why this title belongs on the shelf.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Use this page to read the book’s description, revisit its review
              history, and add your own perspective when it deserves one.
            </p>
          </article>

          <div className="rounded-[2rem] border border-stone-900/10 bg-[#fffaf2]/88 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  Reader Responses
                </p>
                <h2 className="mt-2 font-[family-name:Georgia,serif] text-3xl text-stone-900">
                  Reviews
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Showing {reviews.length} of {reviewPagination.totalItems}{" "}
                  reviews
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-stone-300 bg-white px-5 text-stone-700 hover:border-stone-500 hover:bg-stone-50"
              >
                <Link href={`/books/${id}/review`}>Add Review</Link>
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {reviewsError ? (
                <div className="rounded-[1.5rem] border border-red-300/70 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {reviewsError}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-[1.5rem] border border-stone-900/8 bg-white/60 px-5 py-8 text-center text-stone-600">
                  <p className="font-[family-name:Georgia,serif] text-2xl text-stone-900">
                    No reviews yet.
                  </p>
                  <p className="mt-2 text-sm leading-7">
                    Be the first reader to add context to this title.
                  </p>
                </div>
              ) : (
                reviews.map((review: ReviewModel) => (
                  <Review key={review.id} review={review} />
                ))
              )}
            </div>

            {reviewPagination.hasNextPage && !reviewsError && (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full border-stone-300 bg-white px-5 text-stone-700 hover:border-stone-500 hover:bg-stone-50"
                  disabled={loadingMoreReviews}
                  onClick={handleLoadMoreReviews}
                >
                  {loadingMoreReviews ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="mr-2 h-4 w-4 animate-spin"
                      />
                      Loading More...
                    </>
                  ) : (
                    "Load More Reviews"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
