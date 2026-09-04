const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "trusiq-dev-secret-change-me";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required in production",
  );
}

function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, SECRET, {
      issuer: ["trusiq", "trusiq-admin"],
    });
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken };
