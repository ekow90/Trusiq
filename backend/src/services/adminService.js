const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");

function normalizeAdminEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function validateAdminPassword(password) {
  const value = String(password || "");
  return value.length >= 12 ? value : null;
}

function validateAdminUserId(userId) {
  const value = String(userId || "").trim();
  return value && value.length <= 120 && !/\s/.test(value) ? value : null;
}

function readAdminConfig({
  strict = process.env.NODE_ENV === "production",
} = {}) {
  const email = normalizeAdminEmail(process.env.ADMIN_EMAIL);
  const password = validateAdminPassword(process.env.ADMIN_PASSWORD);
  const userId = process.env.ADMIN_USER_ID
    ? validateAdminUserId(process.env.ADMIN_USER_ID)
    : null;

  const missing = [];
  if (!email) missing.push("ADMIN_EMAIL");
  if (!password) missing.push("ADMIN_PASSWORD");
  if (process.env.ADMIN_USER_ID && !userId) missing.push("ADMIN_USER_ID");

  if (missing.length) {
    const message = `Admin bootstrap requires valid environment variables: ${missing.join(", ")}`;
    if (strict) throw new Error(message);
    return null;
  }

  return { email, password, userId };
}

async function ensureAdminAccount(db, options = {}) {
  const config = readAdminConfig(options);
  if (!config) {
    console.warn(
      "[Admin] ADMIN_EMAIL and ADMIN_PASSWORD are not configured; admin bootstrap skipped.",
    );
    return { status: "skipped" };
  }

  const byEmail = await db.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
    [config.email],
  );
  const byId = config.userId
    ? await db.query(
        "SELECT id, email, password_hash FROM users WHERE id = $1 LIMIT 1",
        [config.userId],
      )
    : { rows: [] };
  const existingAdmin = await db.query(
    "SELECT id, email, password_hash FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1",
  );
  const existing =
    byEmail.rows[0] || byId.rows[0] || existingAdmin.rows[0] || null;

  if (existing && config.userId && existing.id !== config.userId) {
    throw new Error(
      "ADMIN_USER_ID differs from the existing admin ID; refusing an unsafe ID change. Preserve references and perform an explicit migration.",
    );
  }

  const adminId =
    existing?.id || config.userId || `admin-${crypto.randomUUID()}`;
  const passwordMatches = existing
    ? await bcrypt.compare(config.password, existing.password_hash)
    : false;
  const passwordHash = passwordMatches
    ? existing.password_hash
    : await bcrypt.hash(config.password, 12);

  await db.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, roles, company_id, account_status, email_verified)
     VALUES ($1, $2, $3, $4, 'admin', $5, NULL, 'active', TRUE)
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       password_hash = EXCLUDED.password_hash,
       role = 'admin',
       roles = EXCLUDED.roles,
       account_status = 'active',
       email_verified = TRUE,
       updated_at = NOW()`,
    [
      adminId,
      "System Administrator",
      config.email,
      passwordHash,
      JSON.stringify(["admin"]),
    ],
  );

  return {
    status: existing ? "updated" : "created",
    email: config.email,
    userId: adminId,
    passwordUpdated: !passwordMatches,
  };
}

module.exports = {
  ensureAdminAccount,
  normalizeAdminEmail,
  readAdminConfig,
  validateAdminPassword,
  validateAdminUserId,
};
