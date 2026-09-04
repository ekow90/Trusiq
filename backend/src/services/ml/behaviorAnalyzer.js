/**
 * Behavioral Analyzer Service
 * Analyzes customer behavior patterns and detects anomalies
 * Extracts signals from PostgreSQL database
 */

/**
 * Calculate Z-score for anomaly detection
 * @param {number} value - The value to score
 * @param {number} mean - Mean of the population
 * @param {number} stdDev - Standard deviation
 * @returns {number} Z-score
 */
function calculateZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Analyze customer behavioral signals
 * @param {Object} customerFeatures - Customer data from database
 * @returns {Object} Behavioral risk analysis
 */
function analyzeCustomerBehavior(customerFeatures) {
  const {
    accountAgeDays = 0,
    reviewCount = 0,
    averageRating = 3,
    ratingVariance = 1,
    businessesReviewed = 0,
    daysUntilFirstReview = 1,
    averageReviewLength = 100,
    verifiedVisitRatio = 0,
    reviewsInLast7Days = 0,
    maxReviewsInSingleDay = 0,
  } = customerFeatures;

  const signals = {};
  const risks = [];
  let riskScore = 0;

  // Signal 1: Account age
  // Newer accounts are slightly riskier
  signals.accountAgeDays = accountAgeDays;
  if (accountAgeDays === 0) {
    risks.push("Brand new account");
    riskScore += 15;
  } else if (accountAgeDays < 7) {
    risks.push("Account created recently");
    riskScore += 10;
  }

  // Signal 2: Time until first review
  // Reviews submitted immediately after account creation are risky
  signals.daysUntilFirstReview = daysUntilFirstReview;
  if (daysUntilFirstReview === 0 && reviewCount > 0) {
    risks.push("First review submitted same day as account creation");
    riskScore += 20;
  } else if (daysUntilFirstReview < 1 && reviewCount > 0) {
    risks.push("First review submitted within first day");
    riskScore += 10;
  }

  // Signal 3: Review frequency (velocity)
  // Burst of reviews in short timeframe
  signals.reviewsInLast7Days = reviewsInLast7Days;
  if (reviewsInLast7Days > 5) {
    risks.push("High review submission velocity (multiple reviews in 7 days)");
    riskScore += 20;
  }

  signals.maxReviewsInSingleDay = maxReviewsInSingleDay;
  if (maxReviewsInSingleDay >= 2) {
    risks.push("Multiple reviews submitted on the same day");
    riskScore += 15;
  }

  // Signal 4: Rating distribution (all 5-stars or all 1-stars is suspicious)
  signals.averageRating = Number(averageRating.toFixed(2));
  signals.ratingVariance = Number(ratingVariance.toFixed(2));

  if (reviewCount >= 3) {
    if (averageRating > 4.8) {
      risks.push("Suspiciously high average rating (mostly 5-star reviews)");
      riskScore += 15;
    } else if (averageRating < 1.2) {
      risks.push("Suspiciously low average rating (mostly 1-star reviews)");
      riskScore += 15;
    }

    if (ratingVariance < 0.1 && reviewCount >= 2) {
      risks.push("Zero rating variance (all reviews identical rating)");
      riskScore += 10;
    }
  }

  // Signal 5: Verified visit ratio
  // Unverified reviews only
  signals.verifiedVisitRatio = Number(verifiedVisitRatio.toFixed(2));
  if (reviewCount >= 3 && verifiedVisitRatio === 0) {
    risks.push("No verified visits across all reviews");
    riskScore += 10;
  }

  // Signal 6: Average review length
  // Very short reviews are less informative
  signals.averageReviewLength = Math.round(averageReviewLength);
  if (averageReviewLength < 20 && reviewCount >= 2) {
    risks.push("Reviews are consistently very short (low detail)");
    riskScore += 5;
  }

  // Signal 7: Businesses reviewed
  // Reviewing many different businesses quickly
  signals.businessesReviewed = businessesReviewed;
  if (reviewCount >= 3 && businessesReviewed === reviewCount) {
    risks.push("Reviewing different business each time (no repeat reviewer)");
    riskScore += 5;
  }

  // Normalize risk score to 0-1
  const normalizedRiskScore = Math.min(1, Math.max(0, riskScore / 100));

  return {
    behaviorRiskScore: Number(normalizedRiskScore.toFixed(3)),
    riskLevel:
      normalizedRiskScore < 0.3
        ? "LOW"
        : normalizedRiskScore < 0.6
          ? "MEDIUM"
          : "HIGH",
    signals,
    risks,
    totalRiskPoints: riskScore,
  };
}

/**
 * Detect anomaly using statistical methods
 * @param {Object} features - Feature vector for anomaly detection
 * @param {Object} populationStats - Mean and stdDev for the population
 * @returns {Object} Anomaly score and analysis
 */
function detectAnomalies(features, populationStats = {}) {
  const anomalyScores = {};
  let totalAnomalyScore = 0;
  const anomalies = [];

  // Check each feature against population statistics
  for (const [featureName, featureValue] of Object.entries(features)) {
    if (featureName in populationStats && typeof featureValue === "number") {
      const stats = populationStats[featureName];
      if (stats.mean !== undefined && stats.stdDev !== undefined) {
        const zScore = calculateZScore(featureValue, stats.mean, stats.stdDev);
        const isAnomaly = Math.abs(zScore) > 2.5; // 2.5 standard deviations

        anomalyScores[featureName] = {
          zScore: Number(zScore.toFixed(2)),
          isAnomaly,
        };

        if (isAnomaly) {
          anomalies.push(`${featureName}: ${zScore.toFixed(2)}σ`);
          totalAnomalyScore += Math.abs(zScore) / 10;
        }
      }
    }
  }

  const normalizedAnomalyScore = Math.min(1, Math.max(0, totalAnomalyScore));

  return {
    anomalyScore: Number(normalizedAnomalyScore.toFixed(3)),
    zScores: anomalyScores,
    anomalies,
    isAnomaly: anomalies.length > 0,
  };
}

module.exports = {
  analyzeCustomerBehavior,
  detectAnomalies,
  calculateZScore,
};
