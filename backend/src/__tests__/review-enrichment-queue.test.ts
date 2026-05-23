import { describe, expect, it } from "vitest";
import { getReviewEnrichmentJobId } from "../queues/reviewEnrichment";

describe("review enrichment queue", () => {
  it("uses a BullMQ-safe custom job id", () => {
    const jobId = getReviewEnrichmentJobId(23);

    expect(jobId).toBe("review-enrichment-23");
    expect(jobId).not.toContain(":");
    expect(jobId).not.toMatch(/^\d+$/);
  });
});
