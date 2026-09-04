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

app.use(cors());
app.use(express.json({ limit: "110mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/oauth", oauthRouter);
app.use("/api/stats", statsRouter);
app.use("/api/companies", companyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/trust", authenticateToken, trustRouter);

module.exports = app;
