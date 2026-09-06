const express = require("express");
const cors = require("cors");

const trustRouter = require("./routes/trust");
const authRouter = require("./routes/auth");
const companyRouter = require("./routes/company");
const aiRouter = require("./routes/ai");
const oauthRouter = require("./routes/oauth");
const statsRouter = require("./routes/stats");
const { authenticateToken } = require("./middleware/auth");
const { analysisQueue } = require("./services/ml/analysisQueue");
const { getDb } = require("./db");

const app = express();

// Initialize ML analysis queue with database connection
getDb()
  .then((db) => {
    try {
      analysisQueue.setDbClient(db);
      console.log("[App] ML analysis queue initialized");
    } catch (error) {
      console.warn("[App] ML analysis queue unavailable:", error.message);
    }
  })
  .catch((err) => {
    console.warn("[App] ML analysis queue unavailable:", err.message);
  });

const localOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];
const configuredOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...localOrigins, ...configuredOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
// Temporary limit preserves current 4-photo/audio/document base64 workflows.
app.use(express.json({ limit: "128mb" }));

app.get("/health", async (req, res) => {
  try {
    const db = await getDb();
    await db.query("SELECT 1");
    return res.json({ status: "ok", database: "ok" });
  } catch (error) {
    return res
      .status(503)
      .json({ status: "degraded", database: "unavailable" });
  }
});
app.use("/api/auth", authRouter);
app.use("/api/oauth", oauthRouter);
app.use("/api/stats", statsRouter);
app.use("/api/companies", companyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/trust", authenticateToken, trustRouter);

module.exports = app;
