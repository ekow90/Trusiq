const express = require("express");
const jwt = require("jsonwebtoken");
const { normalizeSocialUser } = require("../services/socialAuth");
const { upsertSocialUser } = require("../services/userService");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;
if (!SECRET)
  throw new Error("FATAL: JWT_SECRET environment variable is required");

function issueToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      roles: user.roles,
      companyId: user.companyId,
    },
    SECRET,
    { expiresIn: "12h", issuer: "trusiq" },
  );
}

async function handleSocialLogin(req, res, provider) {
  try {
    const profile = normalizeSocialUser(provider, req.body || {});

    if (!profile.email) {
      return res
        .status(400)
        .json({ error: "Social sign-in profile is missing an email" });
    }

    const user = await upsertSocialUser({
      provider: profile.provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      roles: ["customer"],
    });

    const token = issueToken(user);
    return res.status(200).json({
      token,
      user: {
        ...user,
        id: user.id,
        name: user.name,
        roles: user.roles,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Could not complete social sign-in" });
  }
}

router.post("/google/login", (req, res) =>
  handleSocialLogin(req, res, "google"),
);
router.post("/microsoft/login", (req, res) =>
  handleSocialLogin(req, res, "microsoft"),
);
router.post("/apple/login", (req, res) => handleSocialLogin(req, res, "apple"));

router.get("/google", (req, res) => {
  res.json({
    provider: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    ready: true,
  });
});

router.get("/microsoft", (req, res) => {
  res.json({
    provider: "microsoft",
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    ready: true,
  });
});

router.get("/apple", (req, res) => {
  res.json({
    provider: "apple",
    authUrl: "https://appleid.apple.com/auth/authorize",
    ready: true,
  });
});

module.exports = router;
