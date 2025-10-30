import { Agent } from "@mastra/core/agent";

export const analyzeAgents = new Agent({
  name: "analyze-agent",
  model: "openai/gpt-4-turbo",
  instructions: "You are now an expert analyzer",
});

export async function enrichReviewText(text: string) {
  try {
    // Generate summary
    const summaryPrompt = `Review Text:\n${text}\n\nProvide a short (2-3 sentence) summary of this review.`;

    const summaryResponse = await analyzeAgents.generate(summaryPrompt);
    const summary = summaryResponse.text.trim();

    // Generate sentiment + tags
    const secondPrompt = `Review Text:\n${text}\n\nAnswer with ONLY a JSON object (no markdown, no code blocks) including:
- sentimentLabel: "positive", "neutral", or "negative"
- sentimentScore: a number between 0.0 and 1.0
- tags: an array of 1-5 keyword strings

JSON Response:`;

    const sentimentRes = await analyzeAgents.generate(secondPrompt);

    let sentimentLabel = "neutral";
    let sentimentScore = 0.5;
    let tags: string[] = [];

    try {
      // Strip markdown code blocks if present
      let jsonText = sentimentRes.text.trim();

      // Remove ```json and ``` if present
      if (jsonText.startsWith("```")) {
        jsonText = jsonText
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      const parsed = JSON.parse(jsonText);
      sentimentLabel = parsed.sentimentLabel;
      sentimentScore = parsed.sentimentScore;
      tags = parsed.tags;
    } catch (e) {
      console.error(
        "Failed to parse AI output for sentiment/tags:",
        sentimentRes.text
      );
      console.error("Parse error:", e);
    }

    const result = { summary, sentimentLabel, sentimentScore, tags };
    return result;
  } catch (error) {
    console.error("=== ERROR in enrichReviewText ===");
    console.error(error);
    throw error;
  }
}
