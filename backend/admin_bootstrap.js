require("dotenv").config();
const { getDb, initDb, ensureAdminAccount } = require("./src/db");

async function main() {
  await initDb();
  const db = await getDb();
  const result = await ensureAdminAccount(db, { strict: true });
  console.log("Admin account successfully created/updated.");
  console.log(`Admin email: ${result.email}`);
  console.log(`Admin user ID: ${result.userId}`);
  console.log(
    `Password: ${result.passwordUpdated ? "updated successfully" : "unchanged"}`,
  );
  await db.end();
}

main().catch((error) => {
  console.error(`Admin bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
