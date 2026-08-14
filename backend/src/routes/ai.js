const express = require("express");
const { analyzeReviews, detectFakeReviews } = require("../services/aiService");

const router = express.Router();

router.post("/review-summary", async (req, res) => {
  try {
    const { reviews = [] } = req.body || {};
    const result = await analyzeReviews(reviews);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Unable to generate review summary" });
  }
});

router.post("/fake-review-detector", async (req, res) => {
  try {
    const { reviews = [] } = req.body || {};
    const result = await detectFakeReviews(reviews);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Unable to detect fake reviews" });
  }
});

module.exports = router;
