const { ethers } = require("hardhat");

async function main() {
  console.log("Déploiement des smart contracts JuryDoX...");

  // Déploiement du contrat principal
  const JuryDoX = await ethers.getContractFactory("JuryDoX");
  console.log("Déploiement de JuryDoX...");
  const juryDoX = await JuryDoX.deploy();
  // Ethers v6 : deploy() est déjà résolu lors du déploiement
  console.log("✅ JuryDoX déployé à l'adresse:", juryDoX.target || juryDoX.address);

  // Vérification du déploiement
  const owner = await juryDoX.owner();
  console.log("Propriétaire du contrat:", owner);

  // Sauvegarde des adresses pour l'intégration frontend
  const deploymentInfo = {
    network: network.name,
    juryDoX: juryDoX.address,
    documentManager: await juryDoX.documentManager(),
    juryVoting: await juryDoX.juryVoting(),
    auditTrail: await juryDoX.auditTrail(),
    deployedAt: new Date().toISOString(),
    deployer: owner
  };

  console.log("\n📋 Informations de déploiement:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Sauvegarde dans un fichier
  const fs = require("fs");
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Informations sauvegardées dans deployment.json");

  console.log("\n🎉 Déploiement terminé avec succès!");
  console.log("Prochaine étape: Intégration avec le frontend React");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });