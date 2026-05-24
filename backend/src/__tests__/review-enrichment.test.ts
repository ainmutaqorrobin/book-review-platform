import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "3600000";
process.env.NODE_ENV = "test";
process.env.REDIS_URL = "redis://127.0.0.1:6379";

const { enrichReviewText, mockPool, mockQuery } = vi.hoisted(() => {
  const mockQuery = vi.fn<(...args: any[]) => Promise<any>>();
  const enrichReviewText = vi.fn<(text: string) => Promise<any>>();

  return {
    mockQuery,
    mockPool: {
      query: mockQuery,
      on: vi.fn(),
    },
    enrichReviewText,
  };
});

vi.mock("../config/db", () => ({
  default: mockPool,
}));

vi.mock("../mastra/agents/analyze-agent", () => ({
  analyzeAgents: {},
  enrichReviewText,
}));

vi.mock("../queues/reviewEnrichment", () => ({
  enqueueReviewEnrichment: vi.fn(),
}));

import {
  handleReviewEnrichmentJobFailure,
  processReviewEnrichmentJob,
} from "../services/review-enrichment";

beforeEach(() => {
  mockQuery.mockReset();
  enrichReviewText.mockReset();
  enrichReviewText.mockResolvedValue({
    sentimentScore: 0.91,
    summary: "Helpful review",
    tags: ["helpful"],
  });
});

describe("review enrichment worker logic", () => {
  it("marks a review as processing and then completed", async () => {
    process.env.AI_ENRICHMENT_SIMULATED_DELAY_MS = "0";
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            text: "Great book",
            ai_enrichment_status: "pending",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 10 }],
      })
      .mockResolvedValueOnce({
        rows: [{ id: 10 }],
      });

    await processReviewEnrichmentJob(10);

    expect(enrichReviewText).toHaveBeenCalledWith("Great book");
    expect(mockQuery.mock.calls[1]?.[0]).toMatch(
      /ai_enrichment_status = 'processing'/,
    );
    expect(mockQuery.mock.calls[2]?.[0]).toMatch(
      /ai_enrichment_status = 'completed'/,
    );
    expect(mockQuery.mock.calls[2]?.[1]).toEqual([
      10,
      "Helpful review",
      0.91,
      JSON.stringify(["helpful"]),
    ]);
  });

  it("skips enrichment for reviews already completed", async () => {
    process.env.AI_ENRICHMENT_SIMULATED_DELAY_MS = "0";
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          text: "Great book",
          ai_enrichment_status: "completed",
        },
      ],
    });

    await processReviewEnrichmentJob(10);

    expect(enrichReviewText).not.toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("does not mark a review as failed before the final retry", async () => {
    await handleReviewEnrichmentJobFailure(
      {
        data: { reviewId: 10 },
        attemptsMade: 2,
        opts: { attempts: 3 },
      },
      new Error("temporary issue"),
    );

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("marks a review as failed after the final retry", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 10 }],
    });

    await handleReviewEnrichmentJobFailure(
      {
        data: { reviewId: 10 },
        attemptsMade: 3,
        opts: { attempts: 3 },
      },
      new Error("x".repeat(600)),
    );

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0]?.[0]).toMatch(/ai_enrichment_status = \$2/);
    expect(mockQuery.mock.calls[0]?.[1]).toEqual([
      10,
      "failed",
      "x".repeat(500),
    ]);
  });
});
