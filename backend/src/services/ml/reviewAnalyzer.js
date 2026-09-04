/**
 * Review Analyzer Orchestrator
 * Coordinates all ML services to perform comprehensive review analysis
 * Runs async and stores results in database
 */

const { analyzeFakeReviewProbability } = require("./fakeReviewDetector");
const { analyzeSentiment } = require("./sentimentAnalyzer");
const { analyzeToxicity } = require("./toxicityAnalyzer");
const { checkForDuplicates } = require("./similarityAnalyzer");
const { analyzeCustomerBehavior } = require("./behaviorAnalyzer");
const {
  calculateFraudRisk,
  getRecommendedAction,
} = require("./fraudRiskEngine");

/**
 * Analyze a single review comprehensively
 * @param {Object} reviewData - Review data including text, user, business info
 * @param {Object} dbClient - PostgreSQL connection pool
 * @returns {Promise<Object>} Complete analysis results
 */
async function analyzeReview(reviewData, dbClient) {
  const { id: reviewId, reviewText, userId, businessId } = reviewData;

  console.log(`[ReviewAnalyzer] Starting analysis for review ${reviewId}`);

  const analysisStart = Date.now();
  const results = {
    reviewId,
    timestamp: new Date().toISOString(),
    signals: {},
    analysis: {},
    sentiment: "NEUTRAL",
    authenticityScore: 0.5,
    toxicityScore: 0,
    flags: [],
    summary: "Analysis is using safe fallback signals.",
    provider: "fallback",
    status: "fallback",
  };

  try {
    // Individual analyzers may depend on unavailable local models.
    const [fakeReviewSettled, sentimentSettled, toxicitySettled] =
      await Promise.allSettled([
        analyzeFakeReviewProbability(reviewText),
        analyzeSentiment(reviewText),
        analyzeToxicity(reviewText),
      ]);
    const fakeReviewResult =
      fakeReviewSettled.status === "fulfilled"
        ? fakeReviewSettled.value
        : { probability: 0.5, label: "UNAVAILABLE", confidence: 0 };
    const sentimentResult =
      sentimentSettled.status === "fulfilled"
        ? sentimentSettled.value
        : { sentiment: "NEUTRAL", score: 0.5, confidence: 0 };
    const toxicityResult =
      toxicitySettled.status === "fulfilled"
        ? toxicitySettled.value
        : { score: 0, label: "UNAVAILABLE", confidence: 0 };

    results.signals.fakeReview = fakeReviewResult;
    results.signals.sentiment = sentimentResult;
    results.signals.toxicity = toxicityResult;
    results.sentiment = sentimentResult.sentiment || "NEUTRAL";
    results.authenticityScore = Number(
      1 - (fakeReviewResult.probability ?? 0.5),
    );
    results.toxicityScore = Number(toxicityResult.score ?? 0);
    results.flags = [
      ...(fakeReviewResult.error ? ["Fake-review model unavailable"] : []),
      ...(sentimentResult.error ? ["Sentiment model unavailable"] : []),
      ...(toxicityResult.error ? ["Toxicity model unavailable"] : []),
    ];
    results.provider = [
      fakeReviewResult.method === "heuristic" ? "heuristic" : "local-ml",
      sentimentResult.error ? "fallback" : "local-ml",
      toxicityResult.error ? "fallback" : "local-ml",
    ].includes("fallback")
      ? "fallback"
      : "local-ml";

    // Get existing reviews for similarity check
    let similarityResult = {
      isSuspicious: false,
      maxSimilarity: 0,
      duplicateCount: 0,
    };

    try {
      if (dbClient) {
        const existingReviewsResult = await dbClient.query(
          "SELECT review_text FROM reviews WHERE business_id = $1 AND id != $2 AND review_text IS NOT NULL",
          [businessId, reviewId],
        );

        const existingReviews = existingReviewsResult.rows.map(
          (r) => r.review_text,
        );

        if (existingReviews.length > 0) {
          similarityResult = await checkForDuplicates(
            reviewText,
            existingReviews,
          );
        }
      }
    } catch (error) {
      console.error(
        "[ReviewAnalyzer] Could not fetch existing reviews:",
        error.message,
      );
    }

    results.signals.similarity = similarityResult;

    // Get customer behavior analysis
    let behaviorResult = {
      behaviorRiskScore: 0,
      riskLevel: "LOW",
      signals: {},
      risks: [],
    };

    try {
      if (dbClient) {
        const userReviewsResult = await dbClient.query(
          `SELECT 
            COUNT(*) as review_count,
            AVG(rating) as average_rating,
            STDDEV(rating) as rating_variance,
            MIN(u.created_at) as account_created,
            COUNT(DISTINCT business_id) as businesses_reviewed,
            SUM(CASE WHEN review_text IS NOT NULL THEN LENGTH(review_text) ELSE 0 END) / NULLIF(COUNT(*), 0) as avg_review_length,
            SUM(CASE WHEN verified_visit = true THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 1) as verified_visit_ratio
          FROM reviews r
          JOIN users u ON r.user_id = u.id
          WHERE r.user_id = $1`,
          [userId],
        );

        const userData = userReviewsResult.rows[0];

        if (userData) {
          const accountAgeDays = userData.account_created
            ? Math.floor(
                (Date.now() - new Date(userData.account_created).getTime()) /
                  (1000 * 60 * 60 * 24),
              )
            : 0;

          const customerFeatures = {
            accountAgeDays,
            reviewCount: parseInt(userData.review_count) || 0,
            averageRating: parseFloat(userData.average_rating) || 3,
            ratingVariance: parseFloat(userData.rating_variance) || 1,
            businessesReviewed: parseInt(userData.businesses_reviewed) || 0,
            daysUntilFirstReview: 0,
            averageReviewLength: parseFloat(userData.avg_review_length) || 0,
            verifiedVisitRatio: parseFloat(userData.verified_visit_ratio) || 0,
          };

          behaviorResult = analyzeCustomerBehavior(customerFeatures);
        }
      }
    } catch (error) {
      console.error(
        "[ReviewAnalyzer] Could not analyze customer behavior:",
        error.message,
      );
    }

    results.signals.behavior = behaviorResult;

    // Calculate overall fraud risk
    const fraudAnalysis = calculateFraudRisk({
      fakeReviewProbability: fakeReviewResult.probability || 0,
      sentimentScore: sentimentResult.score || 0.5,
      similarityAnomaly: similarityResult.maxSimilarity || 0,
      behaviorRiskScore: behaviorResult.behaviorRiskScore || 0,
      toxicityScore: toxicityResult.score || 0,
    });

    results.analysis.fraudRisk = fraudAnalysis;
    results.analysis.recommendation = getRecommendedAction(
      fraudAnalysis.fraudRiskScore,
    );

    // Add metadata
    results.analysisVersion = "trusiq-ai-v1";
    results.summary = results.flags.length
      ? "Some AI models were unavailable; results use safe fallback signals."
      : "Review analysis completed using configured local signals.";
    results.status = results.flags.length ? "degraded" : "complete";
    results.modelsUsed = [
      "jb10231/fake-review-detector",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
      "Xenova/toxic-bert",
      "heuristic-similarity",
      "behavioral-analysis",
    ];
    results.durationMs = Date.now() - analysisStart;

    console.log(
      `[ReviewAnalyzer] Analysis complete for ${reviewId} (${results.durationMs}ms)`,
    );

    return results;
  } catch (error) {
    console.error(
      `[ReviewAnalyzer] Error analyzing review ${reviewId}:`,
      error.message,
    );

    // Return degraded analysis
    return {
      reviewId,
      timestamp: new Date().toISOString(),
      error: error.message,
      sentiment: "NEUTRAL",
      authenticityScore: 0.5,
      toxicityScore: 0,
      flags: ["Review analysis unavailable"],
      summary: "Review analysis is unavailable; manual review is recommended.",
      provider: "fallback",
      status: "fallback",
      analysis: {
        fraudRisk: {
          fraudRiskScore: 0.5,
          riskLevel: "UNKNOWN",
          contributingFactors: ["Analysis error occurred"],
          signalBreakdown: {},
        },
        recommendation: {
          action: "NEEDS_REVIEW",
          status: "error",
          message: "Analysis failed, manual review required",
          requiresReview: true,
        },
      },
      durationMs: Date.now() - analysisStart,
    };
  }
}

module.exports = {
  analyzeReview,
};
