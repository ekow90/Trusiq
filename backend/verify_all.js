const { spawnSync } = require("node:child_process");
const path = require("node:path");

const checks = [
  ["Platform stats", "verify_platform_stats.js"],
  ["Prisma user lookup", "verify_user_prisma_lookup.js"],
  ["Prisma company reads", "verify_company_prisma_reads.js"],
  ["Prisma review reads", "verify_review_prisma_reads.js"],
  ["Prisma trust score reads", "verify_trust_score_prisma_reads.js"],
  ["AI fallback", "verify_ai_fallback.js"],
  ["Unavailable model loader", "verify_model_loader_unavailable.js"],
  ["Review analysis queue", "verify_review_analysis_queue.js"],
  ["Trust recalculation", "verify_trust_recalculation.js"],
  ["Blockchain anchor", "verify_blockchain_anchor.js"],
];

const environment = {
  ...process.env,
  OPENAI_API_KEY: "",
  ML_FORCE_UNAVAILABLE: "true",
  BLOCKCHAIN_ANCHORING_ENABLED: "false",
};

for (const [label, script] of checks) {
  console.log(`\n=== ${label} (${script}) ===`);
  const result = spawnSync(process.execPath, [path.join(__dirname, script)], {
    cwd: __dirname,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`Verification could not start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Verification failed: ${label}`);
    process.exit(result.status ?? 1);
  }
}

console.log(`\nAll ${checks.length} backend verifications passed.`);
