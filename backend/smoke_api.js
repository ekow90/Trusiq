require("dotenv").config();

const http = require("node:http");
const app = require("./src/app");
const { getDb, initDb } = require("./src/db");
const prisma = require("./src/prisma");

const endpoints = [
  {
    path: "/health",
    validate: (body) => body.status === "ok",
  },
  {
    path: "/api/stats",
    validate: (body) =>
      body.stats &&
      [
        "users_joined",
        "businesses_listed",
        "reviews_submitted",
        "verified_reviews",
      ].every((key) => typeof body.stats[key] === "number"),
  },
  {
    path: "/api/companies",
    validate: (body) => Array.isArray(body.companies),
  },
  {
    path: "/api/companies/categories",
    validate: (body) => Array.isArray(body.categories),
  },
];

function requestJson(baseUrl, path) {
  return fetch(`${baseUrl}${path}`, {
    signal: AbortSignal.timeout(10000),
  }).then(async (response) => {
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`${path} returned HTTP ${response.status}`);
    }
    return body;
  });
}

async function main() {
  let server;
  let db;

  try {
    db = await getDb();
    await db.query("SELECT 1");
    await initDb();

    server = http.createServer(app);
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : null;
    if (!port) throw new Error("Smoke-test server did not receive a port");

    const baseUrl = `http://127.0.0.1:${port}`;
    for (const endpoint of endpoints) {
      const body = await requestJson(baseUrl, endpoint.path);
      if (!endpoint.validate(body)) {
        throw new Error(
          `${endpoint.path} returned an unexpected response shape`,
        );
      }
      console.log(`PASS ${endpoint.path}`);
    }

    console.log("API smoke test passed");
  } catch (error) {
    console.error(
      `API smoke test failed: ${error.message}. Ensure PostgreSQL is running and DATABASE_URL is correct in backend/.env.`,
    );
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await prisma.$disconnect().catch(() => undefined);
    if (db) await db.end().catch(() => undefined);
  }
}

main();
