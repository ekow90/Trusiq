/**
 * Sentiment Analysis Service
 * Uses distilbert-base-uncased-finetuned-sst-2-english
 * Classifies review sentiment as POSITIVE or NEGATIVE
 */

const { getTextClassificationPipeline } = require("./modelLoader");

const MODEL_NAME = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";

/**
 * Analyze sentiment of a review
 * @param {string} reviewText - The review text to analyze
 * @returns {Promise<{sentiment: string, score: number, confidence: number}>}
 */
async function analyzeSentiment(reviewText) {
  if (
    !reviewText ||
    typeof reviewText !== "string" ||
    reviewText.trim().length === 0
  ) {
    return {
      sentiment: "NEUTRAL",
      score: 0.5,
      confidence: 0,
      error: "Invalid review text",
    };
  }

  try {
    const classifier = await getTextClassificationPipeline(MODEL_NAME);

    // Truncate very long reviews
    const truncatedText = reviewText.slice(0, 512);

    const result = await classifier(truncatedText);

    if (!result || result.length === 0) {
      return {
        sentiment: "NEUTRAL",
        score: 0.5,
        confidence: 0,
        error: "Model returned no results",
      };
    }

    const topResult = result[0];

    // Normalize output
    // Model returns { label: "POSITIVE" or "NEGATIVE", score: 0-1 }
    const isPositive = topResult.label === "POSITIVE";
    const score = isPositive ? topResult.score : 1 - topResult.score;

    return {
      sentiment: topResult.label,
      score: Number(score.toFixed(3)), // 0 = negative, 1 = positive
      confidence: Number(topResult.score.toFixed(3)),
      modelVersion: "Xenova/distilbert-sst2-v1",
    };
  } catch (error) {
    console.error("[SentimentAnalyzer] Error analyzing review:", error.message);
    return {
      sentiment: "ERROR",
      score: 0.5,
      confidence: 0,
      error: error.message,
    };
  }
}

/**
 * Analyze sentiment of multiple reviews (batch)
 * @param {string[]} reviews - Array of review texts
 * @returns {Promise<Array>} Array of sentiment results
 */
async function analyzeBatch(reviews) {
  return Promise.all(reviews.map((review) => analyzeSentiment(review)));
}

/**
 * Categorize sentiment into buckets
 * @param {number} score - Sentiment score (0-1)
 * @returns {string} Category: VERY_NEGATIVE, NEGATIVE, NEUTRAL, POSITIVE, VERY_POSITIVE
 */
function categorizeSentiment(score) {
  if (score < 0.2) return "VERY_NEGATIVE";
  if (score < 0.4) return "NEGATIVE";
  if (score < 0.6) return "NEUTRAL";
  if (score < 0.8) return "POSITIVE";
  return "VERY_POSITIVE";
}

module.exports = {
  analyzeSentiment,
  analyzeBatch,
  categorizeSentiment,
  MODEL_NAME,
};
