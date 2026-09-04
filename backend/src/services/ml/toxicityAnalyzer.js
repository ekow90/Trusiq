/**
 * Toxicity Analysis Service
 * Uses the Cardiff NLP RoBERTa hate-speech model for abusive/toxic review detection
 * Returns a 0-1 toxicity score that can be used as part of the fraud risk engine.
 */

const { getTextClassificationPipeline } = require("./modelLoader");

const MODEL_NAME = "Xenova/toxic-bert";

function normalizeLabel(label) {
  return String(label || "")
    .trim()
    .toUpperCase();
}

function assessToxicityFromResult(result) {
  if (!Array.isArray(result) || result.length === 0) {
    return { score: 0, label: "NEUTRAL", confidence: 0 };
  }

  const normalized = result.map((item) => ({
    ...item,
    label: normalizeLabel(item.label),
    score: Number(item.score || 0),
  }));

  const toxicMatch = normalized.find((item) =>
    /OFFENSIVE|HATE|TOXIC|ABUSIVE|HARASS|PROFAN|DEROGATORY|DISRESPECT/i.test(
      item.label,
    ),
  );

  const neutralMatch = normalized.find((item) =>
    /NEUTRAL|SAFE|CLEAN|NON_HATE|NOT_HATE|NOT_OFFENSIVE|NORMAL/i.test(
      item.label,
    ),
  );

  let choice = normalized[0];

  if (toxicMatch) {
    choice = toxicMatch;
  } else if (neutralMatch) {
    choice = neutralMatch;
  }

  let toxicityScore = Number(choice.score || 0);
  const label = choice.label || "UNKNOWN";

  if (
    neutralMatch &&
    choice === neutralMatch &&
    normalized.length > 1 &&
    typeof choice.score === "number"
  ) {
    toxicityScore = Math.max(0, 1 - choice.score);
  }

  if (label.includes("LABEL_1") || label.includes("LABEL_2")) {
    toxicityScore = Math.max(toxicityScore, Number(choice.score || 0));
  }

  if (label.includes("LABEL_0") && !neutralMatch) {
    toxicityScore = Math.max(0, 1 - toxicityScore);
  }

  return {
    score: Number(Math.max(0, Math.min(1, toxicityScore)).toFixed(3)),
    label,
    confidence: Number(Number(choice.score || 0).toFixed(3)),
  };
}

async function analyzeToxicity(reviewText) {
  if (
    !reviewText ||
    typeof reviewText !== "string" ||
    reviewText.trim().length === 0
  ) {
    return {
      score: 0,
      label: "NEUTRAL",
      confidence: 0,
      error: "Invalid review text",
    };
  }

  try {
    const classifier = await getTextClassificationPipeline(MODEL_NAME);
    const truncatedText = reviewText.slice(0, 512);
    const result = await classifier(truncatedText);

    const parsed = assessToxicityFromResult(result);

    return {
      ...parsed,
      model: MODEL_NAME,
      score: parsed.score,
      label: parsed.label || "NEUTRAL",
    };
  } catch (error) {
    console.error("[ToxicityAnalyzer] Error analyzing review:", error.message);
    return {
      score: 0,
      label: "ERROR",
      confidence: 0,
      error: error.message,
    };
  }
}

async function analyzeBatch(reviews) {
  return Promise.all(reviews.map((review) => analyzeToxicity(review)));
}

module.exports = {
  analyzeToxicity,
  analyzeBatch,
  MODEL_NAME,
};
