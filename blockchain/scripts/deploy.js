const hre = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const ReviewAnchor = await hre.ethers.getContractFactory("ReviewAnchor");
  const reviewAnchor = await ReviewAnchor.deploy();
  await reviewAnchor.waitForDeployment();
  const address = await reviewAnchor.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const artifact = await hre.artifacts.readArtifact("ReviewAnchor");
  const deployment = {
    network: hre.network.name,
    chainId: network.chainId.toString(),
    contractName: "ReviewAnchor",
    address,
    deployer: (await hre.ethers.getSigners())[0].address,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };
  const outputPath = path.join(
    __dirname,
    "..",
    "deployments",
    "local",
    "ReviewAnchor.json",
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(deployment, null, 2)}\n`);
  console.log(`ReviewAnchor deployed to ${address}`);
  console.log(`Deployer: ${deployment.deployer}`);
  console.log(`Deployment artifact: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
