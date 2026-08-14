const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeSocialUser } = require("../src/services/socialAuth");

test("normalizeSocialUser converts Google profile data into a common user object", () => {
  const user = normalizeSocialUser("google", {
    sub: "google-123",
    email: "someone@gmail.com",
    name: "Someone Example",
    picture: "https://example.com/avatar.png",
    email_verified: true,
  });

  assert.equal(user.provider, "google");
  assert.equal(user.providerUserId, "google-123");
  assert.equal(user.email, "someone@gmail.com");
  assert.equal(user.name, "Someone Example");
  assert.equal(user.avatar, "https://example.com/avatar.png");
});

test("normalizeSocialUser converts Microsoft and Apple payloads consistently", () => {
  const microsoft = normalizeSocialUser("microsoft", {
    id: "ms-456",
    mail: "person@company.com",
    displayName: "Person Example",
    userPrincipalName: "person@company.com",
    givenName: "Person",
    surname: "Example",
    businessPhones: ["+123"],
  });

  const apple = normalizeSocialUser("apple", {
    sub: "apple-789",
    email: "ios@example.com",
    name: "Apple User",
    email_verified: true,
  });

  assert.equal(microsoft.provider, "microsoft");
  assert.equal(microsoft.email, "person@company.com");
  assert.equal(microsoft.name, "Person Example");

  assert.equal(apple.provider, "apple");
  assert.equal(apple.providerUserId, "apple-789");
  assert.equal(apple.email, "ios@example.com");
});
