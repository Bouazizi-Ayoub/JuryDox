# JuryDoX - Advanced Document Management dApp

## Overview
JuryDoX est une dApp décentralisée pour la gestion de documents légaux avec un système de révision par jury. Cette version inclut des fonctionnalités avancées pour du testing local et un futur déploiement blockchain.

## ✨ Fonctionnalités Implémentées

### 1. **Gestion des Refus avec Commentaire Obligatoire**
- ✅ Les jurés doivent fournir un commentaire quand ils rejettent un document
- ✅ Stockage du `status="rejected"`, `rejectionComment`, `reviewedAt`
- ✅ Affichage du commentaire côté Secretary pour action corrective

### 2. **Workflow Avancé des Statuts**
Statuts disponibles:
- `pending` - Document soumis, en attente de révision
- `under_review` - Au moins un juré a voté
- `approved` - Consensus pour approbation atteint
- `rejected` - Consensus pour rejet atteint
- `resubmitted` - Version réactualisée après rejet

### 3. **Versioning des Documents**
- ✅ Structure: `{ version: number, previousVersions: [...] }`
- ✅ Secretary peut réuploader après rejet
- ✅ Historique complet des versions maintenu
- ✅ Chaque version a son propre IPFS hash et statut

### 4. **Historique des Actions (Audit Trail)**
Chaque document stocke un `auditTrail` avec:
```javascript
{
  action: 'upload|approve|reject|resubmit',
  user: walletAddress,
  date: timestamp,
  comment: string
}
```

### 5. **Notifications en Temps Réel**
- ✅ Component `NotificationCenter` global
- ✅ Notifications pour: succès, erreurs, infos
- ✅ Auto-dismiss après 5 secondes
- ✅ Système de queue sans limite

### 6. **Voting Multi-Jury**
- ✅ Structure: `votes: [{ juryAddress, vote: 'approve'|'reject', comment, timestamp }]`
- ✅ Décision par consensus (majorité)
- ✅ Chaque juré peut voter une seule fois
- ✅ Signature des transactions avec MetaMask

### 7. **Recherche et Filtres**
- ✅ Recherche par: nom de document, ID, hash IPFS
- ✅ Filtres par statut: pending, under_review, approved, rejected
- ✅ Filtrage par plage de dates
- ✅ Intégration dans tous les dashboards

### 8. **Dashboard Analytique**
Page `/analytics` avec:
- ✅ Statistiques globales (total, % approved/rejected/pending)
- ✅ Document versioning average
- ✅ Jury voting metrics
- ✅ Rejection quality (% with comments)
- ✅ This week/This month metrics
- ✅ Visual progress bars

### 9. **Préparation Blockchain**
Champs prêts pour Web3 integration:
```javascript
{
  ipfsHash: string,              // Mock: Qm...
  walletAddress: string,          // Secretary address
  signature: string,              // Mock: 0x...
  txHash: string                  // Mock: Transaction hash
}
```

## 📁 Structure du Projet

```
src/
├── context/
│   └── Web3Context.jsx          # Enhanced context (novo + improvements)
├── components/
│   ├── Navbar.jsx
│   └── NotificationCenter.jsx   # NEW: Global notifications
├── pages/
│   ├── SecretaryDashboard.jsx   # Enhanced with versioning + resubmit
│   ├── JuryDashboard.jsx        # Enhanced with multi-voting
│   ├── LawyerDashboard.jsx      # Unchanged
│   └── AnalyticsDashboard.jsx   # NEW: Full analytics
├── App.jsx                      # Updated with new routes
└── main.jsx
```

## 🧪 Testing Local

### Roles Based on Wallet Address
Le système assigne des rôles basés sur le dernier caractère de l'adresse:
- `0-5` → Secretary
- `6-b` → Jury
- `c-f` → Lawyer

### Local Testing Setup

1. **Démarrer le serveur dev:**
```bash
npm run dev
```

2. **Connecter MetaMask avec des comptes de test:**
   - Utiliser les comptes de test fournis par MetaMask
   - Le dernier caractère de l'adresse détermine le rôle

3. **Workflow de Test:**
   - Secretary: Upload document
   - Jury: Review et vote (avec commentaire obligatoire si rejet)
   - Secretary: Voir le résultat, resubmit si nécessaire
   - Analytics: Voir statistiques

## 🔐 Données Stockées (Mock)

### Document Structure Complète
```javascript
{
  id: string,                    // Unix timestamp
  name: string,                  // File name
  bytes: number,                 // File size
  uploadedBy: string,            // Secretary wallet
  version: number,               // Current version
  previousVersions: [{          // Versioning history
    version: number,
    ipfsHash: string,
    timestamp: string,
    status: string
  }],
  status: string,               // pending|under_review|approved|rejected|resubmitted
  ipfsHash: string,             // Mock IPFS hash (Qm...)
  walletAddress: string,        // Secretary address
  signature: string,            // Mock signature (0x...)
  txHash: string,               // Mock transaction hash
  reviewedAt: string,           // Approval/Rejection timestamp
  rejectionComment: string,     // Mandatory when rejected
  votes: [{                     // Multi-jury voting
    juryAddress: string,
    vote: string,               // 'approve' or 'reject'
    comment: string,            // Required for reject
    timestamp: string
  }],
  auditTrail: [{               // Complete action history
    action: string,            // 'upload', 'approve', 'reject', 'resubmit'
    user: string,             // Who performed the action
    date: string,             // When
    comment: string           // What and why
  }],
  timestamp: string            // Upload time
}
```

## 📊 API du Web3Context

### State Methods
```javascript
// Document Management
uploadDocument(name, bytes, uploadedBy) → docId
resubmitDocument(docId, newBytes, userAddress)
voteOnDocument(docId, juryAddress, vote, comment)
approveDocument(docId, juryAddress, comment)
rejectDocument(docId, juryAddress, rejectionComment)

// Jury Management
addJuryMember(address) → boolean
removeJuryMember(address)

// Lawyer Management
addLawyer(address) → boolean
removeLawyer(address)

// Search & Filter
searchDocuments(query) → docs[]
filterDocumentsByStatus(status) → docs[]
filterDocumentsByDateRange(start, end) → docs[]

// Analytics
getStats() → {
  total, approved, rejected, pending, underReview,
  approvePercentage, rejectPercentage, pendingPercentage
}

// Notifications
addNotification(type, message, documentId)
```

## 🚀 Next Steps - Blockchain Integration

Pour intégrer avec un smart contract:

1. **Remplacer les mocks par vraies transactions:**
```javascript
// dans voteOnDocument():
const tx = await contract.submitVote(
  docId,
  decision,
  rejectionComment
);
newTxHash = tx.hash;
newSignature = await signer.signMessage(...);
```

2. **Ajouter IPFS réel:**
```javascript
const ipfsHash = await ipfs.add(file);
// au lieu de: generateMockHash('ipfs')
```

3. **Déployer Smart Contract avec:**
   - Multi-signature voting logic
   - Document versioning
   - Audit trail On-chain
   - Access control par rôle

4. **Intégrer avec Polygon/Arbitrum pour mainnet**

## 🎨 UI/UX Features

- **Glass Morphism Design**: Panneaux translucides avec blur
- **Glow Effects**: Texte et icônes avec effets lumineux
- **Responsive Grid**: Auto-layout pour différentes tailles
- **State Badges**: Couleurs cohérentes par statut
- **Smooth Animations**: Fade-in, transitions
- **Dark Mode**: Theme cohérent futuriste

## 📝 Notes pour le Developer

- Toutes les données sont stockées en mémoire-RAM (reset au refresh)
- Pour persistence réelle: ajouter localStorage ou DB
- Les signatures MetaMask sont mocks (utiliser ethers.js pour vrai)
- Les IPFS hashes sont générés aléatoirement (intégrer Pinata/IPFS réel)
- Le consensus est basé sur majorité simple (paramétrable)

## 🔗 Routes Disponibles

```
/                    → Landing page / Dashboard routing
/secretary          → Secretary Dashboard
/jury               → Jury Administration
/lawyer             → Lawyer Dashboard
/analytics          → Global Analytics (public)
```

## 💡 Features Bonus Possibles

- [ ] Export documents en PDF
- [ ] Email notifications
- [ ] Bulk document upload
- [ ] Document categories/tags
- [ ] Jury performance metrics
- [ ] API REST pour frontend alternatif
- [ ] Dark/Light mode toggle
- [ ] Multi-language support

---

**Version**: 1.0.0-beta  
**Created**: 2026-04-02  
**Status**: Ready for Local Testing
