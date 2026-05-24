import type { JobType } from "bullmq";
import {
  REVIEW_ENRICHMENT_QUEUE_NAME,
  disconnectReviewEnrichmentQueue,
  getReviewEnrichmentQueue,
} from "../queues/reviewEnrichment";

const COUNT_STATES: JobType[] = [
  "waiting",
  "active",
  "delayed",
  "completed",
  "failed",
  "paused",
  "prioritized",
  "waiting-children",
];

const DEFAULT_DETAIL_STATES: JobType[] = [
  "waiting",
  "active",
  "delayed",
  "failed",
  "completed",
];

const ALLOWED_STATES = new Set<JobType>([...COUNT_STATES, "repeat", "wait"]);

type CliOptions = {
  asc: boolean;
  countsOnly: boolean;
  limit: number;
  states: JobType[];
};

function printUsage() {
  console.log(`Usage: npm run queue:status -- [options]

Options:
  --limit=<number>         Number of jobs to show per state (default: 5)
  --states=a,b,c           Comma-separated states to inspect
  --counts-only            Only print counts, skip job details
  --asc                    Show oldest jobs first
  --help                   Show this message
`);
}

function parsePositiveInt(rawValue: string, flag: string) {
  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }

  return parsed;
}

function parseStates(rawValue: string) {
  const requestedStates = rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean) as JobType[];

  if (requestedStates.length === 0) {
    throw new Error("--states must include at least one queue state");
  }

  const invalidState = requestedStates.find(
    (state) => !ALLOWED_STATES.has(state),
  );
  if (invalidState) {
    throw new Error(`Unsupported queue state: ${invalidState}`);
  }

  return requestedStates;
}

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = {
    asc: false,
    countsOnly: false,
    limit: 5,
    states: [...DEFAULT_DETAIL_STATES],
  };

  for (const arg of argv) {
    if (arg === "--help") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--counts-only") {
      options.countsOnly = true;
      continue;
    }

    if (arg === "--asc") {
      options.asc = true;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = parsePositiveInt(arg.slice("--limit=".length), "--limit");
      continue;
    }

    if (arg.startsWith("--states=")) {
      options.states = parseStates(arg.slice("--states=".length));
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function formatTimestamp(timestamp?: number | null) {
  if (!timestamp) {
    return "";
  }

  return new Date(timestamp).toISOString();
}

function truncate(value: string | undefined, maxLength = 80) {
  if (!value) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength - 3)}...`
    : value;
}

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const queue = getReviewEnrichmentQueue();

  await queue.waitUntilReady();

  const counts = await queue.getJobCounts(...COUNT_STATES);

  console.log(`Queue: ${REVIEW_ENRICHMENT_QUEUE_NAME}`);
  console.log("");
  console.table(
    Object.entries(counts).map(([state, count]) => ({
      state,
      count,
    })),
  );

  if (options.countsOnly) {
    return;
  }

  for (const state of options.states) {
    const jobs = await queue.getJobs(
      [state],
      0,
      options.limit - 1,
      options.asc,
    );

    if (jobs.length === 0) {
      continue;
    }

    console.log("");
    console.log(`${state} jobs`);
    console.table(
      jobs.map((job) => ({
        id: job.id ?? "",
        name: job.name,
        reviewId:
          typeof job.data === "object" &&
          job.data !== null &&
          "reviewId" in job.data
            ? String(job.data.reviewId)
            : "",
        attemptsMade: job.attemptsMade,
        queuedAt: formatTimestamp(job.timestamp),
        processedAt: formatTimestamp(job.processedOn),
        finishedAt: formatTimestamp(job.finishedOn),
        failedReason: truncate(job.failedReason),
      })),
    );
  }
}

main()
  .catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown queue status error";
    console.error(`Failed to inspect queue: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectReviewEnrichmentQueue();
  });
