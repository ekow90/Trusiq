const { getDb, saveDb, initDb } = require("../db");

function slugify(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "business"
  );
}

async function findCompanyBySlug(slug) {
  await initDb();
  const db = await getDb();
  const result = await db.query(
    `SELECT b.*, COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.business_id = b.id AND r.verified_visit = TRUE), 0) AS verified_reviews_count
     FROM businesses b WHERE lower(b.slug) = lower($1) OR lower(b.business_name) = lower($1) LIMIT 1`,
    [String(slug).trim()],
  );

  if (!result.rows.length) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.business_name,
    slug: row.slug || slugify(row.business_name),
    category: row.category,
    location: row.location,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    website: row.website,
    phone: row.phone,
    description: row.description,
    trustScore: Number(row.trust_score ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    verifiedReviewsCount: Number(row.verified_reviews_count ?? 0),
    verifiedReviewPercentage: row.reviews_count
      ? Number(
          (
            (Number(row.verified_reviews_count ?? 0) /
              Number(row.reviews_count)) *
            100
          ).toFixed(1),
        )
      : 0,
    createdAt: row.created_at,
  };
}

async function ensureUniqueSlug(name) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await findCompanyBySlug(slug);
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

async function ensureOwnerRecord(ownerId, fallbackName = "Business owner") {
  if (!ownerId) return null;

  const db = await getDb();
  const existingOwner = await db.query(
    `SELECT id FROM users WHERE id = $1 LIMIT 1`,
    [ownerId],
  );

  if (existingOwner.rows.length > 0) {
    return ownerId;
  }

  const ownerEmail = `${String(ownerId).trim().toLowerCase()}@example.com`;
  const ownerName =
    String(fallbackName || "Business owner").trim() || "Business owner";
  const passwordHash = require("bcryptjs").hashSync(`temp-${ownerId}`, 10);

  await db.query(
    `INSERT INTO users (id, email, password_hash, full_name, role, roles, company_id, account_status, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      ownerId,
      ownerEmail,
      passwordHash,
      ownerName,
      "owner",
      JSON.stringify(["owner"]),
      null,
      "active",
      true,
    ],
  );

  return ownerId;
}

const { geocodeAddress } = require("./geocodeService");

async function createCompany({
  id,
  ownerId = null,
  name,
  category = "General",
  location = "",
  website = "",
  phone = "",
  description = "",
}) {
  await initDb();

  if (!name || !String(name).trim()) {
    throw new Error("Company name is required");
  }

  const normalizedOwnerId = await ensureOwnerRecord(ownerId, name);
  const createdId =
    id || `company-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const slug = await ensureUniqueSlug(name);
  const db = await getDb();

  // attempt geocoding for precise map pins
  let latitude = null;
  let longitude = null;
  try {
    const coords = await geocodeAddress(location);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
    }
  } catch (e) {
    // ignore geocode failures
  }

  await db.query(
    `INSERT INTO businesses (id, owner_id, business_name, slug, category, location, website, phone, description, latitude, longitude, trust_score, rating, reviews_count, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
    [
      createdId,
      normalizedOwnerId,
      String(name).trim(),
      slug,
      String(category || "General").trim(),
      String(location || "").trim(),
      String(website || "").trim(),
      String(phone || "").trim(),
      String(description || "").trim(),
      latitude,
      longitude,
      0,
      0,
      0,
    ],
  );

  await saveDb();

  return await findCompanyBySlug(slug);
}

async function listCompanies(options = {}) {
  await initDb();
  const db = await getDb();

  const {
    q,
    category,
    verifiedOnly,
    sort,
    limit = 100,
    offset = 0,
  } = options || {};

  const clauses = [];
  const params = [];

  if (q && String(q).trim()) {
    params.push(`%${String(q).trim()}%`);
    clauses.push(
      `(business_name ILIKE $${params.length} OR category ILIKE $${params.length} OR location ILIKE $${params.length} OR description ILIKE $${params.length})`,
    );
  }

  if (
    category &&
    String(category).trim() &&
    String(category).trim().toLowerCase() !== "all categories"
  ) {
    params.push(String(category).trim());
    clauses.push(`category = $${params.length}`);
  }

  if (
    verifiedOnly === true ||
    verifiedOnly === "true" ||
    verifiedOnly === "1"
  ) {
    // consider trust_score >= 80 as verified
    params.push(80);
    clauses.push(`trust_score >= $${params.length}`);
  }

  let order = "created_at DESC";
  if (sort && String(sort).toLowerCase() === "score") {
    order = "trust_score DESC NULLS LAST";
  }

  // Build query
  let sql = `SELECT b.*, COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.business_id = b.id AND r.verified_visit = TRUE), 0) AS verified_reviews_count FROM businesses b`;
  if (clauses.length) {
    sql += " WHERE " + clauses.join(" AND ");
  }

  sql += ` ORDER BY ${order}`;

  // limit/offset params
  params.push(Number(limit || 100));
  const limitParamIndex = params.length;
  params.push(Number(offset || 0));
  const offsetParamIndex = params.length;

  sql += ` LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;

  const result = await db.query(sql, params);

  return result.rows.map((row) => ({
    id: row.id,
    ownerId: row.owner_id,
    name: row.business_name,
    slug: row.slug || slugify(row.business_name),
    category: row.category,
    location: row.location,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    website: row.website,
    phone: row.phone,
    description: row.description,
    trustScore: Number(row.trust_score ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    verifiedReviewsCount: Number(row.verified_reviews_count ?? 0),
    verifiedReviewPercentage: row.reviews_count
      ? Number(
          (
            (Number(row.verified_reviews_count ?? 0) /
              Number(row.reviews_count)) *
            100
          ).toFixed(1),
        )
      : 0,
    createdAt: row.created_at,
  }));
}

module.exports = {
  createCompany,
  listCompanies,
  findCompanyBySlug,
  ensureUniqueSlug,
  // return distinct categories
  getCategories: async function getCategories() {
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT DISTINCT category FROM businesses WHERE category IS NOT NULL ORDER BY category`,
    );

    const rows = result.rows.map((r) => r.category).filter(Boolean);

    const defaultCategories = [
      "General",
      "Restaurants",
      "Cafes & Coffee Shops",
      "Bakeries",
      "Bars & Nightlife",
      "Fast Food",
      "Grocery",
      "Supermarkets",
      "Retail",
      "Clothing & Fashion",
      "Shoes",
      "Jewelry",
      "Electronics",
      "Furniture",
      "Home Goods",
      "Health & Medical",
      "Pharmacy",
      "Doctors",
      "Dentists",
      "Veterinary",
      "Beauty & Spas",
      "Hair Salons",
      "Barbers",
      "Nails",
      "Fitness & Gyms",
      "Yoga",
      "Personal Trainers",
      "Wellness",
      "Services",
      "Cleaning Services",
      "Landscaping",
      "Plumbing",
      "Electrical",
      "Construction",
      "Contractors",
      "Home Improvement",
      "Real Estate",
      "Property Management",
      "Hotels & Travel",
      "Event Planning",
      "Catering",
      "Education",
      "Tutoring",
      "Daycare",
      "Professional Services",
      "Legal",
      "Accounting",
      "Finance & Insurance",
      "Banking",
      "Consulting",
      "Marketing & Advertising",
      "Photography",
      "Arts & Entertainment",
      "Museums",
      "Theaters",
      "Sports & Recreation",
      "Automotive",
      "Auto Repair",
      "Car Dealerships",
      "Transportation",
      "Logistics",
      "Couriers",
      "Manufacturing",
      "Wholesale",
      "Technology",
      "IT Services",
      "Software Development",
      "Web Design",
      "E-commerce",
      "Telecommunications",
      "Nonprofit",
      "Government",
      "Other",
    ];

    // merge DB categories with defaults, dedupe and sort with defaults preserved first
    const set = new Set();
    // include defaults first for predictable order
    defaultCategories.forEach((c) => set.add(c));
    rows.forEach((c) => set.add(c));

    return Array.from(set);
  },
};
