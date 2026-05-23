import pool from "../config/db";
import {
  completeReviewEnrichment,
  createReview,
  failReviewEnrichment,
  getReviewByIdForEnrichment,
  markReviewEnrichmentProcessing,
} from "../models/review";
import { ReviewEnrichmentStatus } from "../models/type";
import { enqueueReviewEnrichment } from "../queues/reviewEnrichment";
import { NotFoundError } from "../utils/notfoundError";
import { enrichReviewText } from "../mastra/agents/analyze-agent";
import { logger } from "./logger";
import { getAiEnrichmentSimulatedDelayMs } from "../config/env";

const REVIEW_ENRICHMENT_ERROR_MAX_LENGTH = 500;

export type SubmitReviewInput = {
  bookId: number;
  reviewer_name: string;
  text: string;
  rating: number;
};

type ReviewEnrichmentFailureJob = {
  data: {
    reviewId: number;
  };
  attemptsMade: number;
  opts: {
    attempts?: number;
  };
};

function getTruncatedErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown AI enrichment error";

  return message.slice(0, REVIEW_ENRICHMENT_ERROR_MAX_LENGTH);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForSimulatedEnrichmentDelay(reviewId: number) {
  const delayMs = getAiEnrichmentSimulatedDelayMs();

  if (delayMs <= 0) {
    return;
  }

  logger.info(
    {
      reviewId,
      delayMs,
    },
    "Simulating slow review enrichment",
  );

  await wait(delayMs);
}

async function assertBookExists(bookId: number) {
  const book = await pool.query("SELECT id FROM books WHERE id = $1", [bookId]);

  if (book.rowCount === 0) {
    throw new NotFoundError(`Book with ID ${bookId} not found`);
  }
}

export async function submitReviewForEnrichment(input: SubmitReviewInput) {
  await assertBookExists(input.bookId);

  const createdReview = await createReview({
    book_id: input.bookId,
    reviewer_name: input.reviewer_name,
    text: input.text,
    rating: input.rating,
    summary: null,
    sentiment_score: null,
    tags: null,
    ai_enrichment_status: "pending",
  });

  try {
    await enqueueReviewEnrichment(createdReview.id);
    return createdReview;
  } catch (error) {
    logger.error(
      {
        err: error,
        reviewId: createdReview.id,
      },
      "Failed to enqueue review enrichment job",
    );

    return (
      (await failReviewEnrichment(
        createdReview.id,
        getTruncatedErrorMessage(error),
      )) ?? {
        ...createdReview,
        ai_enrichment_status: "failed" satisfies ReviewEnrichmentStatus,
      }
    );
  }
}

export async function processReviewEnrichmentJob(reviewId: number) {
  const review = await getReviewByIdForEnrichment(reviewId);

  if (!review) {
    logger.warn({ reviewId }, "Skipping AI enrichment for missing review");
    return;
  }

  if (review.ai_enrichment_status === "completed") {
    return;
  }

  await markReviewEnrichmentProcessing(reviewId);
  await waitForSimulatedEnrichmentDelay(reviewId);

  const enrichment = await enrichReviewText(review.text);

  await completeReviewEnrichment(reviewId, {
    summary: enrichment.summary,
    sentiment_score: enrichment.sentimentScore,
    tags: enrichment.tags,
  });
}

export async function handleReviewEnrichmentJobFailure(
  job: ReviewEnrichmentFailureJob,
  error: unknown,
) {
  const totalAttempts = job.opts.attempts ?? 1;

  if (job.attemptsMade < totalAttempts) {
    return;
  }

  await failReviewEnrichment(
    job.data.reviewId,
    getTruncatedErrorMessage(error),
  );
}
