# Trusiq Blockchain

This folder contains the local Hardhat foundation for anchoring review hashes.
The `ReviewAnchor` contract uses OpenZeppelin `Ownable` so only the configured
deployer can create anchors.

## Local commands

```bash
cd blockchain
npm install
npm run compile
npm test
npm run deploy:local
npm run verify:local-deploy
```

These commands use Hardhat's in-memory network and do not require Polygon,
wallet keys, RPC access, or backend environment variables. Live Polygon
deployment is not configured yet. Never commit private keys or `.env` files.
Local deployment artifacts are written to `deployments/local/` and ignored by
git because Hardhat's in-memory address changes between runs.
