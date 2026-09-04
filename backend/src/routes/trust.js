const express = require("express");
const { upsertTrustScore } = require("../services/trustService");
const { findTrustScoreByCompanyId } = require("../services/trustScoreService");

const router = express.Router();

function normalizeMetrics(metrics = {}) {
  return {
    reviewAuthenticity: Number(metrics.reviewAuthenticity ?? 0),
    verificationLevel: Number(metrics.verificationLevel ?? 0),
    customerSentiment: Number(metrics.customerSentiment ?? 0),
    businessActivity: Number(metrics.businessActivity ?? 0),
  };
}

router.get("/", async (req, res) => {
  const user = req.user || {};
  const roles = user.roles || [];
  const companyId = req.query.companyId || user.companyId || null;

  if (!roles.includes("admin") && !roles.includes("owner")) {
    return res.status(403).json({ error: "Forbidden: insufficient role" });
  }

  if (roles.includes("owner") && !companyId) {
    return res.status(400).json({ error: "Owner companyId is required" });
  }

  if (
    roles.includes("owner") &&
    user.companyId &&
    companyId !== user.companyId
  ) {
    return res
      .status(403)
      .json({ error: "Forbidden: owner does not own this company" });
  }

  try {
    const trustScore = companyId
      ? await findTrustScoreByCompanyId(companyId)
      : null;

    if (!trustScore) {
      const fallback = {
        companyId: companyId || "system",
        score: 0,
        percentile: 0,
        metrics: normalizeMetrics(),
        trajectory: [],
        lastUpdated: null,
        message:
          "No trust data found. Create a company trust record to populate this view.",
      };
      return res.status(200).json(fallback);
    }

    return res.json({
      companyId: trustScore.companyId,
      score: trustScore.score,
      percentile: trustScore.percentile,
      metrics: trustScore.metrics || normalizeMetrics(),
      trajectory: trustScore.trajectory || [],
      lastUpdated: trustScore.lastUpdated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Database error while loading trust score" });
  }
});

router.post("/", async (req, res) => {
  const user = req.user || {};
  const roles = user.roles || [];

  if (!roles.includes("admin") && !roles.includes("owner")) {
    return res.status(403).json({ error: "Forbidden: insufficient role" });
  }

  const { companyId, score, percentile, metrics, trajectory } = req.body || {};
  const targetCompanyId = companyId || user.companyId;

  if (roles.includes("owner") && !targetCompanyId) {
    return res.status(400).json({ error: "Owner companyId is required" });
  }

  if (
    roles.includes("owner") &&
    user.companyId &&
    targetCompanyId !== user.companyId
  ) {
    return res
      .status(403)
      .json({ error: "Forbidden: owner does not own this company" });
  }

  try {
    const data = await upsertTrustScore({
      companyId: targetCompanyId,
      score: score ?? 0,
      percentile: percentile ?? 0,
      metrics: metrics ?? normalizeMetrics(),
      trajectory: trajectory ?? [],
    });

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Could not save trust score" });
  }
});

module.exports = router;
