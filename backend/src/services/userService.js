const bcrypt = require("bcryptjs");
const { getDb, saveDb } = require("../db");
const prisma = require("../prisma");

function parseRoles(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch (error) {
    return [raw];
  }
}

async function createUser({
  id,
  email,
  password,
  name,
  roles = [],
  companyId = null,
}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const db = await getDb();
  const normalizedRoles =
    Array.isArray(roles) && roles.length ? roles : ["customer"];
  const role = normalizedRoles[0] || "customer";

  await db.query(
    `INSERT INTO users (id, email, password_hash, full_name, role, roles, company_id, account_status, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      email.toLowerCase(),
      passwordHash,
      name,
      role,
      JSON.stringify(normalizedRoles),
      companyId,
      "active",
      true,
    ],
  );

  await saveDb();

  return {
    id,
    email: email.toLowerCase(),
    name,
    roles: normalizedRoles,
    companyId,
  };
}

async function findUserByEmail(email, client = prisma) {
  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const row = await client.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        role: true,
        roles: true,
        companyId: true,
        accountStatus: true,
      },
    });
    return normalizeUser(row);
  } catch (error) {
    const db = await getDb();
    const result = await db.query(
      `SELECT id, email, password_hash, full_name AS name, role, roles, company_id, account_status
       FROM users WHERE email = $1`,
      [normalizedEmail],
    );
    return normalizeUser(result.rows[0]);
  }
}

async function findUserById(id, client = prisma) {
  try {
    const row = await client.user.findUnique({
      where: { id: String(id) },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        role: true,
        roles: true,
        companyId: true,
        accountStatus: true,
      },
    });
    return normalizeUser(row);
  } catch (error) {
    const db = await getDb();
    const result = await db.query(
      `SELECT id, email, password_hash, full_name AS name, role, roles, company_id, account_status
       FROM users WHERE id = $1`,
      [String(id)],
    );
    return normalizeUser(result.rows[0]);
  }
}

function normalizeUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name ?? row.fullName,
    roles: parseRoles(row.roles || row.role),
    companyId: row.companyId ?? row.company_id,
    accountStatus: row.accountStatus ?? row.account_status,
    passwordHash: row.passwordHash ?? row.password_hash,
  };
}

async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

function normalizeAdminUserList(rows = []) {
  return rows.map((row) => {
    const roles = parseRoles(row.roles || row.role);
    const normalizedRoles = roles.length ? roles : [row.role || "customer"];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      roles: normalizedRoles,
      role: normalizedRoles[0] || "customer",
      status: row.account_status || row.status || "active",
      accountType: row.role || normalizedRoles[0] || "customer",
      emailVerified: Boolean(row.email_verified ?? row.emailVerified),
      companyId: row.company_id || null,
      createdAt: row.created_at || row.createdAt || null,
    };
  });
}

async function updateUserCompanyId(userId, companyId) {
  const db = await getDb();
  await db.query(
    `UPDATE users SET company_id = $1, updated_at = NOW() WHERE id = $2`,
    [companyId, userId],
  );
  await saveDb();
}

async function upsertSocialUser({
  provider,
  providerUserId,
  email,
  name,
  avatar = null,
  roles = ["customer"],
}) {
  const db = await getDb();
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedName = String(name || "").trim() || normalizedEmail || "User";

  if (!normalizedEmail) {
    throw new Error("Social auth user requires an email");
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    return existingUser;
  }

  const userId = `user-${provider}-${providerUserId || Date.now()}`;
  const created = await createUser({
    id: userId,
    email: normalizedEmail,
    password: `social-${provider}-${providerUserId || Date.now()}`,
    name: normalizedName,
    roles,
    companyId: null,
  });

  await db.query(
    `UPDATE users SET profile_image = $1, email_verified = TRUE, updated_at = NOW() WHERE id = $2`,
    [avatar, userId],
  );

  return {
    ...created,
    profileImage: avatar,
  };
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUserCompanyId,
  upsertSocialUser,
  normalizeAdminUserList,
  parseRoles,
};
