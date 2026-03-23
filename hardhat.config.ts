import 'dotenv/config';
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

const privateKey = process.env.PRIVATE_KEY;

const config = defineConfig({
  plugins: [hardhatEthers],
  solidity: "0.8.24",
  networks: {
    sepolia: {
      type: "http",
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: privateKey ? [privateKey] : [],
    },
  },
});

export default config;
