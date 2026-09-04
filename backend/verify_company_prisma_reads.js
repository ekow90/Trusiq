const assert = require("node:assert/strict");
const {
  findCompanyBySlug,
  findBusinessesByOwner,
  listCompanies,
} = require("./src/services/companyService");

const businesses = [
  {
    id: "business-1",
    ownerId: "owner-1",
    businessName: "Kora Kitchen",
    category: "Restaurants",
    location: "East Legon, Accra",
    latitude: 5.6037,
    longitude: -0.187,
    trustScore: 88,
    rating: 4.5,
    reviewsCount: 10,
    slug: "kora-kitchen",
    _count: { reviews: 7 },
  },
  {
    id: "business-2",
    ownerId: "owner-1",
    businessName: "Unset Details",
    category: null,
    location: null,
    latitude: null,
    longitude: null,
    trustScore: null,
    rating: null,
    reviewsCount: null,
    slug: null,
    _count: { reviews: 0 },
  },
];

const prismaMock = {
  business: {
    findFirst: async ({ where }) =>
      businesses.find(
        (business) =>
          business.slug.toLowerCase() ===
            where.OR[0].slug.equals.toLowerCase() ||
          business.businessName.toLowerCase() ===
            where.OR[1].businessName.equals.toLowerCase(),
      ) || null,
    findMany: async ({ where }) =>
      where.ownerId
        ? businesses.filter((business) => business.ownerId === where.ownerId)
        : businesses,
  },
};

async function main() {
  const listed = await listCompanies({ q: "kora" }, prismaMock);
  assert.equal(listed[0].name, "Kora Kitchen");
  assert.equal(listed[0].verifiedReviewsCount, 7);
  assert.equal(listed[0].verifiedReviewPercentage, 70);

  const profile = await findCompanyBySlug("KORA-KITCHEN", prismaMock);
  assert.equal(profile.slug, "kora-kitchen");
  assert.equal(profile.trustScore, 88);
  assert.equal(profile.location, "East Legon, Accra");

  const owned = await findBusinessesByOwner("owner-1", {}, prismaMock);
  assert.equal(owned.length, 2);
  assert.equal(owned[1].category, "General");
  assert.equal(owned[1].location, "");
  assert.equal(owned[1].trustScore, 0);
  assert.equal(owned[1].reviewsCount, 0);

  console.log("Prisma company read verification passed");
}

main().catch((error) => {
  console.error("Prisma company read verification failed:", error);
  process.exitCode = 1;
});
