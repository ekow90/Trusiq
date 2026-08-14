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
    `SELECT * FROM businesses WHERE lower(slug) = lower($1) OR lower(business_name) = lower($1) LIMIT 1`,
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
    website: row.website,
    phone: row.phone,
    description: row.description,
    trustScore: Number(row.trust_score ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
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

  await db.query(
    `INSERT INTO businesses (id, owner_id, business_name, slug, category, location, website, phone, description, trust_score, rating, reviews_count, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
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
      0,
      0,
      0,
    ],
  );

  await saveDb();

  return await findCompanyBySlug(slug);
}

async function listCompanies() {
  await initDb();
  const db = await getDb();
  const result = await db.query(
    `SELECT * FROM businesses ORDER BY created_at DESC`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    ownerId: row.owner_id,
    name: row.business_name,
    slug: row.slug || slugify(row.business_name),
    category: row.category,
    location: row.location,
    website: row.website,
    phone: row.phone,
    description: row.description,
    trustScore: Number(row.trust_score ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    createdAt: row.created_at,
  }));
}

module.exports = {
  createCompany,
  listCompanies,
  findCompanyBySlug,
  ensureUniqueSlug,
};
