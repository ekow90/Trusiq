/**
 * Semantic Similarity Analyzer Service
 * Detects duplicate and near-duplicate reviews
 * Stage 1: Heuristic-based (fast, local)
 * Future: Add embeddings with all-MiniLM-L6-v2
 */

/**
 * Calculate text similarity using Levenshtein-inspired approach
 * This is a fast heuristic; later can use embeddings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score 0-1 (1 = identical)
 */
function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const normalized1 = text1.toLowerCase().trim();
  const normalized2 = text2.toLowerCase().trim();

  // Exact match
  if (normalized1 === normalized2) return 1;

  // Split into words
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);

  // Jaccard similarity (word-level)
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  const jaccardSimilarity =
    union.size === 0 ? 0 : intersection.size / union.size;

  // Levenshtein-inspired: character overlap
  const minLen = Math.min(normalized1.length, normalized2.length);
  const maxLen = Math.max(normalized1.length, normalized2.length);

  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (normalized1[i] === normalized2[i]) matches++;
  }

  const charSimilarity = maxLen === 0 ? 0 : matches / maxLen;

  // Combine signals (word-based weighted higher for review detection)
  return jaccardSimilarity * 0.7 + charSimilarity * 0.3;
}

/**
 * Check if review text is suspicious (possible duplicate/near-duplicate)
 * @param {string} reviewText - Review text to check
 * @param {string[]} existingReviews - Array of existing review texts
 * @returns {Promise<{isSuspicious: boolean, maxSimilarity: number, duplicateCount: number}>}
 */
async function checkForDuplicates(reviewText, existingReviews = []) {
  if (
    !reviewText ||
    !Array.isArray(existingReviews) ||
    existingReviews.length === 0
  ) {
    return {
      isSuspicious: false,
      maxSimilarity: 0,
      duplicateCount: 0,
      threshold: 0.8,
    };
  }

  try {
    const similarities = existingReviews.map((existingReview) =>
      calculateSimilarity(reviewText, existingReview),
    );

    const maxSimilarity = Math.max(...similarities);
    const DUPLICATE_THRESHOLD = 0.8;
    const NEAR_DUPLICATE_THRESHOLD = 0.6;

    const exactDuplicates = similarities.filter(
      (s) => s >= DUPLICATE_THRESHOLD,
    ).length;
    const nearDuplicates = similarities.filter(
      (s) => s >= NEAR_DUPLICATE_THRESHOLD,
    ).length;

    return {
      isSuspicious: maxSimilarity >= NEAR_DUPLICATE_THRESHOLD,
      maxSimilarity: Number(maxSimilarity.toFixed(3)),
      duplicateCount: exactDuplicates,
      nearDuplicateCount: nearDuplicates,
      threshold: NEAR_DUPLICATE_THRESHOLD,
    };
  } catch (error) {
    console.error(
      "[SimilarityAnalyzer] Error checking for duplicates:",
      error.message,
    );
    return {
      isSuspicious: false,
      maxSimilarity: 0,
      duplicateCount: 0,
      error: error.message,
    };
  }
}

/**
 * Find similar reviews from a list
 * @param {string} reviewText - Review to match
 * @param {string[]} reviewTexts - List of reviews to search
 * @param {number} threshold - Minimum similarity (0-1)
 * @returns {Array} Matching reviews with similarity scores
 */
function findSimilarReviews(reviewText, reviewTexts = [], threshold = 0.7) {
  return reviewTexts
    .map((text, index) => ({
      index,
      similarity: calculateSimilarity(reviewText, text),
    }))
    .filter((item) => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}

module.exports = {
  calculateSimilarity,
  checkForDuplicates,
  findSimilarReviews,
};
