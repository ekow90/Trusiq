const test = require("node:test");
const assert = require("node:assert/strict");

const { getDb, initDb } = require("../src/db");

const expectedTables = [
  "users",
  "businesses",
  "reviews",
  "review_media",
  "voice_reviews",
  "qr_codes",
  "verified_visits",
  "trust_scores",
  "verification_requests",
  "business_documents",
  "ai_analysis",
  "blockchain_records",
  "review_reports",
  "business_responses",
  "notifications",
];

test("initDb creates the full Trusiq schema in PostgreSQL", async () => {
  await initDb();
  const db = await getDb();
  const result = await db.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name NOT LIKE 'pg_%'
     ORDER BY table_name`,
  );

  const tableNames = result.rows.map((row) => row.table_name);

  for (const tableName of expectedTables) {
    assert.ok(
      tableNames.includes(tableName),
      `Expected table ${tableName} to exist in the schema`,
    );
  }
});
