/**
 * Worker thread for xenova pipeline execution
 * Isolates the xenova library which can crash the main process on Windows
 */

const { parentPort } = require("worker_threads");
const { pipeline, env } = require("@xenova/transformers");
const path = require("path");

const cache = path.resolve(process.cwd(), "ml_models");
env.cacheDir = cache;
env.localModelPath = cache;
env.allowLocalModels = true;
env.allowRemoteModels = true;

let pipelines = new Map();

parentPort.on("message", async (msg) => {
  try {
    const { task, model, text, action } = msg;

    if (action === "load") {
      console.log(`[Worker] Loading ${model}...`);
      if (!pipelines.has(model)) {
        const p = await pipeline(task, model, {
          cache_dir: cache,
          quantized: true,
        });
        pipelines.set(model, p);
      }
      parentPort.postMessage({ success: true, model, action: "loaded" });
    } else if (action === "infer") {
      if (!pipelines.has(model)) {
        const p = await pipeline(task, model, {
          cache_dir: cache,
          quantized: true,
        });
        pipelines.set(model, p);
      }
      const p = pipelines.get(model);
      const result = await p(text);
      parentPort.postMessage({ success: true, model, result });
    }
  } catch (error) {
    console.error(`[Worker] Error:`, error.message);
    parentPort.postMessage({ success: false, error: error.message });
  }
});
