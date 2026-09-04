const assert = require("node:assert/strict");

process.env.ML_FORCE_UNAVAILABLE = "true";
const {
  getTextClassificationPipeline,
  getCacheStats,
} = require("./src/services/ml/modelLoader");

async function main() {
  const classifier = await getTextClassificationPipeline("offline-test-model");
  const result = await classifier("No model download should occur.");

  assert.deepEqual(result, []);
  assert.deepEqual(getCacheStats().unavailableModels, []);

  console.log("Model loader unavailable verification passed");
}

main().catch((error) => {
  console.error("Model loader unavailable verification failed:", error);
  process.exitCode = 1;
});
