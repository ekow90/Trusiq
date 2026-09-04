const crypto = require("node:crypto");

function makeRecordId() {
  return `anchor-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function isLiveAnchoringConfigured() {
  return (
    process.env.BLOCKCHAIN_ANCHORING_ENABLED === "true" &&
    Boolean(process.env.POLYGON_RPC_URL) &&
    Boolean(process.env.POLYGON_PRIVATE_KEY) &&
    Boolean(process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS)
  );
}

function validateAnchorInput({ reviewId, reviewHash, businessId }) {
  if (!reviewId || !reviewHash || !businessId) {
    throw new Error(
      "Review anchoring requires reviewId, reviewHash, and businessId",
    );
  }
}

async function storeReviewHashAnchor({
  reviewId,
  reviewHash,
  businessId,
  recordId,
  dbClient,
}) {
  if (dbClient) {
    await dbClient.query(
      `INSERT INTO blockchain_records (
         id, record_type, reference_id, hash_value, transaction_hash, block_number, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [recordId, "review_hash_anchor", reviewId, reviewHash, null, null],
    );
  }
}

function anchorMetadata(recordId) {
  return {
    anchored: false,
    status: "deferred",
    recordId,
    mode: "local-intent",
    reason: isLiveAnchoringConfigured()
      ? "Live contract anchoring is not enabled in this service yet"
      : "Blockchain anchoring is not configured for local development",
  };
}

async function queueReviewHashAnchor({
  reviewId,
  reviewHash,
  businessId,
  dbClient,
}) {
  validateAnchorInput({ reviewId, reviewHash, businessId });
  const recordId = makeRecordId();
  await storeReviewHashAnchor({
    reviewId,
    reviewHash,
    businessId,
    recordId,
    dbClient,
  });
  return anchorMetadata(recordId);
}

function queueReviewHashAnchorSafely({
  reviewId,
  reviewHash,
  businessId,
  dbClient,
}) {
  validateAnchorInput({ reviewId, reviewHash, businessId });
  const recordId = makeRecordId();
  void storeReviewHashAnchor({
    reviewId,
    reviewHash,
    businessId,
    recordId,
    dbClient,
  }).catch((error) => {
    console.warn(
      `[BlockchainAnchor] Background anchor intent failed for ${reviewId}: ${error.message}`,
    );
  });

  return anchorMetadata(recordId);
}

module.exports = {
  isLiveAnchoringConfigured,
  queueReviewHashAnchor,
  queueReviewHashAnchorSafely,
};
