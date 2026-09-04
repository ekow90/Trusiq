/**
 * End-to-End Test: ML Pipeline Review Analysis
 *
 * This test:
 * 1. Creates a test user and business (or uses existing)
 * 2. Submits a test review via the API
 * 3. Monitors queue processing
 * 4. Verifies analysis results in database
 */

const db = require("./src/db");
const bcrypt = require("bcryptjs");

// Helper to make IDs
const makeId = (prefix) =>
  `${prefix}_${Math.random().toString(36).substring(2, 9)}`;

async function testMLPipeline() {
  console.log("\n=== TRUSIQ ML Pipeline End-to-End Test ===\n");

  try {
    const database = await db.getDb();
    console.log("✓ Database connected");

    // Step 1: Create test user
    const userId = makeId("user");
    const userEmail = `test-${Date.now()}@trusiq.test`;
    const hashedPassword = await bcrypt.hash("test123", 10);

    await database.query(
      `INSERT INTO users (id, email, password_hash, roles, full_name, account_status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT DO NOTHING`,
      [
        userId,
        userEmail,
        hashedPassword,
        JSON.stringify(["customer"]),
        "Test Customer",
      ],
    );
    console.log(`✓ Test user created/verified: ${userEmail}`);

    // Step 2: Create test business
    const businessId = makeId("biz");
    const businessSlug = `test-biz-${Date.now()}`;

    await database.query(
      `INSERT INTO businesses (id, business_name, slug, owner_id, category, latitude, longitude, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT DO NOTHING`,
      [
        businessId,
        "Test Business",
        businessSlug,
        userId,
        "Retail",
        5.6037,
        -0.1869,
      ],
    );
    console.log(`✓ Test business created: ${businessSlug}`);

    // Step 3: Submit test reviews with different characteristics
    const testReviews = [
      {
        text: "This is a genuine positive review. The service was excellent, staff was friendly, and I had a wonderful experience. I would definitely recommend this business to my friends and family.",
        rating: 5,
        label: "Genuine Positive",
      },
      {
        text: "Unfortunately, the service was poor. The staff was unhelpful, and the quality of products was below expectations. I am disappointed.",
        rating: 2,
        label: "Negative Review",
      },
      {
        text: "Best business ever! Amazing! Love it! Best business ever! Amazing! Love it! Best business ever! Amazing! Love it!",
        rating: 5,
        label: "Repetitive/Suspicious",
      },
    ];

    const reviewIds = [];

    for (const testReview of testReviews) {
      const reviewId = makeId("rev");
      const reviewHash = `hash_${Math.random().toString(36).substring(2, 9)}`;

      await database.query(
        `INSERT INTO reviews (
          id, business_id, user_id, rating, review_text, review_hash, 
          verified_visit, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          reviewId,
          businessId,
          userId,
          testReview.rating,
          testReview.text,
          reviewHash,
          false,
        ],
      );

      reviewIds.push({ id: reviewId, label: testReview.label });
      console.log(`✓ Submitted review: "${testReview.label}"`);
    }

    // Step 4: Queue reviews for analysis
    const { analysisQueue } = require("./src/services/ml/analysisQueue");
    analysisQueue.setDbClient(database);

    for (const review of reviewIds) {
      const reviewData = testReviews[reviewIds.indexOf(review)];
      analysisQueue.queueReview({
        id: review.id,
        reviewText: reviewData.text,
        userId: userId,
        businessId: businessId,
        rating: reviewData.rating,
        verifiedVisit: false,
      });
    }
    console.log(`\n✓ Queued ${reviewIds.length} reviews for ML analysis`);

    // Step 5: Wait for queue to process
    console.log("\nWaiting for ML analysis to complete (up to 120 seconds)...");
    let processed = false;
    let attempts = 0;
    const maxAttempts = 120;

    while (!processed && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;

      const queueStats = analysisQueue.getStats();
      process.stdout.write(
        `\r  Processing... (${attempts}s) Queue: ${queueStats.queueLength} pending, ${queueStats.totalProcessed} processed`,
      );

      if (queueStats.queueLength === 0 && queueStats.totalProcessed > 0) {
        processed = true;
      }
    }

    console.log("\n");

    // Step 6: Verify results in database
    console.log("=== ML Analysis Results ===\n");

    for (const review of reviewIds) {
      const results = await database.query(
        `SELECT 
          review_id,
          fake_review_probability,
          sentiment_score,
          toxicity_score,
          similarity_max_score,
          behavior_risk_score,
          fraud_risk_score,
          fraud_risk_level,
          recommendation_action,
          signals_json,
          analysis_duration_ms
        FROM review_ai_analysis_signals 
        WHERE review_id = $1`,
        [review.id],
      );

      if (results.rows.length === 0) {
        console.log(`❌ ${review.label}: No analysis results found`);
      } else {
        const analysis = results.rows[0];
        console.log(`✓ ${review.label}:`);
        console.log(
          `  - Fake Review Probability: ${(analysis.fake_review_probability * 100).toFixed(1)}%`,
        );
        console.log(
          `  - Sentiment Score: ${(analysis.sentiment_score * 100).toFixed(1)}%`,
        );
        console.log(
          `  - Toxicity Score: ${(analysis.toxicity_score * 100).toFixed(1)}%`,
        );
        console.log(
          `  - Similarity Score: ${(analysis.similarity_max_score * 100).toFixed(1)}%`,
        );
        console.log(
          `  - Behavior Risk: ${(analysis.behavior_risk_score * 100).toFixed(1)}%`,
        );
        console.log(
          `  - FRAUD RISK SCORE: ${(analysis.fraud_risk_score * 100).toFixed(1)}% [${analysis.fraud_risk_level}]`,
        );
        console.log(`  - Recommendation: ${analysis.recommendation_action}`);
        console.log(`  - Analysis Time: ${analysis.analysis_duration_ms}ms\n`);
      }
    }

    // Step 7: Check queue final status
    const finalStats = analysisQueue.getStats();
    console.log("=== Final Queue Status ===");
    console.log(`Total Processed: ${finalStats.totalProcessed}`);
    console.log(`Total Failed: ${finalStats.totalFailed}`);
    console.log(`Pending: ${finalStats.queueLength}`);
    console.log(`Queue Active: ${finalStats.isProcessing}`);

    console.log("\n✓ ML Pipeline Test Complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testMLPipeline();
