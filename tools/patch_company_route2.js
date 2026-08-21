const fs = require("fs");
const path = "backend/src/routes/company.js";
let s = fs.readFileSync(path, "utf8");
const start = 'router.get("/", async (req, res) => {';
const idx = s.indexOf(start);
if (idx === -1) {
  console.error("start not found");
  process.exit(1);
}
const rest = s.slice(idx);
const endIdx = rest.indexOf("\n});");
if (endIdx === -1) {
  console.error("end not found");
  process.exit(1);
}
const before = s.slice(0, idx);
const after = s.slice(idx + endIdx + 3);
const replacement = `router.get("/", async (req, res) => {\n  try {\n    const { q, category, verified, sort, limit, offset } = req.query || {};\n    const companies = await listCompanies();\n\n    let filtered = companies;\n    if (q) {\n      const ql = String(q).trim().toLowerCase();\n      filtered = filtered.filter((c) => (c.name + ' ' + c.category + ' ' + c.location).toLowerCase().includes(ql));\n    }\n\n    if (category && String(category).trim().toLowerCase() !== "all categories") {\n      filtered = filtered.filter((c) => c.category === category);\n    }\n\n    if (verified === "true") {\n      filtered = filtered.filter((c) => Number(c.trustScore || 0) >= 80);\n    }\n\n    if (sort && String(sort).toLowerCase() === "score") {\n      filtered = filtered.sort((a, b) => b.trustScore - a.trustScore);\n    }\n\n    const lim = Number(limit || 100);\n    const off = Number(offset || 0);\n    const paged = filtered.slice(off, off + lim);\n\n    return res.json({ companies: paged });\n  } catch (error) {\n    return res.status(500).json({ error: "Could not load companies" });\n  }\n});`;

s = before + replacement + after;
fs.writeFileSync(path, s, "utf8");
console.log("patched company route");
