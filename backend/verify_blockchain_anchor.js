const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  queueReviewHashAnchorSafely,
  isLiveAnchoringConfigured,
} = require("./src/services/blockchainAnchorService");

async function main() {
  delete process.env.BLOCKCHAIN_ANCHORING_ENABLED;
  delete process.env.POLYGON_RPC_URL;
  delete process.env.POLYGON_PRIVATE_KEY;
  delete process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS;

  const queries = [];
  let resolveInsert;
  const insertFinished = new Promise((resolve) => {
    resolveInsert = resolve;
  });
  const result = queueReviewHashAnchorSafely({
    reviewId: "review-1",
    reviewHash: "hash-1",
    businessId: "business-1",
    dbClient: {
      query: async (sql, params) => {
        await new Promise((resolve) => setImmediate(resolve));
        queries.push({ sql, params });
        resolveInsert();
      },
    },
  });

  assert.equal(isLiveAnchoringConfigured(), false);
  assert.equal(result.anchored, false);
  assert.equal(result.status, "deferred");
  assert.match(result.recordId, /^anchor-/);
  assert.equal(queries.length, 0);
  await insertFinished;
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /INSERT INTO blockchain_records/);
  assert.deepEqual(queries[0].params.slice(1, 4), [
    "review_hash_anchor",
    "review-1",
    "hash-1",
  ]);

  const failingServiceResult = queueReviewHashAnchorSafely({
    reviewId: "review-2",
    reviewHash: "hash-2",
    businessId: "business-1",
    dbClient: {
      query: async () => {
        throw new Error("database unavailable");
      },
    },
  });
  assert.equal(failingServiceResult.status, "deferred");

  const companyRoute = fs.readFileSync("./src/routes/company.js", "utf8");
  assert.equal(companyRoute.includes("queueReviewHashAnchor"), true);
  assert.equal(companyRoute.includes('status: "unavailable"'), true);

  console.log("Blockchain anchor verification passed");
}

main().catch((error) => {
  console.error("Blockchain anchor verification failed:", error);
  process.exitCode = 1;
});
