const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middleware/auth");
const { findUserByEmail, createUser } = require("../services/userService");
const {
  listReviewsByUser,
  toLegacyReview,
} = require("../services/reviewService");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "trusiq-dev-secret-change-me";

// Validation helpers
function validateEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) return null;
  return normalized;
}

function validatePassword(password) {
  const pwd = String(password || "").trim();
  if (pwd.length < 6) return null;
  return pwd;
}

function validateName(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed || trimmed.length < 2) return null;
  return trimmed;
}

router.get("/me", authenticateToken, async (req, res) => {
  const user = req.user || {};
  return res.json({ user });
});

router.get("/activity", authenticateToken, async (req, res) => {
  try {
    const reviews = await listReviewsByUser(req.user.id, { limit: 100 });
    return res.json({ reviews: reviews.map(toLegacyReview) });
  } catch (error) {
    return res.status(500).json({ error: "Could not load account activity" });
  }
});

router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const db = await require("../db").getDb();
    const result = await db.query(
      `SELECT id, title, message, is_read, created_at FROM notifications
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.id],
    );
    return res.json({ notifications: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Could not load notifications" });
  }
});

router.patch("/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const db = await require("../db").getDb();
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Could not update notification" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  const validatedEmail = validateEmail(email);
  if (!validatedEmail) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const validatedPassword = validatePassword(password);
  if (!validatedPassword) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  const user = await findUserByEmail(validatedEmail);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (user.roles.includes("admin")) {
    return res.status(403).json({ error: "Use the administrator sign-in" });
  }
  if (user.accountStatus !== "active") {
    return res.status(403).json({ error: "This account is not active" });
  }

  const passwordMatches = await bcrypt.compare(
    validatedPassword,
    user.passwordHash,
  );
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    id: user.id,
    name: user.name,
    roles: user.roles,
    companyId: user.companyId,
  };

  const token = jwt.sign(payload, SECRET, {
    expiresIn: "12h",
    issuer: "trusiq",
  });
  return res.json({ token, user: payload });
});

router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body || {};

  const validatedEmail = validateEmail(email);
  if (!validatedEmail) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const validatedPassword = validatePassword(password);
  if (!validatedPassword) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  const user = await findUserByEmail(validatedEmail);
  if (!user || !user.roles.includes("admin")) {
    return res.status(401).json({ error: "Invalid administrator credentials" });
  }
  if (user.accountStatus !== "active") {
    return res
      .status(403)
      .json({ error: "This administrator account is not active" });
  }

  const passwordMatches = await bcrypt.compare(
    validatedPassword,
    user.passwordHash,
  );
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid administrator credentials" });
  }

  const payload = {
    id: user.id,
    name: user.name,
    roles: ["admin"],
    companyId: user.companyId,
  };
  const token = jwt.sign(payload, SECRET, {
    expiresIn: "30m",
    issuer: "trusiq-admin",
  });
  return res.json({ token, user: payload });
});

router.post("/register", async (req, res) => {
  const {
    id,
    email,
    password,
    name,
    roles = ["customer"],
    companyId = null,
  } = req.body || {};

  const validatedEmail = validateEmail(email);
  if (!validatedEmail) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const validatedPassword = validatePassword(password);
  if (!validatedPassword) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  const validatedName = validateName(name);
  if (!validatedName) {
    return res
      .status(400)
      .json({ error: "Name is required (at least 2 characters)" });
  }

  const userExists = await findUserByEmail(validatedEmail);
  if (userExists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const requestedRoles = Array.isArray(roles) ? roles : ["customer"];
  const safeRoles = requestedRoles.filter(
    (role) => role === "customer" || role === "owner",
  );

  try {
    const user = await createUser({
      id: id || `user-${Date.now()}`,
      email: validatedEmail,
      password: validatedPassword,
      name: validatedName,
      roles: safeRoles.length ? safeRoles : ["customer"],
      companyId,
    });
    const db = await require("../db").getDb();
    await db.query(
      `INSERT INTO platform_stats (stat_key, stat_value) VALUES ('users_joined', 1)
       ON CONFLICT (stat_key) DO UPDATE SET stat_value = platform_stats.stat_value + 1, updated_at = NOW()`,
    );

    const payload = {
      id: user.id,
      name: user.name,
      roles: user.roles,
      companyId: user.companyId,
    };

    const token = jwt.sign(payload, SECRET, {
      expiresIn: "12h",
      issuer: "trusiq",
    });
    return res.status(201).json({ token, user: payload });
  } catch (error) {
    return res.status(500).json({ error: "Could not create user" });
  }
});

module.exports = router;
