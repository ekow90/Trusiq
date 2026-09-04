const assert = require("node:assert/strict");
const { ensurePlatformStats } = require("./src/services/platformStatsService");

const rows = new Map([["users_joined", 99n]]);

const client = {
  user: {
    count: async () => 4,
  },
  business: {
    count: async () => 2,
  },
  review: {
    count: async (query) => (query ? 1 : 3),
  },
  platformStats: {
    findMany: async () => [...rows.keys()].map((statKey) => ({ statKey })),
    upsert: async ({ where, create }) => {
      if (!rows.has(where.statKey)) rows.set(create.statKey, create.statValue);
    },
  },
};

async function main() {
  await ensurePlatformStats(client);

  assert.equal(rows.get("users_joined"), 99n);
  assert.equal(rows.get("businesses_listed"), 2n);
  assert.equal(rows.get("reviews_submitted"), 3n);
  assert.equal(rows.get("verified_reviews"), 1n);

  console.log("Platform stats backfill verification passed");
}

main().catch((error) => {
  console.error("Platform stats backfill verification failed:", error);
  process.exitCode = 1;
});
