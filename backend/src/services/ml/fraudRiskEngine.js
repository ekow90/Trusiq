/**
 * Fraud Risk Engine
 * Combines multiple ML and behavioral signals into an overall fraud risk score
 * Stage 1: Combines fake review detector + sentiment + similarity + behavior
 */

/**
 * Calculate overall fraud risk from multiple signals
 * @param {Object} signals - Individual signal scores
 * @returns {Object} Overall fraud risk analysis
 */
function calculateFraudRisk(signals) {
  const {
    fakeReviewProbability = 0,
    sentimentScore = 0.5,
    similarityAnomaly = 0,
    behaviorRiskScore = 0,
    toxicityScore = 0,
  } = signals;

  // Weights for each signal (sum must equal 1)
  const WEIGHTS = {
    fake: 0.35,
    sentiment: 0.15,
    similarity: 0.15,
    behavior: 0.25,
    toxicity: 0.1,
  };

  // Calculate weighted risk score
  const weightedScore =
    fakeReviewProbability * WEIGHTS.fake +
    (1 - sentimentScore) * WEIGHTS.sentiment + // Lower sentiment = higher risk
    similarityAnomaly * WEIGHTS.similarity +
    behaviorRiskScore * WEIGHTS.behavior +
    toxicityScore * WEIGHTS.toxicity;

  // Normalize to 0-1
  const fraudRiskScore = Math.min(1, Math.max(0, weightedScore));

  // Determine risk level and color
  let riskLevel = "LOW";
  let riskColor = "#10b981"; // green

  if (fraudRiskScore >= 0.6) {
    riskLevel = "HIGH";
    riskColor = "#ef4444"; // red
  } else if (fraudRiskScore >= 0.35) {
    riskLevel = "MEDIUM";
    riskColor = "#f59e0b"; // amber
  }

  // Explanation based on contributing factors
  const contributingFactors = [];

  if (fakeReviewProbability > 0.6) {
    contributingFactors.push("High fake-review probability");
  }

  if (sentimentScore > 0.9 || sentimentScore < 0.1) {
    contributingFactors.push("Extreme sentiment (very positive or negative)");
  }

  if (similarityAnomaly > 0.6) {
    contributingFactors.push("Review text appears similar to other reviews");
  }

  if (behaviorRiskScore > 0.5) {
    contributingFactors.push("Unusual customer behavior patterns");
  }

  if (toxicityScore > 0.6) {
    contributingFactors.push("Review contains potentially abusive language");
  }

  return {
    fraudRiskScore: Number(fraudRiskScore.toFixed(3)),
    riskLevel,
    riskColor,
    contributingFactors:
      contributingFactors.length > 0
        ? contributingFactors
        : ["Review appears genuine"],
    signalBreakdown: {
      fakeReviewProbability: Number(fakeReviewProbability.toFixed(3)),
      sentimentAnomaly: Number((1 - sentimentScore).toFixed(3)),
      similarityAnomaly: Number(similarityAnomaly.toFixed(3)),
      behaviorRiskScore: Number(behaviorRiskScore.toFixed(3)),
      toxicityScore: Number(toxicityScore.toFixed(3)),
    },
    weights: WEIGHTS,
  };
}

/**
 * Determine action based on fraud risk score
 * @param {number} fraudRiskScore - Score from 0-1
 * @returns {Object} Recommended action
 */
function getRecommendedAction(fraudRiskScore) {
  if (fraudRiskScore < 0.3) {
    return {
      action: "APPROVE",
      status: "normal",
      message: "Review appears genuine",
      requiresReview: false,
    };
  }

  if (fraudRiskScore < 0.6) {
    return {
      action: "MONITOR",
      status: "flagged",
      message: "Review flagged for review, but not necessarily fraudulent",
      requiresReview: true,
    };
  }

  return {
    action: "NEEDS_REVIEW",
    status: "high_risk",
    message: "Review requires administrator verification",
    requiresReview: true,
  };
}

/**
 * Create human-readable explanation for fraud risk
 * @param {Object} fraudAnalysis - Result from calculateFraudRisk
 * @returns {string} Explanation text
 */
function generateExplanation(fraudAnalysis) {
  const { fraudRiskScore, contributingFactors, riskLevel } = fraudAnalysis;

  if (riskLevel === "LOW") {
    return `This review appears genuine with a fraud risk of ${(fraudRiskScore * 100).toFixed(1)}%.`;
  }

  if (riskLevel === "MEDIUM") {
    return `This review has medium fraud risk (${(fraudRiskScore * 100).toFixed(1)}%). ${contributingFactors.join(
      " ",
    )} Consider reviewing before publishing.`;
  }

  return `This review has high fraud risk (${(fraudRiskScore * 100).toFixed(1)}%). ${contributingFactors.join(
    " ",
  )} Recommend administrator verification.`;
}

module.exports = {
  calculateFraudRisk,
  getRecommendedAction,
  generateExplanation,
};
