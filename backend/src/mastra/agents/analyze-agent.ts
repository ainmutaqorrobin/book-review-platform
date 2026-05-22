import { Agent } from "@mastra/core/agent";
import { logger } from "../../services/logger";

export const analyzeAgents = new Agent({
  name: "analyze-agent",
  model: "openai/gpt-5.2-codex",
  instructions: "You are now an expert analyzer",
});

type ReviewEnrichmentResult = {
  summary: string;
  sentimentScore: number;
  tags: string[];
};

function stripMarkdownCodeFence(value: string) {
  if (!value.startsWith("```")) {
    return value;
  }

  return value.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
}

export async function enrichReviewText(text: string) {
  try {
    const prompt = `Review Text:\n${text}\n\nAnswer with ONLY a JSON object (no markdown, no code blocks) containing:
- summary: a short 2-3 sentence summary of the review
- sentimentScore: a number between 0.0 and 1.0
- tags: an array of 1-5 concise keyword strings

JSON Response:`;

    const response = await analyzeAgents.generate(prompt);
    const parsed = JSON.parse(
      stripMarkdownCodeFence(response.text.trim()),
    ) as Partial<ReviewEnrichmentResult>;

    if (
      typeof parsed.summary !== "string" ||
      parsed.summary.trim().length === 0
    ) {
      throw new Error("AI enrichment returned an invalid summary");
    }

    if (typeof parsed.sentimentScore !== "number") {
      throw new Error("AI enrichment returned an invalid sentiment score");
    }

    if (!Array.isArray(parsed.tags)) {
      throw new Error("AI enrichment returned invalid tags");
    }

    return {
      summary: parsed.summary.trim(),
      sentimentScore: Math.min(1, Math.max(0, parsed.sentimentScore)),
      tags: parsed.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5),
    };
  } catch (error) {
    logger.error({ err: error }, "Failed to enrich review text");
    throw error;
  }
}
