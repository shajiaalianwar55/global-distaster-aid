const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts to", hre.network.name);

  // USDC token address on Base Sepolia
  // Update this with the actual USDC token address for your network
  const USDC_TOKEN_ADDRESS = process.env.USDC_TOKEN_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // Deploy VerificationBadge contract
  console.log("Deploying VerificationBadge...");
  const VerificationBadge = await hre.ethers.getContractFactory("VerificationBadge");
  const verificationBadge = await VerificationBadge.deploy();
  await verificationBadge.waitForDeployment();
  const badgeAddress = await verificationBadge.getAddress();
  console.log("VerificationBadge deployed to:", badgeAddress);

  // Deploy DonationContract
  console.log("Deploying DonationContract...");
  const DonationContract = await hre.ethers.getContractFactory("DonationContract");
  const donationContract = await DonationContract.deploy(USDC_TOKEN_ADDRESS);
  await donationContract.waitForDeployment();
  const donationAddress = await donationContract.getAddress();
  console.log("DonationContract deployed to:", donationAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("VerificationBadge:", badgeAddress);
  console.log("DonationContract:", donationAddress);
  console.log("USDC Token:", USDC_TOKEN_ADDRESS);
  console.log("\nUpdate these addresses in:");
  console.log("- mobile/constants/config.ts");
  console.log("- backend/.env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

