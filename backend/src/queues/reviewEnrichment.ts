import { Queue } from "bullmq";
import Redis from "ioredis";
import { getRedisUrl } from "../config/env";

export type ReviewEnrichmentJobData = {
  reviewId: number;
};

export const REVIEW_ENRICHMENT_QUEUE_NAME = "review-enrichment";

let reviewEnrichmentQueue: Queue<ReviewEnrichmentJobData> | null = null;

function createProducerRedisConnection(connectionName = "book-review-api") {
  const connection = new Redis(getRedisUrl(), {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 5000,
    connectionName,
    retryStrategy: () => null,
  });

  connection.on("error", () => {
    // Callers surface queue failures in their own context.
  });

  return connection;
}

export function createWorkerRedisConnection() {
  return new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    connectionName: "book-review-worker",
  });
}

export function createReviewEnrichmentQueue(
  connectionName = "book-review-api",
) {
  return new Queue<ReviewEnrichmentJobData>(REVIEW_ENRICHMENT_QUEUE_NAME, {
    connection: createProducerRedisConnection(connectionName),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 30_000,
      },
    },
  });
}

export function getReviewEnrichmentQueue() {
  if (!reviewEnrichmentQueue) {
    reviewEnrichmentQueue = createReviewEnrichmentQueue();
  }

  return reviewEnrichmentQueue;
}

export async function closeReviewEnrichmentQueue() {
  if (!reviewEnrichmentQueue) {
    return;
  }

  const queue = reviewEnrichmentQueue;
  reviewEnrichmentQueue = null;
  await queue.close();
}

export async function disconnectReviewEnrichmentQueue() {
  if (!reviewEnrichmentQueue) {
    return;
  }

  const queue = reviewEnrichmentQueue;
  reviewEnrichmentQueue = null;
  await queue.disconnect();
}

export function getReviewEnrichmentJobId(reviewId: number) {
  return `review-enrichment-${reviewId}`;
}

export async function enqueueReviewEnrichment(reviewId: number) {
  const queue = getReviewEnrichmentQueue();

  await queue.waitUntilReady();
  await queue.add(
    "enrich-review",
    { reviewId },
    {
      jobId: getReviewEnrichmentJobId(reviewId),
    },
  );
}
