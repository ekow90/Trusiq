/**
 * Analysis Job Queue Service
 * Simple in-memory queue for async review analysis
 * Stage 1: Basic queue (later upgrade to Bull + Redis)
 */

const { analyzeReview } = require("./reviewAnalyzer");
const {
  recalculateBusinessTrustScoreAfterAnalysis,
} = require("../trustRecalculationService");

class AnalysisQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.processed = 0;
    this.failed = 0;
    this.dbClient = null;
  }

  /**
   * Initialize queue with database client
   */
  setDbClient(dbClient) {
    this.dbClient = dbClient;
  }

  /**
   * Add a review to the analysis queue
   */
  queueReview(reviewData) {
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      reviewId: reviewData.id,
      reviewData,
      status: "queued",
      createdAt: Date.now(),
      completedAt: null,
      result: null,
      error: null,
    };

    this.queue.push(job);
    console.log(`[AnalysisQueue] Queued review analysis: ${reviewData.id}`);

    // Start processing if not already running
    if (!this.processing) {
      void this.processQueue().catch((error) => {
        this.processing = false;
        console.warn(
          `[AnalysisQueue] Background processing unavailable: ${error.message}`,
        );
      });
    }

    return job;
  }

  /**
   * Process queued reviews
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(
      `[AnalysisQueue] Starting queue processing (${this.queue.length} jobs)`,
    );

    while (this.queue.length > 0) {
      const job = this.queue.shift();

      try {
        job.status = "processing";

        // Run analysis
        const analysis = await analyzeReview(job.reviewData, this.dbClient);

        job.status = "completed";
        job.result = analysis;
        job.completedAt = Date.now();
        this.processed++;

        // Store result in database
        if (this.dbClient) {
          try {
            await this.storeAnalysisResult(analysis);
          } catch (dbError) {
            console.error(
              `[AnalysisQueue] Failed to store analysis result:`,
              dbError.message,
            );
          }
        }

        console.log(
          `[AnalysisQueue] Completed: ${job.reviewId} (risk: ${analysis.analysis?.fraudRisk?.fraudRiskScore || "N/A"})`,
        );
      } catch (error) {
        job.status = "failed";
        job.error = error.message;
        job.completedAt = Date.now();
        this.failed++;

        console.error(
          `[AnalysisQueue] Failed to analyze ${job.reviewId}:`,
          error.message,
        );
      }
    }

    this.processing = false;
    console.log(
      `[AnalysisQueue] Queue processing complete (processed: ${this.processed}, failed: ${this.failed})`,
    );
  }

  /**
   * Store analysis result in database
   */
  async storeAnalysisResult(analysis) {
    if (!this.dbClient) return;

    const {
      reviewId,
      analysis: analysisData,
      signals,
      modelsUsed,
      analysisVersion,
      durationMs,
    } = analysis;

    try {
      // Store detailed signals in review_ai_analysis_signals table (Stage 1)
      await this.dbClient.query(
        `INSERT INTO review_ai_analysis_signals (
          id, review_id, 
          fake_review_probability, sentiment_score, toxicity_score,
          similarity_max_score, behavior_risk_score, fraud_risk_score,
          fraud_risk_level, recommendation_action, signals_json,
          model_versions, analysis_duration_ms, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (review_id) DO UPDATE SET
          fake_review_probability = EXCLUDED.fake_review_probability,
          sentiment_score = EXCLUDED.sentiment_score,
          toxicity_score = EXCLUDED.toxicity_score,
          similarity_max_score = EXCLUDED.similarity_max_score,
          behavior_risk_score = EXCLUDED.behavior_risk_score,
          fraud_risk_score = EXCLUDED.fraud_risk_score,
          fraud_risk_level = EXCLUDED.fraud_risk_level,
          recommendation_action = EXCLUDED.recommendation_action,
          signals_json = EXCLUDED.signals_json,
          analysis_duration_ms = EXCLUDED.analysis_duration_ms`,
        [
          `analysis-${reviewId}`,
          reviewId,
          signals?.fakeReview?.probability || 0,
          signals?.sentiment?.score || 0.5,
          signals?.toxicity?.score || 0,
          signals?.similarity?.maxSimilarity || 0,
          signals?.behavior?.behaviorRiskScore || 0,
          analysisData?.fraudRisk?.fraudRiskScore || 0.5,
          analysisData?.fraudRisk?.riskLevel || "UNKNOWN",
          analysisData?.recommendation?.action || "NEEDS_REVIEW",
          JSON.stringify(signals || {}),
          JSON.stringify(modelsUsed || []),
          durationMs || 0,
        ],
      );

      console.log(`[AnalysisQueue] Stored analysis for review: ${reviewId}`);
      try {
        const trustUpdate = await recalculateBusinessTrustScoreAfterAnalysis(
          reviewId,
          this.dbClient,
        );
        if (trustUpdate) {
          console.log(
            `[AnalysisQueue] Updated trust score for business ${trustUpdate.businessId}: ${trustUpdate.trustScore}`,
          );
        }
      } catch (trustError) {
        console.warn(
          `[AnalysisQueue] Trust recalculation unavailable for ${reviewId}: ${trustError.message}`,
        );
      }
    } catch (dbError) {
      console.error(`[AnalysisQueue] Database storage error:`, dbError.message);
      throw dbError;
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.processing,
      totalProcessed: this.processed,
      totalFailed: this.failed,
      pendingJobs: this.queue.map((job) => ({
        id: job.id,
        reviewId: job.reviewId,
        status: job.status,
      })),
    };
  }
}

// Create singleton instance
const analysisQueue = new AnalysisQueue();

function queueReviewSafely(queue, reviewData) {
  try {
    const job = queue.queueReview(reviewData);
    return { status: "queued", job };
  } catch (error) {
    console.warn(
      `[AnalysisQueue] Could not enqueue review ${reviewData.id}: ${error.message}`,
    );
    return { status: "unavailable", job: null };
  }
}

module.exports = {
  AnalysisQueue,
  analysisQueue,
  queueReviewSafely,
};
