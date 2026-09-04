/**
 * ML Model Loader Service
 * Runs inference in child processes to avoid xenova crashes on Windows
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const cacheDir = path.resolve(
  process.env.ML_CACHE_DIR || path.join(__dirname, "../../ml_models"),
);

fs.mkdirSync(cacheDir, { recursive: true });

const inferenceCache = new Map();
const unavailableModels = new Map();
const MODEL_TIMEOUT_MS = Number(process.env.ML_MODEL_TIMEOUT_MS || 120000);

/**
 * Run xenova inference in a child process
 */
function runXenovaInference(task, model, text) {
  return new Promise((resolve, reject) => {
    if (process.env.ML_FORCE_UNAVAILABLE === "true") {
      reject(new Error("Local ML models are disabled"));
      return;
    }

    if (unavailableModels.has(model)) {
      reject(new Error(unavailableModels.get(model)));
      return;
    }

    const script = `
const { pipeline, env } = require("@xenova/transformers");
const cache = ${JSON.stringify(cacheDir)};
env.cacheDir = cache;
env.localModelPath = cache;
env.allowLocalModels = true;
env.allowRemoteModels = true;

(async () => {
  try {
    const p = await pipeline(${JSON.stringify(task)}, ${JSON.stringify(model)}, {
      cache_dir: cache,
      quantized: true,
    });
    const result = await p(${JSON.stringify(text)});
    console.log(JSON.stringify({ success: true, result }));
    process.exit(0);
  } catch (e) {
    console.log(JSON.stringify({ success: false, error: e.message }));
    process.exit(1);
  }
})();
`;

    const child = spawn("node", ["-e", script], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      const message = `Model inference timed out after ${MODEL_TIMEOUT_MS}ms`;
      unavailableModels.set(model, message);
      reject(new Error(message));
    }, MODEL_TIMEOUT_MS);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      if (code === 0 && stdout) {
        try {
          const response = JSON.parse(stdout);
          if (response.success) {
            resolve(response.result);
          } else {
            unavailableModels.set(model, response.error || "Inference failed");
            reject(new Error(response.error || "Inference failed"));
          }
        } catch (e) {
          unavailableModels.set(model, "Failed to parse model response");
          reject(new Error(`Failed to parse response: ${stdout}`));
        }
      } else {
        const message = `Process exited with code ${code}: ${stderr.slice(0, 200)}`;
        unavailableModels.set(model, message);
        console.warn(`[ML] ${message}`);
        reject(new Error(message));
      }
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      unavailableModels.set(model, err.message);
      reject(new Error(`Failed to spawn process: ${err.message}`));
    });
  });
}

/**
 * Wrapper for text classification pipeline
 */
class TextClassificationPipeline {
  constructor(model) {
    this.model = model;
  }

  async __call__(text) {
    const cacheKey = `text-classification:${this.model}:${text}`;
    if (inferenceCache.has(cacheKey)) {
      return inferenceCache.get(cacheKey);
    }

    const result = await runXenovaInference(
      "text-classification",
      this.model,
      text,
    );
    inferenceCache.set(cacheKey, result);
    return result;
  }
}

/**
 * Get or create pipeline for text classification
 */
async function getTextClassificationPipeline(model) {
  if (
    unavailableModels.has(model) ||
    process.env.ML_FORCE_UNAVAILABLE === "true"
  ) {
    return async () => [];
  }
  console.log(`[ML] Loading model: ${model} for task: text-classification`);
  // Return a directly callable async function
  return async (text) => {
    const cacheKey = `text-classification:${model}:${text}`;
    if (inferenceCache.has(cacheKey)) {
      return inferenceCache.get(cacheKey);
    }

    const result = await runXenovaInference("text-classification", model, text);
    inferenceCache.set(cacheKey, result);
    return result;
  };
}

/**
 * Get or create pipeline for feature extraction
 */
async function getFeatureExtractionPipeline(model) {
  if (
    unavailableModels.has(model) ||
    process.env.ML_FORCE_UNAVAILABLE === "true"
  ) {
    return { __call__: async () => [] };
  }
  console.log(`[ML] Loading model: ${model} for task: feature-extraction`);
  return {
    __call__: async (text) =>
      runXenovaInference("feature-extraction", model, text),
  };
}

/**
 * Get or create pipeline for sentiment analysis
 */
async function getSentimentPipeline(model) {
  if (
    unavailableModels.has(model) ||
    process.env.ML_FORCE_UNAVAILABLE === "true"
  ) {
    return { __call__: async () => [] };
  }
  console.log(`[ML] Loading model: ${model} for task: sentiment-analysis`);
  return {
    __call__: async (text) =>
      runXenovaInference("sentiment-analysis", model, text),
  };
}

/**
 * Clear inference cache
 */
function clearModelCache() {
  inferenceCache.clear();
  unavailableModels.clear();
  console.log("[ML] Inference cache cleared");
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    cacheSize: inferenceCache.size,
    cacheEntries: Array.from(inferenceCache.keys()).slice(0, 10),
    unavailableModels: Array.from(unavailableModels.keys()),
  };
}

module.exports = {
  getTextClassificationPipeline,
  getFeatureExtractionPipeline,
  getSentimentPipeline,
  clearModelCache,
  getCacheStats,
  runXenovaInference,
};
