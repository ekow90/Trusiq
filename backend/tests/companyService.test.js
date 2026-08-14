const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createCompany,
  listCompanies,
  findCompanyBySlug,
} = require("../src/services/companyService");

test("createCompany stores a real business profile", async () => {
  const company = await createCompany({
    ownerId: "owner-company-test",
    name: "Nile Fresh Market",
    category: "Retail",
    location: "Accra, Ghana",
    website: "https://nilefresh.example",
    phone: "+233 20 000 0000",
    description: "Fresh food and everyday essentials.",
  });

  assert.equal(company.name, "Nile Fresh Market");
  assert.equal(company.category, "Retail");
  assert.match(company.slug, /nile-fresh-market/);
  assert.equal(company.ownerId, "owner-company-test");
});

test("listCompanies returns saved business records", async () => {
  const companies = await listCompanies();
  assert.ok(Array.isArray(companies));
  assert.ok(companies.some((company) => company.name === "Nile Fresh Market"));
});

test("findCompanyBySlug loads a single business profile", async () => {
  const company = await findCompanyBySlug("nile-fresh-market");
  assert.ok(company);
  assert.equal(company.name, "Nile Fresh Market");
});
