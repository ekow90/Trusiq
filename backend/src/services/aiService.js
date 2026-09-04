const { default: OpenAI } = require("openai");

const openaiApiKey = process.env.OPENAI_API_KEY || "";
const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

function heuristicSummary(reviews) {
  const text = reviews.filter(Boolean).join(" ");
  const positives = [
    "great",
    "amazing",
    "excellent",
    "love",
    "fast",
    "professional",
    "helpful",
    "reliable",
  ];
  const negatives = [
    "late",
    "slow",
    "bad",
    "poor",
    "issue",
    "problem",
    "delay",
    "frustrating",
  ];

  const total = reviews.length;
  const positiveHits = positives.filter((word) =>
    text.toLowerCase().includes(word),
  ).length;
  const negativeHits = negatives.filter((word) =>
    text.toLowerCase().includes(word),
  ).length;

  let sentiment = "mixed";
  if (positiveHits > negativeHits) sentiment = "positive";
  if (negativeHits > positiveHits) sentiment = "negative";

  const highlights = [
    positiveHits > 0
      ? "Strong praise for service quality and responsiveness."
      : "No clear positive signals detected in the review set.",
    negativeHits > 0
      ? "Some complaints mention delays or service friction."
      : "No major complaints surfaced in the current review set.",
  ];

  const summary = `Based on ${total} review${total === 1 ? "" : "s"}, customer sentiment trends ${sentiment}. The overall experience appears ${sentiment === "positive" ? "strong and reliable" : sentiment === "negative" ? "concerning and inconsistent" : "mixed but manageable"} with clear signals from recent customer feedback.`;

  return { summary, sentiment, highlights };
}

function heuristicFakeReviewRisk(reviews) {
  const items = reviews.filter(Boolean);
  const riskSignals = [];
  let score = 0;

  items.forEach((review) => {
    const text = review.toLowerCase();
    const repeatedPhrases = (
      text.match(
        /(amazing|excellent|great|love|perfect|best|fantastic|incredible|wow)/g,
      ) || []
    ).length;
    const exclamationMarks = (text.match(/!/g) || []).length;
    const excessiveCaps = /[A-Z]{4,}/.test(review);

    if (repeatedPhrases >= 2 || exclamationMarks >= 2 || excessiveCaps) {
      riskSignals.push(
        "Excessive promotional language or repetitive positive phrasing.",
      );
      score += 35;
    }

    if (
      text.length < 40 &&
      (text.includes("great") ||
        text.includes("love") ||
        text.includes("amazing"))
    ) {
      riskSignals.push("Short, generic review with strong positive wording.");
      score += 25;
    }

    if (
      (text.match(/\b(the|this|very|really|so)\b/g) || []).length > 15 &&
      text.split(" ").length < 30
    ) {
      riskSignals.push("Review reads as templated or low-detail content.");
      score += 20;
    }
  });

  const uniqueFlags = [...new Set(riskSignals)];
  const normalized = Math.min(
    100,
    Math.max(0, score / Math.max(1, items.length)),
  );

  return {
    riskScore: Number(normalized.toFixed(1)),
    flags: uniqueFlags.length
      ? uniqueFlags
      : ["No obvious fake-review signals detected."],
  };
}

async function callOpenAiFallback(payload) {
  if (!client) {
    return { ...payload, provider: "heuristic", status: "fallback" };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a trust-analysis assistant. Return valid JSON with summary, sentiment, highlights, riskScore, and flags.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content)
      return { ...payload, provider: "heuristic", status: "fallback" };

    return { ...JSON.parse(content), provider: "openai", status: "complete" };
  } catch (error) {
    return { ...payload, provider: "heuristic", status: "fallback" };
  }
}

async function analyzeReviews(reviews = []) {
  const stableReviews = Array.isArray(reviews) ? reviews.filter(Boolean) : [];
  if (!stableReviews.length) {
    return {
      summary:
        "Not enough review data yet. AI analysis will appear after customers submit reviews.",
      sentiment: "not_available",
      highlights: [],
      provider: "none",
      status: "fallback",
    };
  }
  const heuristic = heuristicSummary(stableReviews);
  const fallback = await callOpenAiFallback({
    reviews: stableReviews,
    summary: heuristic.summary,
    sentiment: heuristic.sentiment,
    highlights: heuristic.highlights,
  });

  return {
    summary: fallback.summary || heuristic.summary,
    sentiment: fallback.sentiment || heuristic.sentiment,
    highlights:
      Array.isArray(fallback.highlights) && fallback.highlights.length
        ? fallback.highlights
        : heuristic.highlights,
    provider: fallback.provider || "heuristic",
    status: fallback.status || "fallback",
  };
}

async function detectFakeReviews(reviews = []) {
  const stableReviews = Array.isArray(reviews) ? reviews.filter(Boolean) : [];
  const heuristic = heuristicFakeReviewRisk(stableReviews);
  const fallback = await callOpenAiFallback({
    reviews: stableReviews,
    riskScore: heuristic.riskScore,
    flags: heuristic.flags,
  });

  return {
    riskScore: Number(fallback.riskScore ?? heuristic.riskScore),
    flags:
      Array.isArray(fallback.flags) && fallback.flags.length
        ? fallback.flags
        : heuristic.flags,
    provider: fallback.provider || "heuristic",
    status: fallback.status || "fallback",
  };
}

async function analyzeBusinessHealth(reviews = []) {
  const texts = Array.isArray(reviews)
    ? reviews.filter(Boolean).map(String)
    : [];
  const corpus = texts.join(" ").toLowerCase();
  const complaintTerms = [
    "slow",
    "wait",
    "late",
    "delay",
    "expensive",
    "poor",
    "rude",
    "issue",
    "problem",
  ];
  const complaintCount = complaintTerms.reduce(
    (count, term) =>
      count + (corpus.match(new RegExp(`\\b${term}\\w*`, "g")) || []).length,
    0,
  );
  if (texts.length > 0 && texts.length < 3) {
    return {
      status: "Not enough data",
      problem: "Not enough review data yet.",
      reason: "The AI needs at least 3 reviews to identify a reliable pattern.",
      recommendation:
        "Invite more customers to leave honest, specific feedback.",
      expectedBenefit:
        "More feedback will make future recommendations more useful.",
    };
  }
  if (!texts.length) {
    return {
      status: "Not enough data",
      problem: "Not enough review data yet.",
      reason: "The business has no review history to identify a pattern.",
      recommendation:
        "Invite customers to leave honest reviews after real visits.",
      expectedBenefit:
        "More feedback will make future recommendations more reliable.",
    };
  }
  if (complaintCount > Math.max(1, texts.length / 2)) {
    return {
      status: "Needs Attention",
      problem: "Customers are repeatedly mentioning service problems.",
      reason:
        "Words about delays, waiting, or service issues appear across the review set.",
      recommendation:
        "Review the busiest service period, track response time, and assign extra help when demand peaks.",
      expectedBenefit:
        "Shorter waits and more consistent service can improve satisfaction and future ratings.",
    };
  }
  return {
    status: "Good",
    problem: "Customers are not showing a strong repeated complaint pattern.",
    reason:
      "Recent reviews contain more stable feedback than recurring negative themes.",
    recommendation:
      "Keep the strongest parts of the experience consistent and ask satisfied customers for specific feedback.",
    expectedBenefit:
      "Consistent service and detailed feedback can protect trust as the business grows.",
  };
}

module.exports = {
  analyzeReviews,
  detectFakeReviews,
  analyzeBusinessHealth,
  heuristicSummary,
  heuristicFakeReviewRisk,
};
