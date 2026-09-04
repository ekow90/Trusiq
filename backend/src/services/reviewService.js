const { getDb, initDb } = require("../db");
const prisma = require("../prisma");

const REVIEW_SELECT = {
  id: true,
  businessId: true,
  userId: true,
  rating: true,
  reviewText: true,
  verifiedVisit: true,
  reviewStatus: true,
  reviewHash: true,
  hashMetadata: true,
  createdAt: true,
  updatedAt: true,
};

function logPrismaFallback(operation, error) {
  console.warn(
    `[ReviewService] Prisma ${operation} failed; falling back to pg:`,
    error.message,
  );
}

function normalizeReview(row) {
  if (!row) return null;

  return {
    id: row.id,
    businessId: row.businessId ?? row.business_id,
    userId: row.userId ?? row.user_id,
    rating: Number(row.rating ?? 0),
    reviewText: row.reviewText ?? row.review_text ?? "",
    verifiedVisit: Boolean(row.verifiedVisit ?? row.verified_visit),
    reviewStatus: row.reviewStatus ?? row.review_status ?? "active",
    reviewHash: row.reviewHash ?? row.review_hash ?? null,
    hashMetadata: row.hashMetadata ?? row.hash_metadata ?? {},
    createdAt: row.createdAt ?? row.created_at ?? null,
    updatedAt: row.updatedAt ?? row.updated_at ?? null,
    userName: row.user?.fullName ?? row.userName ?? row.user_name ?? null,
    businessName:
      row.business?.businessName ??
      row.businessName ??
      row.business_name ??
      null,
    businessSlug: row.business?.slug ?? row.slug ?? null,
  };
}

function toLegacyReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    review_text: review.reviewText,
    verified_visit: review.verifiedVisit,
    review_status: review.reviewStatus,
    created_at: review.createdAt,
    business_name: review.businessName,
    slug: review.businessSlug,
  };
}

function reviewQueryOptions(options = {}) {
  return {
    skip: Math.max(0, Number(options.offset || 0)),
    take: Math.max(0, Number(options.limit || 100)),
  };
}

async function listReviewsForBusiness(
  businessId,
  options = {},
  client = prisma,
) {
  const { skip, take } = reviewQueryOptions(options);
  try {
    const rows = await client.review.findMany({
      where: { businessId: String(businessId) },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        ...REVIEW_SELECT,
        user: { select: { fullName: true } },
      },
    });
    return rows.map(normalizeReview);
  } catch (error) {
    logPrismaFallback("business review list", error);
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT id, business_id, user_id, rating, review_text, verified_visit, review_status, review_hash, hash_metadata, created_at, updated_at
       FROM reviews WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [String(businessId), take, skip],
    );
    return result.rows.map(normalizeReview);
  }
}

async function listReviewsByUser(userId, options = {}, client = prisma) {
  const { skip, take } = reviewQueryOptions(options);
  try {
    const rows = await client.review.findMany({
      where: { userId: String(userId) },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        ...REVIEW_SELECT,
        business: { select: { businessName: true, slug: true } },
      },
    });
    return rows.map(normalizeReview);
  } catch (error) {
    logPrismaFallback("user review list", error);
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT r.id, r.business_id, r.user_id, r.rating, r.review_text, r.verified_visit, r.review_status, r.review_hash, r.hash_metadata, r.created_at, r.updated_at,
              b.business_name, b.slug
       FROM reviews r JOIN businesses b ON b.id = r.business_id
       WHERE r.user_id = $1 ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`,
      [String(userId), take, skip],
    );
    return result.rows.map(normalizeReview);
  }
}

async function getReviewSummaryForBusiness(businessId, client = prisma) {
  try {
    const [total, verified, positive, average] = await Promise.all([
      client.review.count({ where: { businessId: String(businessId) } }),
      client.review.count({
        where: { businessId: String(businessId), verifiedVisit: true },
      }),
      client.review.count({
        where: { businessId: String(businessId), rating: { gte: 4 } },
      }),
      client.review.aggregate({
        where: { businessId: String(businessId) },
        _avg: { rating: true },
      }),
    ]);
    return {
      total: Number(total),
      verified: Number(verified),
      positive: Number(positive),
      averageRating: Number(average._avg.rating ?? 0),
    };
  } catch (error) {
    logPrismaFallback("review summary", error);
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE verified_visit = TRUE)::int AS verified,
              COUNT(*) FILTER (WHERE rating >= 4)::int AS positive,
              COALESCE(AVG(rating), 0)::float AS average_rating
       FROM reviews WHERE business_id = $1`,
      [String(businessId)],
    );
    const row = result.rows[0] || {};
    return {
      total: Number(row.total || 0),
      verified: Number(row.verified || 0),
      positive: Number(row.positive || 0),
      averageRating: Number(row.average_rating || 0),
    };
  }
}

module.exports = {
  getReviewSummaryForBusiness,
  listReviewsByUser,
  listReviewsForBusiness,
  normalizeReview,
  toLegacyReview,
};
