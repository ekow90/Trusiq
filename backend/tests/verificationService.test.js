const test = require("node:test");
const assert = require("node:assert/strict");

const {
  validateVerificationDocuments,
} = require("../src/services/verificationService");

test("validateVerificationDocuments accepts valid PDF and image uploads", () => {
  const docs = [
    {
      type: "Business License",
      data: "data:application/pdf;base64,JVBERi0xLjQK",
      name: "license.pdf",
    },
    {
      type: "Government Issued ID",
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAA",
      name: "id.png",
    },
  ];

  const result = validateVerificationDocuments(docs);
  assert.equal(result.length, 2);
  assert.equal(result[0].mimeType, "application/pdf");
  assert.equal(result[1].mimeType, "image/png");
});

test("validateVerificationDocuments rejects unsupported document types and oversized files", () => {
  const validDocs = [
    {
      type: "Business License",
      data: "data:image/webp;base64,AAAA",
      name: "license.webp",
    },
  ];

  assert.throws(
    () => validateVerificationDocuments(validDocs),
    /valid PDF, JPG, or PNG/i,
  );

  const oversized = [
    {
      type: "Business License",
      data: `data:application/pdf;base64,${"A".repeat(27 * 1024 * 1024)}`,
      name: "oversized.pdf",
    },
  ];

  assert.throws(
    () => validateVerificationDocuments(oversized),
    /smaller than 20 MB/i,
  );
});
