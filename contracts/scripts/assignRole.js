const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Read the deployed contract address from our config
    const configPath = path.join(__dirname, "..", "..", "src", "config", "contracts.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!config.contractAddress) {
        throw new Error("Contract address not found. Did you run the deploy script?");
    }

    // Address and Role from the command line arguments
    const userAddress = process.env.USER_ADDRESS;
    const roleName = process.env.ROLE_NAME;

    if (!userAddress || !roleName) {
        console.error("❌ Please provide USER_ADDRESS and ROLE_NAME environment variables.");
        console.error("Example: USER_ADDRESS=0x123... ROLE_NAME=Lawyer npx hardhat run scripts/assignRole.js --network localhost");
        process.exit(1);
    }

    // Convert role string to Enum ID: 1=Secretary, 2=Jury, 3=Lawyer
    const roleMap = {
        "Secretary": 1,
        "Jury": 2,
        "Lawyer": 3
    };

    const roleId = roleMap[roleName];
    if (!roleId) {
        console.error(`❌ Invalid role: ${roleName}. Must be 'Secretary', 'Jury', or 'Lawyer'`);
        process.exit(1);
    }

    // Connect to the deployed contract using the Owner account (Account #0)
    const JuryDoX = await ethers.getContractFactory("JuryDoX");
    const juryDoX = JuryDoX.attach(config.contractAddress);

    console.log(`⏳ Assigning role '${roleName}' to ${userAddress}...`);

    // Send the transaction
    const tx = await juryDoX.assignRole(userAddress, roleId);
    await tx.wait(); // Wait for it to be confirmed on the blockchain

    console.log(`✅ Success! ${userAddress} is now a ${roleName}.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Failed:", error);
        process.exit(1);
    });
