function calculateTrustScore({
  averageRating = 0,
  reviewCount = 0,
  positiveReviewCount = 0,
  fakeReviewRisk = 0,
  governmentVerified = false,
}) {
  const ratingFactor = reviewCount
    ? Math.min(65, (Number(averageRating) / 5) * 65)
    : 0;
  const authenticityFactor = reviewCount
    ? Math.max(0, 15 - (Number(fakeReviewRisk) / 100) * 15)
    : 0;
  const sentimentFactor = reviewCount
    ? Math.min(10, (Number(positiveReviewCount) / reviewCount) * 10)
    : 0;
  const governmentFactor = governmentVerified ? 10 : 0;
  const score = Math.round(
    ratingFactor + authenticityFactor + sentimentFactor + governmentFactor,
  );
  return {
    score: Math.min(100, score),
    factors: {
      reviews: Number(ratingFactor.toFixed(1)),
      reviewAuthenticity: Number(authenticityFactor.toFixed(1)),
      customerSentiment: Number(sentimentFactor.toFixed(1)),
      governmentRegistration: governmentFactor,
    },
  };
}

module.exports = { calculateTrustScore };
