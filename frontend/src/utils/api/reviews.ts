import { fetcher, PaginatedData } from "@/lib/fetcher";
import { Review } from "./books";

export interface ReviewsQueryParams {
  page?: number;
  limit?: number;
}

export async function getReviews(
  bookId: number | string,
  params: ReviewsQueryParams = {},
) {
  return fetcher<PaginatedData<Review>>(`/reviews/${bookId}`, {
    params: {
      ...(params.page ? { page: params.page } : {}),
      ...(params.limit ? { limit: params.limit } : {}),
    },
  });
}

// Create review
export async function createReview(review: Partial<Review>, bookId: string) {
  return fetcher<Review>(`/reviews/${bookId}`, {
    method: "POST",
    data: review,
  });
}
