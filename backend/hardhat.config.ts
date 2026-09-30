import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    amoy: {
      type: "http",
      url: process.env.POLYGON_AMOY_RPC ?? "https://rpc-amoy.polygon.technology/",
      accounts: /^0x[0-9a-fA-F]{64}$/.test(process.env.PRIVATE_KEY ?? "")
        ? [process.env.PRIVATE_KEY as string]
        : [],
    },
  },
});
