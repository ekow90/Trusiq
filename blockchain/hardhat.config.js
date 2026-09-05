require("@nomicfoundation/hardhat-toolbox");

const amoyRpcUrl = process.env.POLYGON_AMOY_RPC_URL || "";
const amoyPrivateKey = process.env.POLYGON_AMOY_PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    amoy: {
      url: amoyRpcUrl,
      chainId: 80002,
      accounts: amoyPrivateKey ? [amoyPrivateKey] : [],
    },
  },
};
