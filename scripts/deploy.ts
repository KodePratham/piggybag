import hre from "hardhat";

const { ethers } = hre;

async function main() {
  console.log("Deploying EventTicketing contract to Monad Testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MON");

  // Deploy EventTicketing contract
  const EventTicketing = await ethers.getContractFactory("EventTicketing");
  const eventTicketing = await EventTicketing.deploy();

  await eventTicketing.waitForDeployment();

  const contractAddress = await eventTicketing.getAddress();
  console.log("EventTicketing deployed to:", contractAddress);
  console.log("Admin address:", deployer.address);

  console.log("\n📝 Add these to your .env file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_ADMIN_ADDRESS=${deployer.address}`);

  console.log("\n🔍 Verify contract with:");
  console.log(`npx hardhat verify --network monadTestnet ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
