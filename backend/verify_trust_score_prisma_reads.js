const assert = require("node:assert/strict");
const {
  findTrustScoreByBusinessId,
  findTrustScoreByCompanyId,
  getTrustScoreOverview,
} = require("./src/services/trustScoreService");

const row = {
  id: "trust-1",
  companyId: "company-1",
  businessId: "business-1",
  score: 87.5,
  percentile: 12,
  averageRating: 4.4,
  verifiedReviewRatio: 0.8,
  aiAuthenticityScore: 0.91,
  metrics: { reviewAuthenticity: 92 },
  trajectory: [72, 80, 87.5],
  calculatedAt: new Date("2026-01-01T00:00:00.000Z"),
  lastUpdated: new Date("2026-01-02T00:00:00.000Z"),
};

const emptyRow = {
  id: "trust-2",
  companyId: "company-2",
  businessId: "business-2",
  score: null,
  percentile: null,
  averageRating: null,
  verifiedReviewRatio: null,
  aiAuthenticityScore: null,
  metrics: null,
  trajectory: null,
  calculatedAt: null,
  lastUpdated: null,
};

const prismaMock = {
  trustScore: {
    findFirst: async ({ where }) =>
      where.businessId === "business-1" ? row : null,
    findUnique: async ({ where }) =>
      where.companyId === "company-2" ? emptyRow : null,
  },
};

async function main() {
  const byBusiness = await findTrustScoreByBusinessId("business-1", prismaMock);
  assert.equal(byBusiness.companyId, "company-1");
  assert.equal(byBusiness.businessId, "business-1");
  assert.equal(byBusiness.averageRating, 4.4);
  assert.equal(byBusiness.verifiedReviewRatio, 0.8);
  assert.equal(byBusiness.aiAuthenticityScore, 0.91);
  assert.deepEqual(byBusiness.metrics, { reviewAuthenticity: 92 });
  assert.deepEqual(byBusiness.trajectory, [72, 80, 87.5]);

  const byCompany = await findTrustScoreByCompanyId("company-2", prismaMock);
  assert.equal(byCompany.score, 0);
  assert.equal(byCompany.percentile, 0);
  assert.equal(byCompany.averageRating, 0);
  assert.equal(byCompany.verifiedReviewRatio, 0);
  assert.equal(byCompany.aiAuthenticityScore, 0);
  assert.deepEqual(byCompany.metrics, {});
  assert.deepEqual(byCompany.trajectory, []);
  assert.equal(byCompany.lastUpdated, null);

  const overview = await getTrustScoreOverview("business-1", prismaMock);
  assert.equal(overview.score, 87.5);

  const missing = await findTrustScoreByCompanyId("missing", prismaMock);
  assert.equal(missing, null);

  console.log("Prisma trust score read verification passed");
}

main().catch((error) => {
  console.error("Prisma trust score read verification failed:", error);
  process.exitCode = 1;
});
