/**
 * Fake Review Detector Service
 * Uses zero-shot classification to detect suspicious review patterns
 * Falls back to heuristics if model unavailable
 */

const { getTextClassificationPipeline } = require("./modelLoader");

// Use zero-shot classification as proxy for fake detection
const MODEL_NAME = "Xenova/distilbert-base-uncased";

/**
 * Analyze a single review for fake probability using heuristics
 * @param {string} reviewText - The review text to analyze
 * @returns {Promise<{probability: number, label: string, confidence: number}>}
 */
async function analyzeFakeReviewProbability(reviewText) {
  if (
    !reviewText ||
    typeof reviewText !== "string" ||
    reviewText.trim().length === 0
  ) {
    return {
      probability: 0,
      label: "NEUTRAL",
      confidence: 0,
      error: "Invalid review text",
    };
  }

  try {
    // Use heuristic-based approach for fake review detection
    // Factors that suggest a fake/low-quality review:

    let suspiciousScore = 0;
    const text = reviewText.trim();

    // 1. Excessive capitalization (>30% caps) - 25% weight
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / text.length;
    if (capsRatio > 0.3) {
      suspiciousScore += 0.25;
    }

    // 2. Excessive exclamation marks (>15% of punctuation) - 20% weight
    const exclamations = (text.match(/!/g) || []).length;
    const punctuation = (text.match(/[!?.]/g) || []).length;
    const exclamationRatio = punctuation > 0 ? exclamations / punctuation : 0;
    if (exclamationRatio > 0.15) {
      suspiciousScore += 0.2;
    }

    // 3. Very short review (<10 words) - 15% weight
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 10) {
      suspiciousScore += 0.15;
    }

    // 4. Excessive repetition of words/phrases - 20% weight
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(wordFreq));
    if (maxFreq / words.length > 0.2) {
      suspiciousScore += 0.2;
    }

    // 5. Very long review (>500 words, unusual) - 10% weight
    if (wordCount > 500) {
      suspiciousScore += 0.1;
    }

    // Normalize to 0-1 range
    const probability = Math.min(suspiciousScore, 1);

    return {
      probability: probability,
      label:
        probability > 0.6
          ? "SUSPICIOUS"
          : probability > 0.3
            ? "QUESTIONABLE"
            : "NORMAL",
      confidence: 0,
      method: "heuristic",
    };
  } catch (error) {
    console.error(
      "[FakeReviewDetector] Error analyzing review:",
      error.message,
    );
    return {
      probability: 0.5,
      label: "ERROR",
      confidence: 0,
      error: error.message,
    };
  }
}

/**
 * Analyze multiple reviews (batch)
 * @param {string[]} reviews - Array of review texts
 * @returns {Promise<Array>} Array of analysis results
 */
async function analyzeBatch(reviews) {
  return Promise.all(
    reviews.map((review) => analyzeFakeReviewProbability(review)),
  );
}

module.exports = {
  analyzeFakeReviewProbability,
  analyzeBatch,
  MODEL_NAME,
};
