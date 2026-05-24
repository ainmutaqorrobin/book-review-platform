import pool from "../config/db";
import {
  Review,
  ReviewEnrichmentStatus,
  REVIEW_ENRICHMENT_STATUSES,
} from "./type";
import {
  createPaginationMeta,
  getPaginationOffset,
  PaginatedData,
} from "../utils/pagination";

interface GetReviewsByBookIdOptions {
  page: number;
  limit: number;
}

const PUBLIC_REVIEW_COLUMNS = `
  id,
  book_id,
  reviewer_name,
  text,
  rating,
  summary,
  sentiment_score,
  tags,
  created_at,
  ai_enrichment_status,
  ai_enrichment_started_at,
  ai_enrichment_completed_at
`;

const INTERNAL_REVIEW_COLUMNS = `
  ${PUBLIC_REVIEW_COLUMNS},
  ai_enrichment_error
`;

function getSerializedTagsValue(tags: Review["tags"]) {
  return tags == null ? null : JSON.stringify(tags);
}

export const getReviewsByBookId = async (
  bookId: number,
  { page, limit }: GetReviewsByBookIdOptions,
): Promise<PaginatedData<Record<string, unknown>>> => {
  const countResult = await pool.query(
    "SELECT COUNT(*)::int AS total FROM reviews WHERE book_id = $1",
    [bookId],
  );
  const totalItems = countResult.rows[0]?.total ?? 0;
  const pagination = createPaginationMeta(page, limit, totalItems);
  const result = await pool.query(
    `SELECT ${PUBLIC_REVIEW_COLUMNS}
     FROM reviews
     WHERE book_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT $2 OFFSET $3`,
    [bookId, pagination.limit, getPaginationOffset(pagination)],
  );

  return {
    items: result.rows,
    pagination,
  };
};

export const createReview = async (data: Review) => {
  const result = await pool.query(
    `INSERT INTO reviews (
      book_id,
      reviewer_name,
      text,
      rating,
      summary,
      sentiment_score,
      tags,
      ai_enrichment_status
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${PUBLIC_REVIEW_COLUMNS}`,
    [
      data.book_id,
      data.reviewer_name,
      data.text,
      data.rating,
      data.summary ?? null,
      data.sentiment_score ?? null,
      getSerializedTagsValue(data.tags),
      data.ai_enrichment_status ?? "pending",
    ],
  );
  return result.rows[0];
};

export const getReviewByIdForEnrichment = async (reviewId: number) => {
  const result = await pool.query(
    `SELECT ${INTERNAL_REVIEW_COLUMNS}
     FROM reviews
     WHERE id = $1`,
    [reviewId],
  );

  return result.rows[0];
};

export const markReviewEnrichmentProcessing = async (reviewId: number) => {
  const result = await pool.query(
    `UPDATE reviews
     SET
       ai_enrichment_status = 'processing',
       ai_enrichment_error = NULL,
       ai_enrichment_started_at = COALESCE(ai_enrichment_started_at, CURRENT_TIMESTAMP)
     WHERE id = $1
     RETURNING ${PUBLIC_REVIEW_COLUMNS}`,
    [reviewId],
  );

  return result.rows[0];
};

export const completeReviewEnrichment = async (
  reviewId: number,
  data: Pick<Review, "summary" | "sentiment_score" | "tags">,
) => {
  const result = await pool.query(
    `UPDATE reviews
     SET
       summary = $2,
       sentiment_score = $3,
       tags = $4,
       ai_enrichment_status = 'completed',
       ai_enrichment_error = NULL,
       ai_enrichment_completed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING ${PUBLIC_REVIEW_COLUMNS}`,
    [
      reviewId,
      data.summary ?? null,
      data.sentiment_score ?? null,
      getSerializedTagsValue(data.tags),
    ],
  );

  return result.rows[0];
};

export const failReviewEnrichment = async (
  reviewId: number,
  errorMessage: string,
  status: ReviewEnrichmentStatus = "failed",
) => {
  if (!REVIEW_ENRICHMENT_STATUSES.includes(status)) {
    throw new Error(`Invalid review enrichment status: ${status}`);
  }

  const result = await pool.query(
    `UPDATE reviews
     SET
       ai_enrichment_status = $2,
       ai_enrichment_error = $3,
       ai_enrichment_completed_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING ${PUBLIC_REVIEW_COLUMNS}`,
    [reviewId, status, errorMessage],
  );

  return result.rows[0];
};
