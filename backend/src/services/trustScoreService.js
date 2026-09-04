const { getDb } = require("../db");
const prisma = require("../prisma");

const TRUST_SCORE_SELECT = {
  id: true,
  companyId: true,
  businessId: true,
  score: true,
  percentile: true,
  averageRating: true,
  verifiedReviewRatio: true,
  aiAuthenticityScore: true,
  metrics: true,
  trajectory: true,
  calculatedAt: true,
  lastUpdated: true,
};

function logPrismaFallback(operation, error) {
  console.warn(
    `[TrustScoreService] Prisma ${operation} failed; falling back to pg:`,
    error.message,
  );
}

function normalizeJson(value, fallback) {
  return value === null || value === undefined ? fallback : value;
}

function normalizeTrustScore(row) {
  if (!row) return null;

  return {
    id: row.id,
    companyId: row.companyId ?? row.company_id ?? null,
    businessId: row.businessId ?? row.business_id ?? null,
    score: Number(row.score ?? 0),
    percentile: Number(row.percentile ?? 0),
    averageRating: Number(row.averageRating ?? row.average_rating ?? 0),
    verifiedReviewRatio: Number(
      row.verifiedReviewRatio ?? row.verified_review_ratio ?? 0,
    ),
    aiAuthenticityScore: Number(
      row.aiAuthenticityScore ?? row.ai_authenticity_score ?? 0,
    ),
    metrics: normalizeJson(row.metrics, {}),
    trajectory: normalizeJson(row.trajectory, []),
    calculatedAt: row.calculatedAt ?? row.calculated_at ?? null,
    lastUpdated: row.lastUpdated ?? row.last_updated ?? null,
  };
}

async function findTrustScoreByBusinessId(businessId, client = prisma) {
  const value = String(businessId);
  try {
    const row = await client.trustScore.findFirst({
      where: { businessId: value },
      select: TRUST_SCORE_SELECT,
    });
    return normalizeTrustScore(row);
  } catch (error) {
    logPrismaFallback("business trust score lookup", error);
    const db = await getDb();
    const result = await db.query(
      `SELECT id, company_id, business_id, score, percentile, average_rating,
              verified_review_ratio, ai_authenticity_score, metrics, trajectory,
              calculated_at, last_updated
       FROM trust_scores WHERE business_id = $1 LIMIT 1`,
      [value],
    );
    return normalizeTrustScore(result.rows[0]);
  }
}

async function findTrustScoreByCompanyId(companyId, client = prisma) {
  const value = String(companyId);
  try {
    const row = await client.trustScore.findUnique({
      where: { companyId: value },
      select: TRUST_SCORE_SELECT,
    });
    return normalizeTrustScore(row);
  } catch (error) {
    logPrismaFallback("company trust score lookup", error);
    const db = await getDb();
    const result = await db.query(
      `SELECT id, company_id, business_id, score, percentile, average_rating,
              verified_review_ratio, ai_authenticity_score, metrics, trajectory,
              calculated_at, last_updated
       FROM trust_scores WHERE company_id = $1 LIMIT 1`,
      [value],
    );
    return normalizeTrustScore(result.rows[0]);
  }
}

async function getTrustScoreOverview(businessId, client = prisma) {
  return findTrustScoreByBusinessId(businessId, client);
}

module.exports = {
  findTrustScoreByBusinessId,
  findTrustScoreByCompanyId,
  getTrustScoreOverview,
  normalizeTrustScore,
};
