const db = require("./src/db");
const { analysisQueue } = require("./src/services/ml/analysisQueue");
const { getCacheStats } = require("./src/services/ml/modelLoader");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const makeId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function ensureTestRows(database, userId, businessId) {
  const email = `stage2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@trusiq.test`;
  await database.query(
    `INSERT INTO users (id, email, password_hash, roles, full_name, account_status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     ON CONFLICT (id) DO NOTHING`,
    [userId, email, "hashed", JSON.stringify(["customer"]), "Stage2 Tester"],
  );

  await database.query(
    `INSERT INTO businesses (id, business_name, slug, owner_id, category, latitude, longitude, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [
      businessId,
      "Stage2 Business",
      `stage2-${Date.now()}`,
      userId,
      "Retail",
      5.6037,
      -0.1869,
    ],
  );
}

async function runExample(label, reviewText) {
  const database = await db.getDb();
  analysisQueue.setDbClient(database);

  const userId = makeId("stage2_user");
  const businessId = makeId("stage2_biz");
  const reviewId = makeId("stage2_review");

  await ensureTestRows(database, userId, businessId);

  await database.query(
    `INSERT INTO reviews (id, business_id, user_id, rating, review_text, review_hash, verified_visit, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [
      reviewId,
      businessId,
      userId,
      label === "positive" ? 5 : 1,
      reviewText,
      `hash_${Math.random().toString(36).slice(2, 10)}`,
      false,
    ],
  );

  const initialQueue = analysisQueue.getStats();
  analysisQueue.queueReview({
    id: reviewId,
    reviewText,
    userId,
    businessId,
    rating: label === "positive" ? 5 : 1,
    verifiedVisit: false,
  });

  const cacheBefore = getCacheStats();
  console.log(`CASE=${label}`);
  console.log(`INPUT_TEXT=${reviewText}`);
  console.log(
    `MODEL_LOADED_FROM_CACHE_BEFORE=${cacheBefore.modelsLoaded > 0 ? "YES" : "NO"}`,
  );
  console.log(`QUEUE_ENQUEUED=${initialQueue.queueLength + 1}`);

  let resultRow = null;
  let attempts = 0;
  while (attempts < 90) {
    await wait(1000);
    attempts += 1;

    const stats = analysisQueue.getStats();
    const rows = await database.query(
      `SELECT review_id, fake_review_probability, sentiment_score, toxicity_score, similarity_max_score, behavior_risk_score, fraud_risk_score, fraud_risk_level, recommendation_action, signals_json, analysis_duration_ms
       FROM review_ai_analysis_signals WHERE review_id = $1`,
      [reviewId],
    );

    if (rows.rows.length > 0) {
      resultRow = rows.rows[0];
      break;
    }

    if (stats.totalFailed > 0 && attempts > 10) {
      break;
    }
  }

  const cacheAfter = getCacheStats();
  const finalStats = analysisQueue.getStats();

  console.log(
    `MODEL_LOADED_FROM_CACHE_AFTER=${cacheAfter.modelsLoaded > 0 ? "YES" : "NO"}`,
  );
  console.log(`QUEUE_STATUS=${JSON.stringify(finalStats)}`);

  if (resultRow) {
    console.log(`DATABASE_RECORD_CREATED=YES`);
    console.log(`DATABASE_RESULT=${JSON.stringify(resultRow)}`);
  } else {
    console.log(`DATABASE_RECORD_CREATED=NO`);
    const query = await database.query(
      `SELECT * FROM review_ai_analysis_signals WHERE review_id = $1`,
      [reviewId],
    );
    console.log(`DATABASE_QUERY_RESULT=${JSON.stringify(query.rows)}`);
  }

  console.log(
    `ANY_ERRORS=${resultRow ? "NONE" : "Queue/database did not complete in time"}`,
  );
  return { reviewId, resultRow, finalStats };
}

(async () => {
  try {
    const positiveText =
      "This is an excellent business. The staff were friendly and the service was very good.";
    const toxicText = "You are an idiot and this service is terrible!";

    console.log("=== STAGE 2 VERIFICATION START ===");
    const positive = await runExample("positive", positiveText);
    const toxic = await runExample("toxic", toxicText);

    console.log("=== STAGE 2 VERIFICATION COMPLETE ===");
    console.log(`POSITIVE_RESULT=${JSON.stringify(positive.resultRow)}`);
    console.log(`TOXIC_RESULT=${JSON.stringify(toxic.resultRow)}`);
    process.exit(0);
  } catch (error) {
    console.error(
      "STAGE2_ERROR=" + String(error && error.stack ? error.stack : error),
    );
    process.exit(1);
  }
})();
