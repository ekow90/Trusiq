const express = require("express");
const { getDb } = require("../db");
const { authenticateToken } = require("../middleware/auth");
const { getPlatformStats } = require("../services/platformStatsService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const stats = await getPlatformStats();
    return res.json({ stats });
  } catch (error) {
    console.error("[Stats] Could not load platform stats:", error.message);
    return res.status(500).json({ error: "Could not load platform stats" });
  }
});

router.get("/admin", authenticateToken, async (req, res) => {
  if (!req.user.roles?.includes("admin"))
    return res.status(403).json({ error: "Administrator access required" });
  try {
    const db = await getDb();
    const counts = await db.query(
      `SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM businesses) AS businesses, (SELECT COUNT(*) FROM reviews) AS reviews, (SELECT COUNT(*) FROM review_reports WHERE status = 'pending') AS reports`,
    );
    const queue = await db.query(
      `SELECT vr.id, vr.status, vr.submitted_at, b.business_name FROM verification_requests vr JOIN businesses b ON b.id = vr.business_id WHERE vr.status = 'pending' ORDER BY vr.submitted_at DESC LIMIT 50`,
    );
    const users = await db.query(
      `SELECT id, full_name AS name, email, role, roles, company_id, account_status, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100`,
    );
    return res.json({
      stats: counts.rows[0],
      verificationRequests: queue.rows,
      users: users.rows,
    });
  } catch (error) {
    return res.status(500).json({ error: "Could not load admin overview" });
  }
});

router.get("/admin/users", authenticateToken, async (req, res) => {
  if (!req.user.roles?.includes("admin"))
    return res.status(403).json({ error: "Administrator access required" });

  try {
    const db = await getDb();
    const result = await db.query(
      `SELECT id, full_name AS name, email, role, roles, company_id, account_status, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100`,
    );
    return res.json({ users: result.rows });
  } catch (error) {
    return res.status(500).json({ error: "Could not load users" });
  }
});

module.exports = router;
