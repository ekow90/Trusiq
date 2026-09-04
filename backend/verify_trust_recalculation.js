const assert = require("node:assert/strict");
const { AnalysisQueue } = require("./src/services/ml/analysisQueue");

function createDbMock({ failTrustUpdate = false } = {}) {
  const queries = [];
  return {
    queries,
    async query(sql) {
      queries.push(sql);
      if (sql.includes("INSERT INTO review_ai_analysis_signals")) {
        return { rows: [] };
      }
      if (sql.includes("SELECT r.business_id")) {
        return {
          rows: [{ business_id: "business-1", verification_level: "verified" }],
        };
      }
      if (sql.includes("SELECT fraud_risk_score")) {
        return { rows: [{ fraud_risk_score: 0.25 }] };
      }
      if (sql.includes("SELECT AVG(rating)")) {
        return {
          rows: [
            {
              average_rating: 4.5,
              review_count: 4,
              positive_count: 3,
              verified_count: 2,
            },
          ],
        };
      }
      if (failTrustUpdate && sql.includes("UPDATE businesses")) {
        throw new Error("Trust database temporarily unavailable");
      }
      return { rows: [] };
    },
  };
}

const analysis = {
  reviewId: "review-1",
  signals: {
    fakeReview: { probability: 0.2 },
    sentiment: { score: 0.8 },
    toxicity: { score: 0 },
  },
  analysis: {
    fraudRisk: { fraudRiskScore: 0.25, riskLevel: "LOW" },
    recommendation: { action: "APPROVE" },
  },
  modelsUsed: ["heuristic"],
  analysisVersion: "test",
  durationMs: 4,
};

async function main() {
  const successfulDb = createDbMock();
  const successfulQueue = new AnalysisQueue();
  successfulQueue.setDbClient(successfulDb);
  await successfulQueue.storeAnalysisResult(analysis);
  assert.ok(
    successfulDb.queries.some((sql) => sql.includes("UPDATE businesses")),
  );
  assert.ok(
    successfulDb.queries.some((sql) =>
      sql.includes("INSERT INTO trust_scores"),
    ),
  );

  const failedDb = createDbMock({ failTrustUpdate: true });
  const failedQueue = new AnalysisQueue();
  failedQueue.setDbClient(failedDb);
  await assert.doesNotReject(() => failedQueue.storeAnalysisResult(analysis));
  assert.ok(
    failedDb.queries.some((sql) =>
      sql.includes("INSERT INTO review_ai_analysis_signals"),
    ),
  );

  console.log("Trust recalculation verification passed");
}

main().catch((error) => {
  console.error("Trust recalculation verification failed:", error);
  process.exitCode = 1;
});
