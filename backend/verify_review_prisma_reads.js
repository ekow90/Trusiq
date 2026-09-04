const assert = require("node:assert/strict");
const {
  getReviewSummaryForBusiness,
  listReviewsByUser,
  listReviewsForBusiness,
} = require("./src/services/reviewService");

const reviews = [
  {
    id: "review-1",
    businessId: "business-1",
    userId: "user-1",
    rating: 5,
    reviewText: "Excellent service",
    verifiedVisit: true,
    reviewStatus: "active",
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    user: { fullName: "Customer One" },
    business: { businessName: "Kora Kitchen", slug: "kora-kitchen" },
  },
  {
    id: "review-2",
    businessId: "business-1",
    userId: "user-2",
    rating: 3,
    reviewText: null,
    verifiedVisit: false,
    reviewStatus: null,
    createdAt: null,
    updatedAt: null,
    user: { fullName: "Customer Two" },
    business: { businessName: "Kora Kitchen", slug: "kora-kitchen" },
  },
];

const prismaMock = {
  review: {
    findMany: async ({ where }) =>
      reviews.filter(
        (review) =>
          review.businessId === where.businessId ||
          review.userId === where.userId,
      ),
    count: async ({ where } = {}) =>
      reviews.filter((review) => {
        if (where.businessId && review.businessId !== where.businessId)
          return false;
        if (
          where.verifiedVisit !== undefined &&
          review.verifiedVisit !== where.verifiedVisit
        )
          return false;
        if (where.rating?.gte && review.rating < where.rating.gte) return false;
        return true;
      }).length,
    aggregate: async () => ({ _avg: { rating: 4 } }),
  },
};

async function main() {
  const businessReviews = await listReviewsForBusiness(
    "business-1",
    { limit: 10 },
    prismaMock,
  );
  assert.equal(businessReviews.length, 2);
  assert.equal(businessReviews[0].reviewText, "Excellent service");
  assert.equal(businessReviews[0].verifiedVisit, true);
  assert.equal(businessReviews[0].userName, "Customer One");
  assert.equal(businessReviews[1].reviewText, "");
  assert.equal(businessReviews[1].reviewStatus, "active");
  assert.equal(businessReviews[1].createdAt, null);

  const userReviews = await listReviewsByUser("user-1", {}, prismaMock);
  assert.equal(userReviews.length, 1);
  assert.equal(userReviews[0].businessName, "Kora Kitchen");
  assert.equal(userReviews[0].businessSlug, "kora-kitchen");

  const summary = await getReviewSummaryForBusiness("business-1", prismaMock);
  assert.deepEqual(summary, {
    total: 2,
    verified: 1,
    positive: 1,
    averageRating: 4,
  });

  console.log("Prisma review read verification passed");
}

main().catch((error) => {
  console.error("Prisma review read verification failed:", error);
  process.exitCode = 1;
});
