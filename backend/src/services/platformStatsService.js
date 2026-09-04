const prisma = require("../prisma");

const STAT_KEYS = [
  "users_joined",
  "businesses_listed",
  "reviews_submitted",
  "verified_reviews",
];

function toSafeNumber(value) {
  const number = typeof value === "bigint" ? Number(value) : Number(value ?? 0);
  return Number.isSafeInteger(number) ? number : 0;
}

async function getPlatformStatCounts(client = prisma) {
  const [users, businesses, reviews, verifiedReviews] = await Promise.all([
    client.user.count(),
    client.business.count(),
    client.review.count(),
    client.review.count({ where: { verifiedVisit: true } }),
  ]);

  return {
    users_joined: users,
    businesses_listed: businesses,
    reviews_submitted: reviews,
    verified_reviews: verifiedReviews,
  };
}

async function ensurePlatformStats(client = prisma) {
  const rows = await client.platformStats.findMany({
    where: { statKey: { in: STAT_KEYS } },
    select: { statKey: true },
  });
  const existingKeys = new Set(rows.map((row) => row.statKey));
  const missingKeys = STAT_KEYS.filter((key) => !existingKeys.has(key));

  if (missingKeys.length) {
    const counts = await getPlatformStatCounts(client);
    await Promise.all(
      missingKeys.map((statKey) =>
        client.platformStats.upsert({
          where: { statKey },
          update: {},
          create: {
            statKey,
            statValue: BigInt(counts[statKey]),
          },
        }),
      ),
    );
  }
}

async function getPlatformStats() {
  await ensurePlatformStats();
  const rows = await prisma.platformStats.findMany({
    where: { statKey: { in: STAT_KEYS } },
    select: { statKey: true, statValue: true },
  });

  const stats = Object.fromEntries(STAT_KEYS.map((key) => [key, 0]));
  for (const row of rows) {
    stats[row.statKey] = toSafeNumber(row.statValue);
  }

  return stats;
}

module.exports = { ensurePlatformStats, getPlatformStats };
