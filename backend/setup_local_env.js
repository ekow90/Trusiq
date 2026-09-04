const fs = require("node:fs");
const path = require("node:path");

const backendDirectory = __dirname;
const examplePath = path.join(backendDirectory, ".env.example");
const envPath = path.join(backendDirectory, ".env");

if (fs.existsSync(envPath)) {
  console.log("backend/.env already exists; leaving it unchanged.");
  console.log("Next: run npm run prisma:generate, then npm run smoke:api.");
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error("Cannot create backend/.env: .env.example was not found.");
  process.exit(1);
}

fs.copyFileSync(examplePath, envPath, fs.constants.COPYFILE_EXCL);
console.log("Created backend/.env from .env.example.");
console.log(
  "Next: review local values, run npm run prisma:generate, then npm run smoke:api.",
);
