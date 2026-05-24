import { Worker } from "bullmq";
import {
  assertRequiredEnvironment,
  getAiEnrichmentConcurrency,
  getEnvironmentDiagnostics,
} from "./config/env";
import { ensureDatabaseSchema } from "./config/ensureSchema";
import {
  createWorkerRedisConnection,
  REVIEW_ENRICHMENT_QUEUE_NAME,
  ReviewEnrichmentJobData,
} from "./queues/reviewEnrichment";
import {
  handleReviewEnrichmentJobFailure,
  processReviewEnrichmentJob,
} from "./services/review-enrichment";
import { logger } from "./services/logger";

const environmentDiagnostics = getEnvironmentDiagnostics();

logger.info(
  {
    summary: environmentDiagnostics.summary,
    fallback: environmentDiagnostics.fallback,
    missingOptional: environmentDiagnostics.missingOptional,
    missingFeature: environmentDiagnostics.missingFeature,
  },
  "Environment variables checked",
);

assertRequiredEnvironment(environmentDiagnostics.entries);

await ensureDatabaseSchema();

const redisConnection = createWorkerRedisConnection();

const worker = new Worker<ReviewEnrichmentJobData>(
  REVIEW_ENRICHMENT_QUEUE_NAME,
  async (job) => {
    await processReviewEnrichmentJob(job.data.reviewId);
  },
  {
    connection: redisConnection,
    concurrency: getAiEnrichmentConcurrency(),
  },
);

worker.on("completed", (job) => {
  logger.info(
    {
      reviewId: job.data.reviewId,
      jobId: job.id,
    },
    "Review enrichment job completed",
  );
});

worker.on("failed", (job, error) => {
  if (!job) {
    logger.error({ err: error }, "Review enrichment job failed before loading");
    return;
  }

  logger.warn(
    {
      err: error,
      reviewId: job.data.reviewId,
      attemptsMade: job.attemptsMade,
      attemptsConfigured: job.opts.attempts ?? 1,
    },
    "Review enrichment job failed",
  );

  void handleReviewEnrichmentJobFailure(job, error);
});

worker.on("error", (error) => {
  logger.error({ err: error }, "Review enrichment worker error");
});

await worker.waitUntilReady();

logger.info(
  {
    concurrency: getAiEnrichmentConcurrency(),
    queue: REVIEW_ENRICHMENT_QUEUE_NAME,
  },
  "Review enrichment worker started",
);

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down review enrichment worker");

  await worker.close();
  redisConnection.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
