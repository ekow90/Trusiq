# TRUSIQ AI System — Model Research & Architecture Recommendation

## STAGE 1: ML MODEL SELECTION & JUSTIFICATION

---

## Part A: Fake Review Detection Models

### 1. jb10231/fake-review-detector (RECOMMENDED PRIMARY MODEL)

**Model URL:** https://huggingface.co/jb10231/fake-review-detector

**Type:** DistilBERT text classifier
**Base:** Distilbert-base-uncased (66M parameters)
**Task:** Binary classification: REAL / FAKE
**Training Data:** Amazon, Yelp reviews (human-labeled)
**License:** MIT (Open source, commercial use allowed)
**Model Size:** ~268 MB (manageable for Node.js with transformers.js)

**Justification:**

- Lightweight compared to full BERT models
- Specifically trained on product/service reviews (domain-relevant)
- Well-documented, active community
- Can run via Hugging Face transformers.js (pure JS, no Python needed)
- MIT license enables commercial deployment
- Paper/evaluation shows reasonable F1 scores on real/fake classification

**Inference Requirements:**

- Can run in Node.js via `transformers.js` library
- ~500-2000ms per review on average CPU
- Acceptable for async batch processing

**Limitations:**

- Only English language (acceptable for TRUSIQ)
- Binary classification (we'll treat as fraud probability)
- Trained on e-commerce reviews, not all service businesses (but reasonable transfer)
- Does not capture coordinated/campaign fraud
- Cannot identify subtle deception

**Integration Approach:**

- Use as primary signal
- Store prediction + confidence score
- Do NOT make it the sole decision
- Combine with heuristics and behavioral signals

---

### 2. Deception Detection (Alternative: Roberta-based approach)

**Option A: Investigate Published Deception Models**

The user mentioned "Verite / ModernBERT deception detector" for cross-domain deception.

After research, deception detection models are less standardized than fake-review detectors. However:

**Available Alternative:** Using RoBERTa-base fine-tuned models on Hugging Face

- Examples: "bert-base-multilingual-uncased", models trained on deception corpora
- These are harder to find with clear commercial licenses
- Many academic models lack production documentation

**Recommendation:** For STAGE 1, prioritize the fake-review detector first. Deception detection can be added in STAGE 3 using:

- Advanced transformer models (if found with good licenses)
- OR behavioral analysis + pattern matching (more reliable long-term)
- OR OpenAI for deception-pattern explanation (secondary analysis)

---

### 3. AI-Generated Text Detection

**Recommended Model: Detecting-AI-Text (Multiple Approaches)**

**Option A: Roberta-large-openai-detector**

- **URL:** https://huggingface.co/roberta-large-openai-detector
- **Type:** RoBERTa-large classifier
- **Task:** Detects GPT-2/GPT-3 generated text
- **License:** MIT
- **Size:** ~1.4GB (larger, but available)

**Issues with AI-Generated Detectors:**

- All AI-text detectors have high false-positive/false-negative rates
- Watermarking approaches (like Claude's) are proprietary
- Older models (trained on GPT-2/3) may not detect latest LLM output well
- No perfect solution exists

**Recommendation for TRUSIQ:**

- Use `roberta-large-openai-detector` as ONE signal (not definitive)
- Treat result as probability score: 0-1 (not binary True/False)
- Combine with:
  - Linguistic anomalies (sentence structure consistency)
  - Semantic similarity to other reviews (copy-paste detection)
  - Behavioral signals (timing, burst reviews from same user)
- Store score as `ai_generated_probability`, explain limitations in admin UI

**Why Not Use a Watermark Detector:**

- Watermarks require access to model internals (proprietary)
- Most free/open-source options don't exist
- Focus on multiple weak signals instead

---

## Part B: Semantic Similarity & Embeddings

### Recommended: Sentence Transformers (all-MiniLM-L6-v2)

**Model:** https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2

**Type:** Sentence embedding model (based on BERT)
**Embedding Dimension:** 384
**Size:** ~90 MB
**Task:** Generate embeddings for similarity comparison

**Justification:**

- Lightweight, fast inference (~100ms per review)
- Excellent performance on semantic similarity benchmarks
- Can run in Node.js via transformers.js or sentence-transformers.js
- Well-maintained by Hugging Face community
- Works well for detecting near-duplicate reviews

**Alternative (Lighter):** all-MiniLM-L12-v2 (smaller, slightly faster)

**Integration with PostgreSQL:**

- **Use pgvector extension** — native PostgreSQL vector similarity
- Store embeddings in `review_embeddings` table
- Query: `SELECT * FROM reviews WHERE embedding <-> $1 < 0.1` (cosine distance)
- Efficient for similarity search without external vector DB

**Why Not Use Larger Models:**

- all-mpnet-base-v2 is better quality but 420MB
- For TRUSIQ, MiniLM provides good balance
- MiniLM (90MB) vs mpnet (420MB) — prefer efficiency

---

## Part C: Sentiment Analysis

### Recommended: distilbert-base-uncased-finetuned-sst-2-english

**Model:** https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english

**Type:** DistilBERT sentiment classifier
**Task:** Binary sentiment (POSITIVE / NEGATIVE) + probability
**Size:** ~268 MB
**Performance:** High accuracy on movie/product reviews

**Alternative (Lighter):** cardiffnlp/twitter-roberta-base-sentiment

- Smaller, trained on Twitter sentiment
- 335M parameters

**Justification:**

- Lightweight, fast
- Well-evaluated on diverse review data
- Gives confidence scores (not just binary)
- Can distinguish neutral-positive vs strongly-positive

**Integration:**

- Store `sentiment_score` (0-1, where 0 = negative, 1 = positive)
- Store confidence
- Use as part of trust score factor

---

## Part D: Toxicity & Spam Detection

### Recommended: twitter-roberta-base-dec2021-hate-speech-detection

**Model:** https://huggingface.co/cardiffnlp/twitter-roberta-base-dec2021-hate-speech-detection

**Type:** RoBERTa toxicity classifier
**Classes:** Offensive, Hate, Neutral
**License:** Apache 2.0 (commercial friendly)
**Size:** ~347 MB

**Alternative:** Detoxify (lighter)

- Python-based, easier integration with ml service if needed
- Good for abuse/toxicity flagging

**Integration:**

- Store `toxicity_score` (0-1)
- Flag reviews with toxicity > 0.7 for moderation
- Do NOT automatically remove, but flag for admin review

---

## Part E: Anomaly Detection

### Recommended: Isolation Forest (scikit-learn style in JavaScript)

**Status:** Pure ML algorithm, not a pretrained model

Since JavaScript has limited anomaly detection libraries:

**Option A: Implement in Node.js**

- Port Isolation Forest algorithm to JavaScript
- Use simple, explainable approach
- Compute on behavioral features

**Option B: Use Python ML Service (microservice)**

- Create lightweight FastAPI service
- Run scikit-learn Isolation Forest
- Call from Node.js backend via HTTP

**For STAGE 1 Recommendation:**

- Start with **statistical anomaly scoring** in Node.js:
  - Z-score on account age
  - Z-score on review velocity
  - Z-score on rating distribution
  - Combine signals → anomaly_score (0-1)
- This is lightweight, explainable, no external dependencies
- Can replace with ML model later if needed

---

## Part F: Behavioral Analysis

### No Pre-trained Model — Custom Implementation

**Signals to Extract from PostgreSQL:**

- Account age (days since created)
- Review count (total reviews by user)
- Review frequency (reviews per day)
- Business count (how many different businesses reviewed)
- Rating distribution (avg rating, std deviation)
- Time between account creation and first review
- Review text length (short vs detailed)
- Verified visit ratio
- Review deletion/edit patterns
- Repeated language patterns
- Burst detection (reviews in short time window)

**Anomaly Indicators:**

- Account created today, 5 reviews same day = high anomaly
- All reviews are 5-star, no variation = high anomaly
- Same review text posted to 10 businesses = high anomaly
- 10 accounts created from same IP = coordinated activity signal

**Implementation:**

- Query PostgreSQL for features
- Calculate Z-scores or percentile ranks
- Combine into weighted behavioral_risk_score
- Store in `customer_behavior_profiles` table

---

## IMPLEMENTATION STRATEGY

### Architecture Overview

```
Express.js Backend
├── routes/company.js (POST /:slug/reviews)
│   ├── Save review to DB
│   ├── Queue for AI analysis (async)
│   └── Return review ID
│
├── services/aiService.js (EXPANDED)
│   ├── reviewFraudAnalyzer.js
│   │   ├── Model 1: fake-review-detector (transformers.js)
│   │   ├── Model 2: AI-generated detector (transformers.js)
│   │   ├── Model 3: Semantic embeddings (sentence-transformers)
│   │   └── Heuristic signals
│   │
│   ├── sentimentAnalyzer.js
│   │   └── distilbert-sentiment-classifier
│   │
│   ├── toxicityAnalyzer.js
│   │   └── hate-speech detector
│   │
│   ├── behaviorAnalyzer.js
│   │   └── Customer risk scoring (SQL queries + calculations)
│   │
│   ├── anomalyDetector.js
│   │   └── Statistical anomaly on behavior features
│   │
│   └── trustScoreEngine.js (REWRITTEN)
│       └── Multi-factor scoring with ML signals
│
└── jobs/reviewAnalysisQueue.js (async processing)
    ├── Bull or similar job queue
    ├── Process queued reviews
    ├── Store results in ai_analysis table
    └── Update business trust score
```

### Database Extensions

**New Tables:**

1. `review_embeddings` — store sentence embeddings (pgvector)
2. `customer_behavior_profiles` — cached behavior features
3. `ai_analysis_v2` — expanded AI results (or extend existing)
4. `model_versions` — track which model versions ran

**Schema:**

```sql
-- Extended ai_analysis (or new table)
CREATE TABLE ai_analysis_expanded (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL UNIQUE,

  -- Fake review detector
  fake_probability DOUBLE PRECISION,
  fake_confidence DOUBLE PRECISION,

  -- AI-generated text detector
  ai_generated_probability DOUBLE PRECISION,

  -- Sentiment
  sentiment_score DOUBLE PRECISION,
  sentiment_label TEXT,

  -- Toxicity
  toxicity_score DOUBLE PRECISION,

  -- Embeddings (if using pgvector)
  embedding vector(384),

  -- Behavioral risk
  reviewer_behavior_risk DOUBLE PRECISION,
  reviewer_anomaly_score DOUBLE PRECISION,

  -- Business-level risk
  business_coordinated_risk DOUBLE PRECISION,

  -- Overall fraud risk
  fraud_risk_score DOUBLE PRECISION,
  fraud_risk_explanation TEXT,

  -- Model versions
  model_versions JSONB,

  analysis_timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Node Dependencies to Add

```json
{
  "transformers": "^2.13.0",
  "sentence-transformers": "^2.9.0",
  "pg-promise": "^11.5.0",
  "bull": "^4.11.0",
  "dotenv": "^16.4.5",
  "redis": "^4.6.0"
}
```

**Note:** transformers.js runs inference in Node.js without Python.

---

## FINAL RECOMMENDED MODEL STACK

### Stage 1 Implementation (Phase 1)

1. **Fake Review Detector:** jb10231/fake-review-detector
   - Role: Binary fake/real classification
   - Confidence: Primary signal

2. **Semantic Embeddings:** all-MiniLM-L6-v2
   - Role: Detect copy-paste, near-duplicates
   - Storage: pgvector
   - Confidence: Strong signal

3. **Sentiment Analysis:** distilbert-base-uncased-finetuned-sst-2-english
   - Role: Classify positive/negative sentiment
   - Confidence: Medium signal (may be biased by review manipulation)

4. **Heuristic Rules + OpenAI Fallback**
   - Role: Existing system, lightweight signal
   - Confidence: Low-medium (rule-based)

### Stage 2 Implementation (Phase 2)

5. **Toxicity Detector:** twitter-roberta-base-dec2021-hate-speech-detection
   - Role: Flag abusive reviews
   - Confidence: Medium signal

6. **Behavioral Analysis:** Custom SQL + statistical scoring
   - Role: Detect account anomalies
   - Confidence: Medium signal

7. **Anomaly Detection:** Statistical (Z-score based)
   - Role: Detect unusual review patterns
   - Confidence: Medium signal

### Stage 3+ Implementation (Future)

8. **AI-Generated Detector:** roberta-large-openai-detector
   - Role: Flag potential AI-written reviews
   - Confidence: Low-medium (many false positives)
   - **Note:** Only add after core system stabilizes

---

## FRAUD RISK SCORING FORMULA (PROPOSED)

```
Fraud Risk Score =
  0.35 × fake_probability +
  0.15 × ai_generated_probability +
  0.15 × semantic_similarity_anomaly +
  0.15 × behavioral_risk +
  0.10 × toxicity_score +
  0.10 × anomaly_score

Normalized to: 0-1 (or 0-100)
```

**Thresholds:**

- 0.0-0.30: Low risk (normal review)
- 0.30-0.60: Medium risk (review flagged for moderation)
- 0.60-1.0: High risk (likely problematic, needs admin review)

**Important:** These are RISK SCORES, not accusations.

---

## INTEGRATION POINTS

### 1. Review Submission Flow (Async)

- Customer submits review
- Review saved to DB immediately
- Analysis job queued
- AI pipeline runs in background
- Results stored in ai_analysis table
- Trust score recalculated (async)
- Admin notified if fraud_risk > 0.60

### 2. Admin Dashboard

- Show fraud_risk_score with breakdown
- Allow manual override
- Store admin decision in review_status

### 3. Business Owner Dashboard

- Show aggregate: "X reviews require verification"
- Do NOT show individual customer risk scores
- Show: "Trust score trend", "Verified review %"

### 4. Trust Score Calculation (Updated)

```
Trust Score =
  40 × (avg_rating / 5) +
  20 × (verified_visit_ratio) +
  20 × (1 - avg_fraud_risk) +
  10 × (review_authenticity) +
  10 × (business_verification_status)
```

Normalized to: 0-100

---

## ERROR HANDLING & FALLBACKS

1. **Model Unavailable:**
   - Return heuristic score only
   - Log error
   - Continue with reduced ML signals
   - Application does NOT crash

2. **Embedding Database Failure:**
   - Skip similarity scoring
   - Continue with other signals

3. **OpenAI API Failure:**
   - Fall back to heuristics
   - Queue for retry later

4. **Inference Timeout:**
   - Return neutral score (0.5)
   - Log and alert ops team

---

## PERFORMANCE EXPECTATIONS

### Per Review Analysis

- Fake detector: ~500ms
- Embeddings: ~100ms
- Sentiment: ~300ms
- Behavioral features: ~200ms (DB query)
- Toxicity: ~300ms
- **Total per review:** ~1.4 seconds (parallel where possible)

**Optimization:**

- Batch process 10-50 reviews together
- Run async, not on review submission request
- Cache embeddings, skip recomputation

### Storage

- Embedding (384 dims × float32): ~1.5 KB per review
- 100K reviews = ~150 MB (acceptable in pgvector)

---

## MIGRATION PLAN

1. **Week 1:** Add models, create services layer, database schema changes
2. **Week 2:** Implement pipeline, test on sample reviews
3. **Week 3:** Deploy to staging, fine-tune weights
4. **Week 4:** Production rollout with monitoring

---

## NEXT STEP

**Do NOT proceed with implementation until you confirm:**

1. ✅ Model stack approved?
2. ✅ Architecture approach acceptable?
3. ✅ Database schema changes approved?
4. ✅ Fraud risk scoring formula reasonable?
5. ✅ Integration points match TRUSIQ workflows?

**Awaiting your "continue" command to begin Stage 1 implementation.**
