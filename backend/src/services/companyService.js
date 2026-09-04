const { getDb, saveDb, initDb } = require("../db");
const prisma = require("../prisma");

const COMPANY_SELECT = {
  id: true,
  ownerId: true,
  businessName: true,
  description: true,
  category: true,
  phone: true,
  email: true,
  website: true,
  location: true,
  latitude: true,
  longitude: true,
  verificationLevel: true,
  trustScore: true,
  rating: true,
  reviewsCount: true,
  slug: true,
  createdAt: true,
};

function logPrismaFallback(operation, error) {
  console.warn(
    `[CompanyService] Prisma ${operation} failed; falling back to pg:`,
    error.message,
  );
}

function normalizeBusiness(row) {
  if (!row) return null;

  const verifiedReviewsCount = Number(
    row.verifiedReviewsCount ?? row._count?.reviews ?? 0,
  );
  const reviewsCount = Number(row.reviewsCount ?? row.reviews_count ?? 0);
  const businessName = row.businessName ?? row.business_name;
  const slug = row.slug || slugify(businessName);

  return {
    id: row.id,
    ownerId: row.ownerId ?? row.owner_id,
    name: businessName,
    slug,
    category: row.category || "General",
    location: row.location || "",
    latitude:
      row.latitude === null || row.latitude === undefined
        ? null
        : Number(row.latitude),
    longitude:
      row.longitude === null || row.longitude === undefined
        ? null
        : Number(row.longitude),
    website: row.website || "",
    phone: row.phone || "",
    email: row.email || "",
    description: row.description || "",
    verificationLevel: row.verificationLevel ?? row.verification_level,
    trustScore: Number(row.trustScore ?? row.trust_score ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount,
    verifiedReviewsCount,
    verifiedReviewPercentage: reviewsCount
      ? Number(((verifiedReviewsCount / reviewsCount) * 100).toFixed(1))
      : 0,
    createdAt: row.createdAt ?? row.created_at,
  };
}

function buildBusinessLocationSummary(locationFields = {}) {
  const values = [
    locationFields.addressLine,
    locationFields.neighborhood,
    locationFields.city,
    locationFields.region,
    locationFields.country,
  ].filter((value) => typeof value === "string" && value.trim());

  const postalCode = String(locationFields.postalCode || "").trim();
  const formattedCountry = values.length > 0 ? values[values.length - 1] : "";
  if (postalCode) {
    if (formattedCountry) {
      values[values.length - 1] = `${formattedCountry} ${postalCode}`;
    } else {
      values.push(postalCode);
    }
  }

  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join(", ");
}

function slugify(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "business"
  );
}

async function findCompanyBySlug(slug, client = prisma) {
  const value = String(slug).trim();
  try {
    const row = await client.business.findFirst({
      where: {
        OR: [
          { slug: { equals: value, mode: "insensitive" } },
          { businessName: { equals: value, mode: "insensitive" } },
        ],
      },
      select: {
        ...COMPANY_SELECT,
        _count: {
          select: { reviews: { where: { verifiedVisit: true } } },
        },
      },
    });
    return normalizeBusiness(row);
  } catch (error) {
    logPrismaFallback("business lookup", error);
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT b.*, COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.business_id = b.id AND r.verified_visit = TRUE), 0) AS verified_reviews_count
       FROM businesses b WHERE lower(b.slug) = lower($1) OR lower(b.business_name) = lower($1) LIMIT 1`,
      [value],
    );
    return normalizeBusiness(result.rows[0]);
  }
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
  locationFields = {},
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
  const effectiveLocation =
    location && String(location).trim()
      ? String(location).trim()
      : buildBusinessLocationSummary(locationFields);

  // attempt geocoding for precise map pins
  let latitude = null;
  let longitude = null;
  try {
    const coords = await geocodeAddress(effectiveLocation);
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
      String(effectiveLocation || "").trim(),
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

async function listCompanies(options = {}, client = prisma) {
  const {
    q,
    category,
    verifiedOnly,
    sort,
    limit = 100,
    offset = 0,
  } = options || {};

  try {
    const where = {};
    if (q && String(q).trim()) {
      const search = String(q).trim();
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (
      category &&
      String(category).trim() &&
      String(category).trim().toLowerCase() !== "all categories"
    ) {
      where.category = String(category).trim();
    }
    if (
      verifiedOnly === true ||
      verifiedOnly === "true" ||
      verifiedOnly === "1"
    ) {
      where.trustScore = { gte: 80 };
    }

    const rows = await client.business.findMany({
      where,
      orderBy:
        sort && String(sort).toLowerCase() === "score"
          ? { trustScore: "desc" }
          : { createdAt: "desc" },
      skip: Math.max(0, Number(offset || 0)),
      take: Math.max(0, Number(limit || 100)),
      select: {
        ...COMPANY_SELECT,
        _count: {
          select: { reviews: { where: { verifiedVisit: true } } },
        },
      },
    });
    return rows.map(normalizeBusiness);
  } catch (error) {
    logPrismaFallback("business list", error);
  }

  await initDb();
  const db = await getDb();

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

  return result.rows.map(normalizeBusiness);
}

async function findBusinessesByOwner(ownerId, options = {}, client = prisma) {
  const { limit = 100, offset = 0 } = options || {};
  try {
    const rows = await client.business.findMany({
      where: { ownerId: String(ownerId) },
      orderBy: { createdAt: "desc" },
      skip: Math.max(0, Number(offset || 0)),
      take: Math.max(0, Number(limit || 100)),
      select: {
        ...COMPANY_SELECT,
        _count: {
          select: { reviews: { where: { verifiedVisit: true } } },
        },
      },
    });
    return rows.map(normalizeBusiness);
  } catch (error) {
    logPrismaFallback("owner business lookup", error);
    await initDb();
    const db = await getDb();
    const result = await db.query(
      `SELECT b.*, COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.business_id = b.id AND r.verified_visit = TRUE), 0) AS verified_reviews_count
       FROM businesses b WHERE b.owner_id = $1 ORDER BY b.created_at DESC LIMIT $2 OFFSET $3`,
      [
        String(ownerId),
        Math.max(0, Number(limit || 100)),
        Math.max(0, Number(offset || 0)),
      ],
    );
    return result.rows.map(normalizeBusiness);
  }
}

async function getTopBusinesses(options = {}) {
  return listCompanies({ ...options, sort: "score" });
}

module.exports = {
  createCompany,
  listCompanies,
  findCompanyBySlug,
  findBusinessesByOwner,
  getTopBusinesses,
  ensureUniqueSlug,
  buildBusinessLocationSummary,
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
    defaultCategories.forEach((c) => set.add(c));
    rows.forEach((c) => set.add(c));

    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  },
};
