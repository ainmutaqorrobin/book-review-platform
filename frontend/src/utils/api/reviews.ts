import { fetcher } from "@/lib/fetcher";
import { Review } from "./books";

// Create review
export async function createReview(review: Partial<Review>, bookId: string) {
  return fetcher<Review>(`/reviews/${bookId}`, {
    method: "POST",
    data: review,
  });
}
