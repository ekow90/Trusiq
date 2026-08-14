const test = require("node:test");
const assert = require("node:assert/strict");
const {
  analyzeReviews,
  detectFakeReviews,
} = require("../src/services/aiService");

test("analyzeReviews returns a summary, sentiment, and highlights for review text", async () => {
  const result = await analyzeReviews([
    "Great service and very professional staff.",
    "The product arrived late and support was slow.",
  ]);

  assert.ok(result.summary.length > 0);
  assert.ok(["positive", "mixed", "negative"].includes(result.sentiment));
  assert.ok(Array.isArray(result.highlights));
});

test("detectFakeReviews returns a risk score and flags", async () => {
  const result = await detectFakeReviews([
    "Excellent! Best experience ever! 5 stars! Amazing! Great!!!",
    "This business is fantastic and perfect in every way. Loved it.",
  ]);

  assert.ok(typeof result.riskScore === "number");
  assert.ok(result.riskScore >= 0 && result.riskScore <= 100);
  assert.ok(Array.isArray(result.flags));
});
