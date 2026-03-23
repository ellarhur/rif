import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect("sepolia");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Rif with account:", deployer.address);

  const RifFactory = await ethers.getContractFactory("Rif");
  const rif = await RifFactory.deploy();
  await rif.waitForDeployment();

  const contractAddress = await rif.getAddress();
  console.log("Rif deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
