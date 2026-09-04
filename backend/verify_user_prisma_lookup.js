const assert = require("node:assert/strict");
const { findUserByEmail, findUserById } = require("./src/services/userService");

const users = [
  {
    id: "customer-1",
    email: "customer@example.com",
    fullName: "Customer User",
    passwordHash: "hash-customer",
    role: "customer",
    roles: '["customer"]',
    companyId: null,
    accountStatus: "active",
  },
  {
    id: "owner-1",
    email: "owner@example.com",
    fullName: "Owner User",
    passwordHash: "hash-owner",
    role: "owner",
    roles: '["owner"]',
    companyId: "business-1",
    accountStatus: "active",
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    fullName: "Admin User",
    passwordHash: "hash-admin",
    role: "admin",
    roles: '["admin"]',
    companyId: null,
    accountStatus: "active",
  },
  {
    id: "malformed-1",
    email: "malformed@example.com",
    fullName: "Malformed Roles",
    passwordHash: "hash-malformed",
    role: "customer",
    roles: "not-json",
    companyId: null,
    accountStatus: "active",
  },
];

const prismaMock = {
  user: {
    findUnique: async ({ where }) =>
      users.find(
        (user) => user.email === where.email || user.id === where.id,
      ) || null,
  },
};

async function main() {
  const customer = await findUserByEmail(" CUSTOMER@EXAMPLE.COM ", prismaMock);
  assert.deepEqual(customer.roles, ["customer"]);
  assert.equal(customer.name, "Customer User");

  const owner = await findUserByEmail("owner@example.com", prismaMock);
  assert.deepEqual(owner.roles, ["owner"]);
  assert.equal(owner.companyId, "business-1");

  const admin = await findUserById("admin-1", prismaMock);
  assert.deepEqual(admin.roles, ["admin"]);

  const malformed = await findUserByEmail("malformed@example.com", prismaMock);
  assert.deepEqual(malformed.roles, ["not-json"]);

  console.log("Prisma user lookup verification passed");
}

main().catch((error) => {
  console.error("Prisma user lookup verification failed:", error);
  process.exitCode = 1;
});
