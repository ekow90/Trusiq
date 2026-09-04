const assert = require("node:assert/strict");

process.env.OPENAI_API_KEY = "";
const {
  analyzeReviews,
  detectFakeReviews,
} = require("./src/services/aiService");

async function main() {
  const summary = await analyzeReviews(["The service was great and reliable."]);
  assert.equal(summary.provider, "heuristic");
  assert.equal(summary.status, "fallback");
  assert.equal(typeof summary.summary, "string");
  assert.equal(typeof summary.sentiment, "string");
  assert.ok(Array.isArray(summary.highlights));

  const fakeReview = await detectFakeReviews(["Great!"]);
  assert.equal(fakeReview.provider, "heuristic");
  assert.equal(fakeReview.status, "fallback");
  assert.equal(typeof fakeReview.riskScore, "number");
  assert.ok(Array.isArray(fakeReview.flags));

  console.log("AI fallback verification passed");
}

main().catch((error) => {
  console.error("AI fallback verification failed:", error);
  process.exitCode = 1;
});
