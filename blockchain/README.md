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

## Polygon Amoy (optional)

Amoy deployment is manual and testnet-only. Configure a free-tier RPC URL and
a wallet containing test MATIC before running:

```bash
POLYGON_AMOY_RPC_URL=...
POLYGON_AMOY_PRIVATE_KEY=...
npm run deploy:amoy
```

Never commit the private key. Mainnet and commercial anchoring are not enabled.
The backend requires `BLOCKCHAIN_ANCHORING_ENABLED=true`, the Amoy RPC/key,
and `REVIEW_ANCHOR_CONTRACT_ADDRESS` before it will submit a background
transaction. Without those values it records local intent only.
