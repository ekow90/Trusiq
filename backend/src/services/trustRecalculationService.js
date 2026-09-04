const { calculateTrustScore } = require("./trustCalculationService");

async function recalculateBusinessTrustScoreAfterAnalysis(reviewId, dbClient) {
  if (!dbClient) return null;

  const reviewResult = await dbClient.query(
    `SELECT r.business_id, b.verification_level
     FROM reviews r JOIN businesses b ON b.id = r.business_id
     WHERE r.id = $1 LIMIT 1`,
    [reviewId],
  );
  const review = reviewResult.rows[0];
  if (!review) return null;

  const signalResult = await dbClient.query(
    `SELECT fraud_risk_score FROM review_ai_analysis_signals
     WHERE review_id = $1 LIMIT 1`,
    [reviewId],
  );
  const fraudRiskScore = Math.max(
    0,
    Math.min(1, Number(signalResult.rows[0]?.fraud_risk_score ?? 0)),
  );

  const aggregateResult = await dbClient.query(
    `SELECT AVG(rating) AS average_rating,
            COUNT(*)::int AS review_count,
            COUNT(*) FILTER (WHERE rating >= 4)::int AS positive_count,
            COUNT(*) FILTER (WHERE verified_visit = TRUE)::int AS verified_count
     FROM reviews WHERE business_id = $1`,
    [review.business_id],
  );
  const aggregate = aggregateResult.rows[0] || {};
  const reviewCount = Number(aggregate.review_count || 0);
  const verifiedCount = Number(aggregate.verified_count || 0);
  const scoreCalculation = calculateTrustScore({
    averageRating: Number(aggregate.average_rating || 0),
    reviewCount,
    positiveReviewCount: Number(aggregate.positive_count || 0),
    // calculateTrustScore expects fake-review risk as a percentage.
    fakeReviewRisk: fraudRiskScore * 100,
    governmentVerified: review.verification_level === "verified",
  });
  const verifiedReviewRatio = reviewCount ? verifiedCount / reviewCount : 0;

  await dbClient.query(
    `UPDATE businesses SET trust_score = $1, updated_at = NOW() WHERE id = $2`,
    [scoreCalculation.score, review.business_id],
  );
  await dbClient.query(
    `INSERT INTO trust_scores (
       id, company_id, business_id, score, percentile, average_rating,
       verified_review_ratio, ai_authenticity_score, metrics, trajectory,
       calculated_at, last_updated
     ) VALUES ($1, $2, $3, $4, 0, $5, $6, $7, $8::jsonb, '[]'::jsonb, NOW(), NOW())
     ON CONFLICT (company_id) DO UPDATE SET
       business_id = EXCLUDED.business_id,
       score = EXCLUDED.score,
       average_rating = EXCLUDED.average_rating,
       verified_review_ratio = EXCLUDED.verified_review_ratio,
       ai_authenticity_score = EXCLUDED.ai_authenticity_score,
       metrics = EXCLUDED.metrics,
       last_updated = NOW()`,
    [
      `trust-${review.business_id}`,
      review.business_id,
      review.business_id,
      scoreCalculation.score,
      Number(aggregate.average_rating || 0),
      verifiedReviewRatio,
      1 - fraudRiskScore,
      JSON.stringify(scoreCalculation.factors),
    ],
  );

  return {
    businessId: review.business_id,
    trustScore: scoreCalculation.score,
    fraudRiskScore,
  };
}

module.exports = { recalculateBusinessTrustScoreAfterAnalysis };
