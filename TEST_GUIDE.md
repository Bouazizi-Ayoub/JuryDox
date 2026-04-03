# 🧪 Guide de Test Local - JuryDoX

Ce guide vous explique comment tester toutes les fonctionnalités de JuryDoX en local sans blockchain réelle.

## 1. Démarrage du Serveur

```bash
# Le serveur est déjà en cours d'exécution sur http://localhost:5173/
# Pour redémarrer:
npm run dev
```

## 2. Connexion avec MetaMask

### Étape 1: Installer/Activer MetaMask
- Extension Chrome disponible
- Créer un wallet ou importer un existant
- Pas besoin de fonds réels pour ce test

### Étape 2: Ajouter un Réseau Local (Optionnel)
Pour test fullstack avec Hardhat:
```
Name: Localhost
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

### Étape 3: Créer des Comptes de Test
Si vous utilisez MetaMask:
1. Cliquer "Create Account"
2. Créer 3 comptes (pour test multi-rôle)

*Note*: Les adresses générées automatiquement varient, donc les rôles seront générés basés sur le dernier caractère.

## 3. Attribution des Rôles (par Adresse)

Le système assigne automatiquement les rôles:

```
Derniers caractères de l'adresse:
├─ 0-5  → Secretary   (Upload documents)
├─ 6-b  → Jury        (Review & Vote)
└─ c-f  → Lawyer      (Passive role)
```

**Créer des comptes avec les rôles désirés:**

### Pour ForceJury (ends with 6-b):
1. Créer manuellement une adresse dans MetaMask
2. Vérifier que le dernier caractère est 6-b
3. Ou utiliser:
   - `0x1234567890123456789012345678901234567896` (ends in 6)
   - `0x123456789012345678901234567890123456789a` (ends in a)
   - `0x123456789012345678901234567890123456789b` (ends in b)

Pour Secretary (ends with 0-5):
- `0x1234567890123456789012345678901234567890` (ends in 0)

## 4. Workflow Complet d'Testing

### Phase 1: Setup Initial (Jury Admin)

1. **Connecter avec compte Jury** (adresse finissant par 6-b)
   - Aller vers http://localhost:5173/jury
   - Click "Connect Wallet"

2. **Ajouter des jurés supplémentaires**
   - Mettre une nouvelle adresse MetaMask dans le champ "Jury Members"
   - Vous pouvez ajouter vos 3 comptes

3. **Enregistrer des avocats** (optionnel)
   - Ajouter des adresses dans "Registered Lawyers"

### Phase 2: Upload Document (Secretary)

1. **Connecter avec compte Secretary** (adresse finissant par 0-5)
   - Déconnecter le wallet actuel (click disconnect)
   - Basculer vers un autre compte MetaMask finissant par 0-5
   - Aller vers http://localhost:5173/secretary
   - Click "Connect Wallet"

2. **Upload un document**
   - Tab "Upload Document"
   - Click sur la zone d'upload
   - Sélectionner ou créer un fichier PDF
   - Click "Submit Document for Review"
   - Voir la notification de succès

3. **Tracker le document**
   - Tab "Track Documents"
   - Voir le document en statut "Pending"
   - Voir les statistiques (1 Pending, 0 Approved, 0 Rejected)

### Phase 3: Jury Review et Vote

1. **Connecter avec compte Jury**
   - Basculer vers votre compte Jury dans MetaMask
   - Aller vers http://localhost:5173/jury
   - Voir le document en "Pending" tab

2. **Tester l'Approval**
   - Click "Cast Vote" sur un document
   - Click "Approve"
   - Voir la notification de changement de statut
   - Document passe à "under_review" (1 vote reçu)

3. **Tester la Rejection avec Commentaire**
   - Upload un nouveau document (switch vers Secretary)
   - Retourner à Jury
   - Click "Cast Vote"
   - Typed un commentaire: "Document quality is insufficient. Please revise..."
   - Click "Reject"
   - Voir la notification

### Phase 4: Resoumission Après Rejet

1. **Secretary voit le rejet**
   - Switch vers Secretary
   - Tab "Track Documents"
   - Voir le document en statut "Rejected"
   - Voir le commentaire de rejet: "Document quality is insufficient..."

2. **Resoummettre le document**
   - Click sur le document (voir détails)
   - Section "Resubmit Updated Document" apparaît
   - Sélectionner un fichier mis à jour
   - Click "Submit New Version"
   - Document passe à v2
   - Voir le nouvel IPFS hash

3. **Jury revoit la v2**
   - Switch vers Jury
   - Document réapparaît en "Pending" avec v2
   - Voter à nouveau

### Phase 5: Analytics Dashboard

1. **Aller à la page analytics**
   - http://localhost:5173/analytics
   - Voir tous les documents dans les statistiques

2. **Observer les métriques:**
   - Total documents
   - % Approved / Rejected / Pending
   - Average document version
   - Average jury votes per document
   - Rejection quality %
   - This week / This month metrics
   - Progress bars pour chaque statut

## 5. Tester les Cas Limites

### ❌ Erreur: Rejet sans commentaire
```
Jury: Click "Cast Vote"
Click "Reject" SAN comment
Résultat: Bouton désactivé, message "Rejection comment is mandatory"
```

### ❌ Erreur: Adresse invalide
```
Jury: Taper une adresse invalide dans "Jury Members"
Click "Add Jury Member"
Résultat: Message d'erreur en rouge
```

### ✅ Multi-Jury Voting
```
1. Upload document avec Secretary
2. Jury1 vote "Approve" (statut → under_review)
3. Jury2 vote "Approve" (statut → approved, car 2/2 = 100%)
4. Voir les 2 votes dans les détails
```

## 6. Dossiers de Test

### Document PDF Minimale
```
Créer un fichier text:
  Title.pdf
  Content: "Test document for JuryDoX"
Uploader via Secretary
```

### Simulated Error Scenarios
```
1. Rejet sans commentaire → Voir l'erreur
2. Vote multiple du même juré → Update du vote
3. Consensnus maj à 2/3 → Changer le nombre de jurés
```

## 7. Monitoring les Notifications

En bas à droite du l'écran, vous verrez:
- ✅ **Vert**: Succès (document uploadé, voté approuvé)
- ❌ **Rouge**: Erreur (champ obligatoire manquant)
- ℹ️ **Bleu**: Info (statut changé)

Les notifications disparaissent automatiquement après 5 secondes.

## 8. Checker la Data Structure

Ouvrir **DevTools (F12) → Console** et entrer:
```javascript
// Voir tous les documents
JSON.stringify($0.querySelector("body").__reactProps$...)
// Ou dans React DevTools
```

## 9. Reset des Données

Les données sont stockées en mémoire. Pour reset:
- **Refresh la page** (F5)
- Ou close/rouvrir l'onglet

Pour persistence locale:
```javascript
// À ajouter dans Web3Context.jsx:
localStorage.setItem('juryDoxData', JSON.stringify(documents));
```

## 10. Troubleshooting

### Problème: "Please install MetaMask"
**Solution**: Installer l'extension MetaMask ou utiliser Brave Browser qui l'inclut

### Problème: Wallet not connecting
**Solution**: 
- Click "Connect Wallet" à nouveau
- Accepter la permission dans MetaMask popup
- Vérifier que vous avez sélectionné le bon compte

### Problème: Rôle incorrect
**Solution**: 
- Vérifier le dernier caractère de l'adresse
- Secretary = ends with 0-5
- Jury = ends with 6-b
- Lawyer = ends with c-f

### Problème: Document n'upload pas
**Solution**:
- Tester avec un fichier petit (.txt renommé .pdf)
- Vérifier la console (F12) pour erro

rs

## 11. Cas de Test Recommandés

1. **Single Jury Approval** ✅
2. **Single Jury Rejection with Comment** ✅
3. **Multi-Jury Consensus (3 jurés, 2 approvals)** ✅
4. **Document Versioning (resubmit)** ✅
5. **Search & Filter Documents** ✅
6. **View Analytics Dashboard** ✅
7. **Add/Remove Jury Members** ✅
8. **Add/Remove Lawyers** ✅

## 12. Prochaines Étapes - Blockchain Real

Quand vous serez prêt pour tester sur blockchain réelle:

1. **Déployer un Hardhat local:**
```bash
npx hardhat node
```

2. **Configurer une vraie RPC Testnet:**
```
RPC: https://rpc.sepolia.org
ou https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

3. **Obtenir des tokens de test:**
- Sepolia: https://www.sepoliafaucet.com
- Polygon Mumbai: https://faucet.polygon.technology/

4. **Redéployer en production:**
```bash
npm run build
# et host sur Vercel/Netlify
```

---

**Happy Testing! 🚀**

Pour toute question ou bug, vérifier la console (F12) pour les erreurs détaillées.
