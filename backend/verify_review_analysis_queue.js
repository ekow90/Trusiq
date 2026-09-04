const assert = require("node:assert/strict");
const fs = require("node:fs");
const { queueReviewSafely } = require("./src/services/ml/analysisQueue");

async function simulateReviewSubmission(queue) {
  const insertedReview = {
    id: "review-verification",
    businessId: "business-1",
  };
  const analysis = queueReviewSafely(queue, {
    id: insertedReview.id,
    reviewText: "A review that was inserted successfully.",
    userId: "user-1",
    businessId: insertedReview.businessId,
    rating: 5,
    verifiedVisit: false,
  });

  return {
    statusCode: 201,
    body: {
      reviewId: insertedReview.id,
      analysisStatus: analysis.status,
    },
  };
}

async function main() {
  const companyRoute = fs.readFileSync("./src/routes/company.js", "utf8");
  const submissionStart = companyRoute.indexOf('router.post("/:slug/reviews"');
  assert.notEqual(submissionStart, -1);
  const submissionRoute = companyRoute.slice(submissionStart);
  assert.equal(submissionRoute.includes("await detectFakeReviews"), false);
  assert.equal(submissionRoute.includes("fakeReviewRisk: 0"), true);

  const successfulQueue = {
    queueReview: (review) => ({ id: `job-${review.id}` }),
  };
  const successfulResponse = await simulateReviewSubmission(successfulQueue);
  assert.equal(successfulResponse.statusCode, 201);
  assert.equal(successfulResponse.body.analysisStatus, "queued");

  const failedQueue = {
    queueReview: () => {
      throw new Error("Queue unavailable");
    },
  };
  const failedResponse = await simulateReviewSubmission(failedQueue);
  assert.equal(failedResponse.statusCode, 201);
  assert.equal(failedResponse.body.analysisStatus, "unavailable");

  console.log("Review analysis queue verification passed");
}

main().catch((error) => {
  console.error("Review analysis queue verification failed:", error);
  process.exitCode = 1;
});
