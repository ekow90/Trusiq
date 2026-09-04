const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildBusinessLocationSummary,
} = require("../src/services/companyService");

test("buildBusinessLocationSummary combines structured address details into a readable location", () => {
  const summary = buildBusinessLocationSummary({
    addressLine: "123 Main Street",
    neighborhood: "East Legon",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    postalCode: "00233",
  });

  assert.equal(
    summary,
    "123 Main Street, East Legon, Accra, Greater Accra, Ghana 00233",
  );
});

test("buildBusinessLocationSummary keeps only the fields that are present", () => {
  const summary = buildBusinessLocationSummary({
    city: "Kumasi",
    country: "Ghana",
  });

  assert.equal(summary, "Kumasi, Ghana");
});
