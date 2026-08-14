const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middleware/auth");
const { findUserByEmail, createUser } = require("../services/userService");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "trusiq-dev-secret-change-me";

router.get("/me", authenticateToken, async (req, res) => {
  const user = req.user || {};
  return res.json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    id: user.id,
    name: user.name,
    roles: user.roles,
    companyId: user.companyId,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: "12h" });
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

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Email, password, and name are required" });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const userExists = await findUserByEmail(normalizedEmail);
  if (userExists) {
    return res.status(409).json({ error: "User already exists" });
  }

  try {
    const user = await createUser({
      id: id || `user-${Date.now()}`,
      email: normalizedEmail,
      password,
      name,
      roles,
      companyId,
    });

    const payload = {
      id: user.id,
      name: user.name,
      roles: user.roles,
      companyId: user.companyId,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "12h" });
    return res.status(201).json({ token, user: payload });
  } catch (error) {
    return res.status(500).json({ error: "Could not create user" });
  }
});

module.exports = router;
