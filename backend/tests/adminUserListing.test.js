const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeAdminUserList } = require("../src/services/userService");

test("normalizeAdminUserList expands stored roles and keeps account metadata", () => {
  const rows = [
    {
      id: "user-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      role: "owner",
      roles: '["owner","customer"]',
      company_id: "company-1",
      account_status: "active",
      email_verified: true,
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ];

  const users = normalizeAdminUserList(rows);
  assert.equal(users[0].roles.length, 2);
  assert.deepEqual(users[0].roles, ["owner", "customer"]);
  assert.equal(users[0].status, "active");
  assert.equal(users[0].accountType, "owner");
  assert.equal(users[0].emailVerified, true);
});
