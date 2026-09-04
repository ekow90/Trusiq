const { pipeline, env } = require("@xenova/transformers");
const path = require("path");

const cache = path.resolve(process.cwd(), "ml_models");
env.cacheDir = cache;
env.localModelPath = cache;
env.allowLocalModels = true;
env.allowRemoteModels = true;

(async () => {
  try {
    console.log("TEST_DIRECT_PIPELINE_START");
    console.log("Cache directory:", cache);

    console.log("Loading Xenova/toxic-bert...");
    const classifier = await pipeline(
      "text-classification",
      "Xenova/toxic-bert",
      {
        cache_dir: cache,
        quantized: true,
      },
    );
    console.log("Pipeline loaded successfully");

    console.log("Running inference on positive text...");
    const positiveResult = await classifier(
      "This is an excellent business. The staff were friendly and the service was very good.",
    );
    console.log("Positive result:", JSON.stringify(positiveResult));

    console.log("Running inference on toxic text...");
    const toxicResult = await classifier(
      "You are an idiot and this service is terrible!",
    );
    console.log("Toxic result:", JSON.stringify(toxicResult));

    console.log("TEST_DIRECT_PIPELINE_SUCCESS");
    process.exit(0);
  } catch (error) {
    console.error("TEST_DIRECT_PIPELINE_ERROR:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
})();
