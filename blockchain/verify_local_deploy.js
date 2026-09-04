const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const result = spawnSync(
  process.execPath,
  [
    path.join(
      __dirname,
      "node_modules",
      "hardhat",
      "internal",
      "cli",
      "cli.js",
    ),
    "run",
    "scripts/deploy.js",
    "--network",
    "hardhat",
  ],
  { cwd: __dirname, encoding: "utf8", stdio: "inherit" },
);

if (result.error || result.status !== 0) {
  console.error(
    `Local deployment failed${result.error ? `: ${result.error.message}` : ""}`,
  );
  process.exit(result.status || 1);
}

const deploymentPath = path.join(
  __dirname,
  "deployments",
  "local",
  "ReviewAnchor.json",
);
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const functionNames = deployment.abi
  .filter((item) => item.type === "function")
  .map((item) => item.name);

for (const requiredFunction of [
  "anchorReviewHash",
  "getAnchor",
  "isAnchored",
]) {
  if (!functionNames.includes(requiredFunction)) {
    throw new Error(`Deployment ABI is missing ${requiredFunction}`);
  }
}

if (
  deployment.network !== "hardhat" ||
  deployment.chainId !== "31337" ||
  !/^0x[0-9a-fA-F]{40}$/.test(deployment.address) ||
  !/^0x[0-9a-fA-F]{40}$/.test(deployment.deployer) ||
  !deployment.deployedAt
) {
  throw new Error("Deployment artifact has an unexpected shape");
}

console.log("Local deployment verification passed");
