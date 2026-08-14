const { getDb, saveDb } = require("../db");

function normalizeMetrics(metrics = {}) {
  return {
    reviewAuthenticity: Number(metrics.reviewAuthenticity ?? 0),
    verificationLevel: Number(metrics.verificationLevel ?? 0),
    customerSentiment: Number(metrics.customerSentiment ?? 0),
    businessActivity: Number(metrics.businessActivity ?? 0),
  };
}

function normalizeTrajectory(trajectory = []) {
  return Array.isArray(trajectory) ? trajectory.map(Number) : [];
}

async function upsertTrustScore({
  companyId,
  score,
  percentile,
  metrics,
  trajectory,
}) {
  const db = await getDb();
  const normalizedMetrics = normalizeMetrics(metrics);
  const normalizedTrajectory = normalizeTrajectory(trajectory);

  await db.query(
    `INSERT INTO trust_scores (id, company_id, business_id, score, percentile, metrics, trajectory, last_updated)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, NOW())
     ON CONFLICT (company_id) DO UPDATE SET
       score = EXCLUDED.score,
       percentile = EXCLUDED.percentile,
       metrics = EXCLUDED.metrics,
       trajectory = EXCLUDED.trajectory,
       last_updated = NOW()`,
    [
      `trust-${companyId}`,
      companyId,
      companyId,
      Number(score),
      Number(percentile),
      JSON.stringify(normalizedMetrics),
      JSON.stringify(normalizedTrajectory),
    ],
  );

  await saveDb();

  return {
    companyId,
    score: Number(score),
    percentile: Number(percentile),
    metrics: normalizedMetrics,
    trajectory: normalizedTrajectory,
    lastUpdated: new Date().toISOString(),
  };
}

module.exports = { upsertTrustScore };
