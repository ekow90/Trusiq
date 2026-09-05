const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  completeLiveAnchor,
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

  const invalidHash = await completeLiveAnchor({
    reviewId: "review-invalid",
    reviewHash: "not-a-bytes32-hash",
    businessId: "business-1",
    recordId: "anchor-invalid",
  });
  assert.equal(invalidHash.status, "deferred");
  assert.equal(invalidHash.reason, "Invalid review hash");

  process.env.BLOCKCHAIN_ANCHORING_ENABLED = "true";
  process.env.POLYGON_RPC_URL = "https://generic.example.invalid";
  process.env.POLYGON_PRIVATE_KEY = "0x" + "11".repeat(32);
  process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS = "0x" + "22".repeat(20);
  process.env.POLYGON_NETWORK = "mainnet";
  const mainnetResult = await completeLiveAnchor({
    reviewId: "review-mainnet",
    reviewHash: "aa".repeat(32),
    businessId: "business-1",
    recordId: "anchor-mainnet",
    contractFactory: () => {
      throw new Error("Mainnet contract must not be created");
    },
  });
  assert.equal(mainnetResult.status, "deferred");
  assert.equal(
    mainnetResult.reason,
    "Only the Polygon Amoy testnet is supported currently",
  );

  delete process.env.POLYGON_NETWORK;
  const missingNetworkResult = await completeLiveAnchor({
    reviewId: "review-missing-network",
    reviewHash: "aa".repeat(32),
    businessId: "business-1",
    recordId: "anchor-missing-network",
    contractFactory: () => {
      throw new Error("Missing network must not create a contract");
    },
  });
  assert.equal(missingNetworkResult.status, "deferred");

  process.env.BLOCKCHAIN_ANCHORING_ENABLED = "true";
  process.env.POLYGON_NETWORK = "amoy";
  process.env.POLYGON_AMOY_RPC_URL = "https://amoy.example.invalid";
  process.env.POLYGON_AMOY_PRIVATE_KEY = "0x" + "11".repeat(32);
  process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS = "0x" + "22".repeat(20);
  const liveQueries = [];
  let resolveLive;
  const liveFinished = new Promise((resolve) => {
    resolveLive = resolve;
  });
  const liveResult = queueReviewHashAnchorSafely({
    reviewId: "review-live-mock",
    reviewHash: "aa".repeat(32),
    businessId: "business-1",
    dbClient: {
      query: async (sql, params) => {
        await new Promise((resolve) => setImmediate(resolve));
        liveQueries.push({ sql, params });
        if (sql.includes("UPDATE blockchain_records")) resolveLive();
      },
    },
    contractFactory: () => ({
      anchorReviewHash: async () => ({
        hash: "0x" + "33".repeat(32),
        wait: async () => ({ blockNumber: 123 }),
      }),
    }),
  });
  assert.equal(liveResult.status, "queued");
  await liveFinished;
  assert.equal(liveQueries.length, 2);
  assert.match(liveQueries[1].sql, /UPDATE blockchain_records/);
  assert.equal(liveQueries[1].params[0], "0x" + "33".repeat(32));
  assert.equal(liveQueries[1].params[1], 123);

  delete process.env.POLYGON_AMOY_RPC_URL;
  delete process.env.POLYGON_AMOY_PRIVATE_KEY;
  const genericAmoyQueries = [];
  let resolveGeneric;
  const genericFinished = new Promise((resolve) => {
    resolveGeneric = resolve;
  });
  const genericResult = queueReviewHashAnchorSafely({
    reviewId: "review-generic-amoy",
    reviewHash: "bb".repeat(32),
    businessId: "business-1",
    dbClient: {
      query: async (sql, params) => {
        genericAmoyQueries.push({ sql, params });
        if (sql.includes("UPDATE blockchain_records")) resolveGeneric();
      },
    },
    contractFactory: () => ({
      anchorReviewHash: async () => ({
        hash: "0x" + "44".repeat(32),
        wait: async () => ({ blockNumber: 456 }),
      }),
    }),
  });
  assert.equal(genericResult.status, "queued");
  await genericFinished;
  assert.equal(genericAmoyQueries[1].params[0], "0x" + "44".repeat(32));
  assert.equal(genericAmoyQueries[1].params[1], 456);

  delete process.env.BLOCKCHAIN_ANCHORING_ENABLED;
  delete process.env.POLYGON_NETWORK;
  delete process.env.POLYGON_AMOY_RPC_URL;
  delete process.env.POLYGON_AMOY_PRIVATE_KEY;
  delete process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS;
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
