const { analyzeToxicity } = require("./src/services/ml/toxicityAnalyzer");

(async () => {
  try {
    const positive =
      "This is an excellent business. The staff were friendly and the service was very good.";
    const toxic = "You are an idiot and this service is terrible!";

    const positiveResult = await analyzeToxicity(positive);
    const toxicResult = await analyzeToxicity(toxic);

    console.log("POSITIVE_RESULT=" + JSON.stringify(positiveResult));
    console.log("TOXIC_RESULT=" + JSON.stringify(toxicResult));
    process.exit(0);
  } catch (error) {
    console.error(
      "TOXICITY_ERROR=" + String(error && error.stack ? error.stack : error),
    );
    process.exit(1);
  }
})();
