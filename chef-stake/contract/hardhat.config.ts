import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY = "3630a2e3f2a84bf997ab2d931011233b";
const SEPOLIA_PRIVATE_KEY = "";
const ETHERSCAN_API_KEY = "mAmWJvdlz8GbFEKlrBzkoP+SV6yEVYmc5DmkKJVBXOc2WJ7mG0SCWQ";
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://sepolia.infura.io/v3/" + INFURA_API_KEY,
      accounts: [`${SEPOLIA_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
