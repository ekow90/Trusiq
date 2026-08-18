const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { updateUserCompanyId } = require("../services/userService");
const {
  createCompany,
  listCompanies,
  findCompanyBySlug,
  getCategories,
} = require("../services/companyService");

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

// submit a review for a company (create anonymous user if not authenticated)
router.post("/:slug/reviews", async (req, res) => {
  try {
    const { rating, review_text, verified_visit } = req.body || {};
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const company = await findCompanyBySlug(req.params.slug);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const db = await require("../db").getDb();

    // determine user id: authenticated user or create a lightweight anonymous user
    let userId = null;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      userId = makeId("anon");
      const passwordHash = require("bcryptjs").hashSync(`temp-${userId}`, 10);
      const email = `${userId}@example.com`;
      await db.query(
        `INSERT INTO users (id, email, password_hash, full_name, role, roles, company_id, account_status, email_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [
          userId,
          email,
          passwordHash,
          "Anonymous",
          "customer",
          JSON.stringify(["customer"]),
          null,
          "active",
          true,
        ],
      );
    }

    const reviewId = makeId("review");
    await db.query(
      `INSERT INTO reviews (id, business_id, user_id, rating, review_text, verified_visit, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [
        reviewId,
        company.id,
        userId,
        Number(rating),
        String(review_text || "").trim(),
        !!verified_visit,
      ],
    );

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

    return res.status(201).json({ reviewId });
  } catch (error) {
    console.error("review submit error", error);
    return res.status(500).json({ error: "Could not submit review" });
  }
});

module.exports = router;
