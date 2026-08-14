function normalizeSocialUser(provider, profile = {}) {
  const providerName = String(provider || "").toLowerCase();

  if (providerName === "google") {
    return {
      provider: "google",
      providerUserId: profile.sub || profile.id || "",
      email: String(profile.email || "")
        .trim()
        .toLowerCase(),
      name: String(profile.name || profile.given_name || "User").trim(),
      avatar: profile.picture || null,
      emailVerified: Boolean(profile.email_verified),
    };
  }

  if (providerName === "microsoft") {
    const email = String(
      profile.mail || profile.userPrincipalName || profile.email || "",
    )
      .trim()
      .toLowerCase();

    return {
      provider: "microsoft",
      providerUserId: profile.id || profile.oid || "",
      email,
      name: String(
        profile.displayName ||
          [profile.givenName, profile.surname].filter(Boolean).join(" ") ||
          email.split("@")[0] ||
          "User",
      ).trim(),
      avatar: profile.avatar || null,
      emailVerified: Boolean(profile.email_verified),
    };
  }

  if (providerName === "apple") {
    return {
      provider: "apple",
      providerUserId: profile.sub || profile.id || "",
      email: String(profile.email || "")
        .trim()
        .toLowerCase(),
      name: String(profile.name || profile.fullName || "User").trim(),
      avatar: profile.picture || null,
      emailVerified: Boolean(profile.email_verified),
    };
  }

  return {
    provider: providerName,
    providerUserId: profile.id || profile.sub || "",
    email: String(profile.email || "")
      .trim()
      .toLowerCase(),
    name: String(profile.name || "User").trim(),
    avatar: profile.picture || null,
    emailVerified: Boolean(profile.email_verified),
  };
}

module.exports = {
  normalizeSocialUser,
};
