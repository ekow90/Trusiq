function parseDocumentDataUrl(documentData) {
  if (typeof documentData !== "string") {
    throw new Error("Each document must be a valid file upload.");
  }

  const match =
    /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(
      documentData,
    );

  if (!match) {
    throw new Error("Each document must be a valid PDF, JPG, or PNG upload.");
  }

  const mimeType = match[1].toLowerCase();
  const base64Payload = match[2];
  const sizeBytes = Math.ceil((base64Payload.length * 3) / 4);

  if (!/[\/](pdf|jpeg|jpg|png)$/.test(mimeType)) {
    throw new Error("Documents must be valid PDF, JPG, or PNG files.");
  }

  if (sizeBytes > 20 * 1024 * 1024) {
    throw new Error("Each document must be smaller than 20 MB.");
  }

  return {
    mimeType,
    sizeBytes,
    data: documentData,
  };
}

function validateVerificationDocuments(documents) {
  if (
    !Array.isArray(documents) ||
    documents.length === 0 ||
    documents.length > 3
  ) {
    throw new Error("Submit between 1 and 3 documents");
  }

  return documents.map((document, index) => {
    if (!document || !document.type || typeof document.data !== "string") {
      throw new Error(`Document ${index + 1} is invalid.`);
    }

    const parsed = parseDocumentDataUrl(document.data);
    return {
      ...document,
      type: String(document.type),
      ...parsed,
    };
  });
}

module.exports = {
  validateVerificationDocuments,
  parseDocumentDataUrl,
};
