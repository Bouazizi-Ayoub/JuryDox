const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, account1, account2, account3] = await ethers.getSigners();

  console.log("🚀 Deploying JuryDoX contracts...");
  console.log("Deployer:", deployer.address);

  // Deploy the main contract (which deploys sub-contracts)
  const JuryDoX = await ethers.getContractFactory("JuryDoX");
  const juryDoX = await JuryDoX.deploy();
  const contractAddress = juryDoX.target || juryDoX.address;

  console.log("✅ JuryDoX deployed at:", contractAddress);

  // Assign roles to test accounts
  console.log("\n📋 Assigning roles...");

  // Role enum: 0=None, 1=Secretary, 2=Jury, 3=Lawyer
  if (account1) {
    await juryDoX.assignRole(account1.address, 1); // Secretary
    console.log(`  Secretary: ${account1.address}`);
  }
  if (account2) {
    await juryDoX.assignRole(account2.address, 2); // Jury
    console.log(`  Jury:      ${account2.address}`);
  }
  if (account3) {
    await juryDoX.assignRole(account3.address, 3); // Lawyer
    console.log(`  Lawyer:    ${account3.address}`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    documentManager: await juryDoX.documentManager(),
    juryVoting: await juryDoX.juryVoting(),
    auditTrail: await juryDoX.auditTrail(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    roles: {
      secretary: account1?.address || "N/A",
      jury: account2?.address || "N/A",
      lawyer: account3?.address || "N/A",
    },
  };

  // Save to contracts directory
  fs.writeFileSync(
    path.join(__dirname, "..", "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Also save to frontend config
  const frontendConfigPath = path.join(__dirname, "..", "..", "src", "config", "contracts.json");
  const frontendConfig = {
    contractAddress: contractAddress,
    networkName: network.name,
    chainId: network.config?.chainId || 1337,
  };

  try {
    fs.mkdirSync(path.dirname(frontendConfigPath), { recursive: true });
    fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
    console.log("\n💾 Frontend config saved to src/config/contracts.json");
  } catch (err) {
    console.warn("⚠️  Could not save frontend config:", err.message);
  }

  console.log("\n📋 Deployment summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("  1. Import test accounts into MetaMask (private keys from Hardhat node output)");
  console.log("  2. Set VITE_CONTRACT_ADDRESS in .env if not auto-saved");
  console.log("  3. Run: cd .. && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });