const express = require("express");
const cors = require("cors");

const trustRouter = require("./routes/trust");
const authRouter = require("./routes/auth");
const companyRouter = require("./routes/company");
const aiRouter = require("./routes/ai");
const oauthRouter = require("./routes/oauth");
const { authenticateToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json({ limit: "110mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/oauth", oauthRouter);
app.use("/api/companies", companyRouter);
app.use("/api/ai", aiRouter);
app.use("/api/trust", authenticateToken, trustRouter);

module.exports = app;
