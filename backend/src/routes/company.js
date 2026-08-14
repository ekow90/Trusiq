const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { updateUserCompanyId } = require("../services/userService");
const {
  createCompany,
  listCompanies,
  findCompanyBySlug,
} = require("../services/companyService");

const router = express.Router();

router.get("/", async (req, res) => {
  const companies = await listCompanies();
  return res.json({ companies });
});

router.get("/:slug", async (req, res) => {
  const company = await findCompanyBySlug(req.params.slug);
  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  return res.json({ company });
});

router.post("/register", authenticateToken, async (req, res) => {
  try {
    const { name, category, location, website, phone, description } =
      req.body || {};
    const user = req.user;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Business name is required" });
    }

    const company = await createCompany({
      ownerId: user?.id || null,
      name,
      category,
      location,
      website,
      phone,
      description,
    });

    if (user?.id) {
      await updateUserCompanyId(user.id, company.id);
    }

    return res.status(201).json({ company });
  } catch (error) {
    return res
      .status(400)
      .json({ error: error.message || "Could not create business account" });
  }
});

module.exports = router;
