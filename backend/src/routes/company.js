const express = require("express");
const crypto = require("crypto");
const { authenticateToken } = require("../middleware/auth");
const { updateUserCompanyId } = require("../services/userService");
const {
  createCompany,
  listCompanies,
  findCompanyBySlug,
  getCategories,
} = require("../services/companyService");
const { geocodeAddress } = require("../services/geocodeService");

const router = express.Router();

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

router.get("/", async (req, res) => {
  try {
    const { q, category, verified, sort, limit, offset } = req.query || {};

    const options = {
      q: q || undefined,
      category: category || undefined,
      verifiedOnly: verified === "true" || verified === "1" ? true : false,
      sort: sort || undefined,
      limit: Number(limit || 100),
      offset: Number(offset || 0),
    };

    const companies = await listCompanies(options);

    return res.json({ companies });
  } catch (error) {
    return res.status(500).json({ error: "Could not load companies" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const cats = await getCategories();
    return res.json({ categories: cats });
  } catch (error) {
    return res.status(500).json({ error: "Could not load categories" });
  }
});

router.get("/suggestions", async (req, res) => {
  try {
    const { q, limit = 5 } = req.query || {};
    const companies = await listCompanies({
      q: q || undefined,
      limit: Number(limit),
    });
    const suggestions = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      category: c.category,
      location: c.location,
    }));
    return res.json({ suggestions });
  } catch (error) {
    return res.status(500).json({ error: "Could not load suggestions" });
  }
});

router.get("/:slug/qr", async (req, res) => {
  try {
    let company = await findCompanyBySlug(req.params.slug);
    if (!company) return res.status(404).json({ error: "Company not found" });
    if (company.latitude === null || company.longitude === null) {
      const coordinates = await geocodeAddress(company.location);
      if (!coordinates) {
        return res
          .status(409)
          .json({ error: "This business has no verified map location yet" });
      }
      const coordinateDb = await require("../db").getDb();
      await coordinateDb.query(
        `UPDATE businesses SET latitude = $1, longitude = $2, updated_at = NOW() WHERE id = $3`,
        [coordinates.latitude, coordinates.longitude, company.id],
      );
      company = { ...company, ...coordinates };
    }

    const db = await require("../db").getDb();
    const current = await db.query(
      `SELECT id, qr_token, qr_image_url FROM qr_codes
       WHERE business_id = $1 AND active = TRUE
       AND created_at >= date_trunc('month', NOW())
       ORDER BY created_at DESC LIMIT 1`,
      [company.id],
    );
    const token =
      current.rows[0]?.qr_token || crypto.randomBytes(24).toString("hex");
    const reviewUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/review?business=${encodeURIComponent(company.slug)}&qr=${token}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=640x640&margin=16&data=${encodeURIComponent(reviewUrl)}`;

    if (!current.rows[0]) {
      await db.query(
        `INSERT INTO qr_codes (id, business_id, qr_token, qr_image_url, active)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [makeId("qr"), company.id, token, qrImageUrl],
      );
    } else if (current.rows[0].qr_image_url !== qrImageUrl) {
      await db.query(`UPDATE qr_codes SET qr_image_url = $1 WHERE id = $2`, [
        qrImageUrl,
        current.rows[0].id,
      ]);
    }

    return res.json({
      business: {
        name: company.name,
        slug: company.slug,
        location: company.location,
      },
      token,
      reviewUrl,
      qrImageUrl,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not generate business QR code" });
  }
});

router.get("/:slug", async (req, res) => {
  const company = await findCompanyBySlug(req.params.slug);
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  return res.json({ company });
});

router.post("/register", authenticateToken, async (req, res) => {
  try {
    const { name, category, location, website, phone, description } =
      req.body || {};
    const user = req.user;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Business name is required" });
    }

    const company = await createCompany({
      ownerId: user?.id || null,
      name,
      category,
      location,
      website,
      phone,
      description,
    });

    if (user?.id) {
      await updateUserCompanyId(user.id, company.id);
    }

    return res.status(201).json({ company });
  } catch (error) {
    return res
      .status(400)
      .json({ error: error.message || "Could not create business account" });
  }
});

router.post("/:slug/reviews", authenticateToken, async (req, res) => {
  try {
    const {
      rating,
      review_text,
      qr_token,
      latitude,
      longitude,
      audio,
      photos,
    } = req.body || {};
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
    if (!roles.includes("customer")) {
      return res
        .status(403)
        .json({ error: "Only customer accounts can submit reviews" });
    }
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const company = await findCompanyBySlug(req.params.slug);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const db = await require("../db").getDb();

    const userId = req.user.id;
    let qrResult = { rows: [] };
    let verifiedVisit = false;
    if (qr_token) {
      qrResult = await db.query(
        `SELECT id FROM qr_codes WHERE business_id = $1 AND qr_token = $2 AND active = TRUE
         AND created_at >= date_trunc('month', NOW()) LIMIT 1`,
        [company.id, String(qr_token)],
      );
      if (!qrResult.rows.length) {
        return res
          .status(400)
          .json({ error: "This QR code has expired or is invalid" });
      }
      if (
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        company.latitude !== null &&
        company.longitude !== null
      ) {
        const toRadians = (value) => (value * Math.PI) / 180;
        const earthRadius = 6371000;
        const latDelta = toRadians(latitude - company.latitude);
        const lonDelta = toRadians(longitude - company.longitude);
        const a =
          Math.sin(latDelta / 2) ** 2 +
          Math.cos(toRadians(company.latitude)) *
            Math.cos(toRadians(latitude)) *
            Math.sin(lonDelta / 2) ** 2;
        const distance =
          earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (distance > 500) {
          return res.status(403).json({
            error:
              "You must be within 500 metres of the business to verify this visit",
          });
        }
        verifiedVisit = true;
      }
    }
    if (
      audio &&
      (typeof audio.data !== "string" || audio.data.length > 7_000_000)
    ) {
      return res.status(413).json({ error: "Audio recording is too large" });
    }
    if (photos && (!Array.isArray(photos) || photos.length > 4)) {
      return res.status(400).json({ error: "You can upload at most 4 photos" });
    }
    if (Array.isArray(photos)) {
      for (const photo of photos) {
        if (
          !photo ||
          typeof photo.data !== "string" ||
          !photo.data.startsWith("data:image/")
        ) {
          return res
            .status(400)
            .json({ error: "Only valid image uploads are allowed" });
        }
        if (photo.data.length > 28_000_000) {
          return res
            .status(413)
            .json({ error: "Each photo must be smaller than 20 MB" });
        }
      }
    }

    const hashMetadata = {
      version: 1,
      submittedAt: new Date().toISOString(),
      contentTypes: [
        "rating",
        ...(review_text?.trim() ? ["text"] : []),
        ...(audio ? ["audio"] : []),
        ...(photos?.length ? ["images"] : []),
      ],
      qrCodeId: qrResult.rows[0]?.id || null,
      verifiedVisit,
    };
    const reviewHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          rating: Number(rating),
          reviewText: String(review_text || "").trim(),
          audio: audio?.data || null,
          photos: photos || [],
          metadata: hashMetadata,
        }),
      )
      .digest("hex");

    const reviewId = makeId("review");
    await db.query(
      `INSERT INTO reviews (id, business_id, user_id, rating, review_text, verified_visit, review_hash, hash_metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
      [
        reviewId,
        company.id,
        userId,
        Number(rating),
        String(review_text || "").trim(),
        verifiedVisit,
        reviewHash,
        JSON.stringify(hashMetadata),
      ],
    );
    if (audio) {
      await db.query(
        `INSERT INTO voice_reviews (id, review_id, audio_url, duration_seconds)
         VALUES ($1, $2, $3, $4)`,
        [
          makeId("voice"),
          reviewId,
          String(audio.data),
          Number(audio.durationSeconds || 0),
        ],
      );
    }
    if (Array.isArray(photos)) {
      for (const photo of photos) {
        await db.query(
          `INSERT INTO review_media (id, review_id, media_url) VALUES ($1, $2, $3)`,
          [makeId("media"), reviewId, String(photo.data)],
        );
      }
    }
    if (verifiedVisit) {
      await db.query(
        `INSERT INTO verified_visits (id, user_id, business_id, qr_code_id, verification_status)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [makeId("visit"), userId, company.id, qrResult.rows[0].id],
      );
    }

    // update businesses aggregate: increment reviews_count and recompute average rating
    await db.query(
      `UPDATE businesses SET reviews_count = COALESCE(reviews_count,0) + 1 WHERE id = $1`,
      [company.id],
    );
    const avgRes = await db.query(
      `SELECT AVG(rating) as avg FROM reviews WHERE business_id = $1`,
      [company.id],
    );
    const avg =
      avgRes.rows && avgRes.rows[0] ? Number(avgRes.rows[0].avg || 0) : 0;
    await db.query(
      `UPDATE businesses SET rating = $1, updated_at = NOW() WHERE id = $2`,
      [avg, company.id],
    );
    const verificationStats = await db.query(
      `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE verified_visit = TRUE)::int AS verified
       FROM reviews WHERE business_id = $1`,
      [company.id],
    );
    const totalReviews = Number(verificationStats.rows[0]?.total || 0);
    const verifiedReviews = Number(verificationStats.rows[0]?.verified || 0);
    const verifiedPercentage = totalReviews
      ? (verifiedReviews / totalReviews) * 100
      : 0;
    const trustScore = Math.min(
      100,
      Math.round((avg / 5) * 70 + verifiedPercentage * 0.3),
    );
    await db.query(
      `UPDATE businesses SET trust_score = $1, updated_at = NOW() WHERE id = $2`,
      [trustScore, company.id],
    );

    return res.status(201).json({
      reviewId,
      reviewHash,
      verifiedPercentage,
      trustScore,
      blockchain: { anchored: false, status: "deferred" },
    });
  } catch (error) {
    console.error("review submit error", error);
    return res.status(500).json({ error: "Could not submit review" });
  }
});

module.exports = router;
