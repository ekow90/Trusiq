const crypto = require("node:crypto");
const { Contract, JsonRpcProvider, Wallet, isHexString } = require("ethers");

const REVIEW_ANCHOR_ABI = [
  "function anchorReviewHash(string reviewId, bytes32 reviewHash, string businessId)",
];
function makeRecordId() {
  return `anchor-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}
function getLiveConfig() {
  return {
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || process.env.POLYGON_RPC_URL,
    privateKey:
      process.env.POLYGON_AMOY_PRIVATE_KEY || process.env.POLYGON_PRIVATE_KEY,
    contractAddress: process.env.REVIEW_ANCHOR_CONTRACT_ADDRESS,
  };
}

function isLiveAnchoringConfigured() {
  const network = String(process.env.POLYGON_NETWORK || "").toLowerCase();
  const config = getLiveConfig();
  return (
    network === "amoy" &&
    process.env.BLOCKCHAIN_ANCHORING_ENABLED === "true" &&
    Boolean(config.rpcUrl) &&
    Boolean(config.privateKey) &&
    Boolean(config.contractAddress)
  );
}

function normalizeReviewHash(reviewHash) {
  const value = String(reviewHash || "").trim();
  if (/^[0-9a-fA-F]{64}$/.test(value)) return `0x${value}`;
  if (isHexString(value, 32)) return value;
  return null;
}
function validateAnchorInput({ reviewId, reviewHash, businessId }) {
  if (!reviewId || !reviewHash || !businessId) {
    throw new Error(
      "Review anchoring requires reviewId, reviewHash, and businessId",
    );
  }
}

function createAnchorContract(config = getLiveConfig()) {
  const provider = new JsonRpcProvider(config.rpcUrl, 80002);
  const signer = new Wallet(config.privateKey, provider);
  return new Contract(config.contractAddress, REVIEW_ANCHOR_ABI, signer);
}

function deferredMetadata(recordId, reason) {
  const network = String(process.env.POLYGON_NETWORK || "").toLowerCase();
  const deferredReason =
    network && network !== "amoy"
      ? "Only the Polygon Amoy testnet is supported currently"
      : "Blockchain anchoring is not configured for local development";

  return {
    anchored: false,
    status: "deferred",
    recordId,
    mode: "local-intent",
    reason: reason || deferredReason,
  };
}

async function completeLiveAnchor({
  reviewId,
  reviewHash,
  businessId,
  recordId,
  dbClient,
  contractFactory = createAnchorContract,
}) {
  const reviewHashBytes32 = normalizeReviewHash(reviewHash);
  if (!reviewHashBytes32) {
    return deferredMetadata(recordId, "Invalid review hash");
  }
  if (!isLiveAnchoringConfigured()) {
    return deferredMetadata(recordId);
  }
  const contract = contractFactory();
  const transaction = await contract.anchorReviewHash(
    reviewId,
    reviewHashBytes32,
    businessId,
  );
  const receipt = await transaction.wait();
  const transactionHash = transaction.hash;
  const blockNumber = receipt?.blockNumber ?? null;
  if (dbClient) {
    await dbClient.query(
      `UPDATE blockchain_records SET transaction_hash = $1, block_number = $2 WHERE id = $3`,
      [transactionHash, blockNumber, recordId],
    );
  }
  return {
    anchored: true,
    status: "anchored",
    mode: "polygon-amoy",
    recordId,
    transactionHash,
    blockNumber,
  };
}

async function storeReviewHashAnchor({
  reviewId,
  reviewHash,
  businessId,
  recordId,
  dbClient,
  contractFactory,
}) {
  if (dbClient) {
    await dbClient.query(
      `INSERT INTO blockchain_records (
         id, record_type, reference_id, hash_value, transaction_hash, block_number, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [recordId, "review_hash_anchor", reviewId, reviewHash, null, null],
    );
  }
  return completeLiveAnchor({
    reviewId,
    reviewHash,
    businessId,
    recordId,
    dbClient,
    contractFactory,
  });
}

async function queueReviewHashAnchor({
  reviewId,
  reviewHash,
  businessId,
  dbClient,
  contractFactory,
}) {
  validateAnchorInput({ reviewId, reviewHash, businessId });
  const recordId = makeRecordId();
  const liveResult = await storeReviewHashAnchor({
    reviewId,
    reviewHash,
    businessId,
    recordId,
    dbClient,
    contractFactory,
  });
  return liveResult;
}

function queueReviewHashAnchorSafely({
  reviewId,
  reviewHash,
  businessId,
  dbClient,
  contractFactory,
}) {
  validateAnchorInput({ reviewId, reviewHash, businessId });
  const recordId = makeRecordId();
  void storeReviewHashAnchor({
    reviewId,
    reviewHash,
    businessId,
    recordId,
    dbClient,
    contractFactory,
  }).catch((error) => {
    console.warn(
      `[BlockchainAnchor] Background anchor intent failed for ${reviewId}: ${error.message}`,
    );
  });

  if (!normalizeReviewHash(reviewHash)) {
    return deferredMetadata(recordId, "Invalid review hash");
  }

  return isLiveAnchoringConfigured()
    ? {
        anchored: false,
        status: "queued",
        recordId,
        mode: "polygon-amoy",
        reason: "Polygon Amoy anchoring queued in the background",
      }
    : deferredMetadata(recordId);
}

module.exports = {
  REVIEW_ANCHOR_ABI,
  completeLiveAnchor,
  isLiveAnchoringConfigured,
  normalizeReviewHash,
  queueReviewHashAnchor,
  queueReviewHashAnchorSafely,
};
