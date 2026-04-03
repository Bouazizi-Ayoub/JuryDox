# Smart Contracts - JuryDoX

## 📋 Vue d'ensemble

Les smart contracts suivants ont été créés pour JuryDoX, un système de gestion de documents légaux décentralisé :

- **DocumentManager.sol** - Gestion des documents avec versioning
- **JuryVoting.sol** - Système de vote multi-jury
- **AuditTrail.sol** - Historique complet des actions
- **JuryDoX.sol** - Contrat principal intégrant tous les modules

## 🏗️ Architecture

```
JuryDoX (Principal)
├── DocumentManager (Documents)
├── JuryVoting (Votes)
└── AuditTrail (Historique)
```

## 🚀 Déploiement

### Prérequis
- Node.js
- Hardhat ou Truffle
- Compilateur Solidity ^0.8.19

### Installation
```bash
npm install -g hardhat
cd contracts
npx hardhat init
```

### Configuration Hardhat
Créez `hardhat.config.js` :
```javascript
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Script de déploiement
Créez `scripts/deploy.js` :
```javascript
const { ethers } = require("hardhat");

async function main() {
  const JuryDoX = await ethers.getContractFactory("JuryDoX");
  const juryDoX = await JuryDoX.deploy();
  await juryDoX.deployed();

  console.log("JuryDoX deployed to:", juryDoX.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Déploiement
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 📖 Utilisation

### 1. Assignation des rôles
```javascript
// Assigner un secrétaire
await juryDoX.assignRole(secretaryAddress, 1); // 1 = Secretary

// Assigner un jury
await juryDoX.assignRole(juryAddress, 2); // 2 = Jury

// Assigner un avocat
await juryDoX.assignRole(lawyerAddress, 3); // 3 = Lawyer
```

### 2. Création d'un document
```javascript
const tx = await juryDoX.createDocument(
  "Contrat Commercial",
  "Contrat de service entre parties",
  "QmHashDuDocumentIPFS"
);
const receipt = await tx.wait();
const documentId = receipt.events[0].args.documentId;
```

### 3. Vote sur un document
```javascript
// Approuver
await juryDoX.voteOnDocument(documentId, true, "");

// Rejeter avec commentaire
await juryDoX.voteOnDocument(documentId, false, "Signature manquante");
```

### 4. Resoumission d'un document
```javascript
await juryDoX.resubmitDocument(
  documentId,
  "QmNouveauHashIPFS"
);
```

### 5. Consultation des données
```javascript
// Obtenir un document
const doc = await juryDoX.getDocument(documentId);

// Obtenir l'historique d'audit
const audit = await juryDoX.getAuditTrail(documentId);

// Statistiques
const stats = await juryDoX.getDocumentStats();
```

## 🔐 Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **Owner** | Assigner les rôles, gérer les contrats |
| **Secretary** | Créer des documents, les resoumettre |
| **Jury** | Voter sur les documents |
| **Lawyer** | Consulter les statistiques (lecture seule) |

## 📊 Événements

### DocumentManager
- `DocumentCreated(uint256 documentId, address secretary)`
- `DocumentUpdated(uint256 documentId, uint256 newVersion)`
- `DocumentVoted(uint256 documentId, address jury, bool approve)`
- `DocumentRejected(uint256 documentId, string reason)`

### JuryVoting
- `VoteSessionCreated(uint256 sessionId, uint256 documentId)`
- `VoteCast(uint256 sessionId, address jury, bool approve)`
- `VoteSessionClosed(uint256 sessionId, VoteResult result)`

### AuditTrail
- `AuditEntryAdded(uint256 documentId, address actor, ActionType action, uint256 entryId)`

## 🧪 Tests

### Tests unitaires
```bash
npx hardhat test
```

Exemple de test dans `test/JuryDoX.js` :
```javascript
const { expect } = require("chai");

describe("JuryDoX", function () {
  it("Should create a document", async function () {
    const JuryDoX = await ethers.getContractFactory("JuryDoX");
    const juryDoX = await JuryDoX.deploy();
    await juryDoX.deployed();

    await juryDoX.assignRole(owner.address, 1); // Secretary
    await juryDoX.createDocument("Test", "Description", "QmHash");

    const doc = await juryDoX.getDocument(1);
    expect(doc.title).to.equal("Test");
  });
});
```

## 🔗 Intégration Frontend

### Connexion avec ethers.js
```javascript
import { ethers } from 'ethers';

// Connexion au contrat
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const juryDoX = new ethers.Contract(contractAddress, abi, signer);

// Utilisation
const documentId = await juryDoX.createDocument(title, description, ipfsHash);
```

### Écoute des événements
```javascript
juryDoX.on("DocumentCreated", (documentId, secretary) => {
  console.log(`Document ${documentId} créé par ${secretary}`);
});
```

## 📈 Métriques et Analytics

### Statistiques disponibles
- Nombre total de documents
- Documents en attente/approuvés/rejetés
- Sessions de vote actives/terminées
- Historique d'audit complet

### Requêtes analytics
```javascript
const docStats = await juryDoX.getDocumentStats();
const voteStats = await juryDoX.getVotingStats();
```

## 🚨 Sécurité

### Modificateurs utilisés
- `onlyOwner` - Actions administrateur
- `onlyRole(Role)` - Vérification des rôles
- `onlyAuthorized` - Contrats autorisés

### Bonnes pratiques
- Validation des entrées
- Protection contre les reentrancy
- Gestion des erreurs appropriée
- Événements pour la traçabilité

## 🔄 Mises à jour futures

### Phase 1 (Data Persistence)
- Intégration avec IPFS pour le stockage
- Amélioration des métadonnées

### Phase 2 (Multi-chain)
- Support pour plusieurs blockchains
- Bridges cross-chain

### Phase 3 (DAO Governance)
- Gouvernance décentralisée
- Votes communautaires

## 📞 Support

Pour toute question concernant les smart contracts :
1. Vérifiez la documentation inline dans les fichiers
2. Consultez les tests pour des exemples d'utilisation
3. Référez-vous au roadmap pour les futures améliorations

---

**Version**: 1.0.0  
**Solidity**: ^0.8.19  
**License**: MIT