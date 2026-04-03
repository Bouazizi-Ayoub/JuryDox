# 🏛️ JuryDoX - Decentralized Document Management dApp

> A tamper-proof, blockchain-ready platform for managing legal documents with multi-jury review system.

[![Status](https://img.shields.io/badge/status-beta-yellow.svg)](https://github.com)
[![Node Version](https://img.shields.io/badge/node-16%2B-brightgreen.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

JuryDoX is an advanced document management system designed for legal professionals. It provides:

- **Decentralized Review**: Multi-jury voting on document approval
- **Version Control**: Track every iteration of documents
- **Audit Trail**: Complete history of all actions
- **Smart Contracts Ready**: Prepared for blockchain integration
- **Local Testing**: Full mock implementation for development

### Problem Solved

Traditional document management systems:
- ❌ Lack transparency and auditability
- ❌ Single point of failure
- ❌ No version control for legal documents
- ❌ Difficult to track changes and approvals

JuryDoX Solution:
- ✅ Decentralized voting system
- ✅ Complete audit trail on-chain
- ✅ Integrated document versioning
- ✅ Mandatory rejection comments
- ✅ Real-time analytics

## ✨ Features

### Core Functionalities

#### 1. **Advanced Rejection Management**
- 📝 Mandatory comments when rejecting documents
- 🔄 Version-based resubmission system
- 📊 Rejection quality metrics
- 🎯 Clear feedback for document improvement

#### 2. **Multi-Jury Voting**
- 🗳️ Multiple jury members can vote on same document
- ⚖️ Consensus-based approval (majority voting)
- 📋 Vote tracking and history
- 🔐 Signature-based actions with MetaMask

#### 3. **Document Versioning**
- 📑 Automatic version increments on resubmission
- 📚 Complete history of all versions
- 🔗 Unique IPFS hash per version
- 🕐 Timestamp for each version

#### 4. **Audit Trail**
- ✍️ Every action logged with details
- 👤 User identification for each action
- 📅 Timestamp for complete tracking
- 💬 Context and comments preserved

#### 5. **Comprehensive Search & Filter**
- 🔍 Search by document name, ID, or hash
- 🏷️ Filter by status, date range
- 📊 Real-time filtering results
- ⚡ Instant search without page reload

#### 6. **Analytics Dashboard**
- 📈 Real-time statistics
- 📊 Document approval rates
- 👥 Jury voting metrics
- 💹 Trend analysis
- 🎯 Performance indicators

#### 7. **Blockchain Ready**
- 🔐 IPFS hash integration
- 💳 Wallet address tracking
- ✍️ Digital signatures
- 📝 Transaction hash preparation
- 🔗 Smart contract compatible data structure

### Role-Based Dashboards

#### 👨‍💼 Secretary Dashboard
- Upload new documents
- Track document status
- View rejection comments
- Resubmit revised versions
- Search and filter documents

#### ⚖️ Jury Dashboard
- Review pending documents
- Vote with mandatory comments for rejection
- View voting history
- Add/remove jury members
- Manage lawyer registry
- View analytics

#### 👨‍⚖️ Lawyer Dashboard
- View submitted documents
- Access document details
- Track approval status
- Download approved documents

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MetaMask or similar Web3 wallet
- Modern browser (Chrome, Firefox, Safari)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/JuryDox.git
cd JuryDox
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

5. **Connect MetaMask**
- Click "Connect Wallet"
- Approve permissions
- Your role is auto-assigned based on wallet address

### First Steps

1. **As Secretary**: Upload a document
2. **As Jury**: Review and vote
3. **As Secretary**: See results and optionally resubmit
4. **As Admin**: View analytics

See [Testing Guide](TEST_GUIDE.md) for detailed workflow.

## 🏗️ Architecture

### Tech Stack

```
Frontend:
├─ React 19.2.4
├─ React Router 7.13
├─ Ethers 6.16
├─ Lucide Icons
└─ Vite 8.0

Web3:
├─ MetaMask (wallet connection)
├─ Web3Context (state management)
├─ Mock IPFS (for testing)
└─ Digital Signatures (ethers.js)

Styling:
├─ CSS Variables
├─ Glass Morphism Design
└─ Responsive Grid Layout
```

### Data Structure

```
Document {
  id: string                    // Unique identifier
  name: string                  // Document name
  version: number              // Current version
  status: enum                 // pending|under_review|approved|rejected|resubmitted
  
  // Content & Storage
  bytes: number                // File size
  ipfsHash: string             // IPFS content hash
  
  // Versioning
  previousVersions: [{
    version: number
    ipfsHash: string
    timestamp: string
    status: string
  }]
  
  // Voting
  votes: [{
    juryAddress: string
    vote: enum                 // approve|reject
    comment: string            // Required for reject
    timestamp: string
  }]
  
  // Blockchain Ready
  walletAddress: string        // Uploader address
  signature: string            // Digital signature
  txHash: string               // Transaction hash
  
  // Audit Trail
  auditTrail: [{
    action: string            // upload|approve|reject|resubmit
    user: string              // Actor address
    date: string              // When
    comment: string           // Context
  }]
  
  // Metadata
  timestamp: string            // Upload time
  reviewedAt: string          // Approval/Rejection time
  rejectionComment: string    // Why rejected (if applicable)
}
```

### State Management

Using React Context API (`Web3Context.jsx`):
- Centralized document state
- Jury member management
- Lawyer registry
- Notification queue
- Real-time statistics

## 📚 Documentation

### Main Documentation Files

| File | Purpose |
|------|---------|
| [FEATURES.md](FEATURES.md) | Complete feature documentation |
| [TEST_GUIDE.md](TEST_GUIDE.md) | Step-by-step testing guide |
| [Architecture.md](ARCHITECTURE.md) | Detailed architecture docs |

### Code Documentation

- **Web3Context.jsx**: Core state management
- **Components/NotificationCenter**: Global notifications
- **Pages/AnalyticsDashboard**: Advanced analytics
- **utils/testData.js**: Test utilities and sample data

## 👨‍💻 Development

### Project Structure

```
src/
├── context/
│   └── Web3Context.jsx              # State management
├── components/
│   ├── Navbar.jsx                   # Navigation
│   └── NotificationCenter.jsx        # Notifications
├── pages/
│   ├── SecretaryDashboard.jsx        # Secretary view
│   ├── JuryDashboard.jsx             # Jury view
│   ├── LawyerDashboard.jsx           # Lawyer view
│   └── AnalyticsDashboard.jsx        # Analytics
├── utils/
│   └── testData.js                  # Test utilities
├── App.jsx                          # Main router
├── main.jsx                         # Entry point
└── index.css                        # Global styles
```

### Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint

# Testing
npm test              # Run test suite
npm run test:watch    # Run tests in watch mode
```

### Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:3000
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud
VITE_CONTRACT_ADDRESS=0x...
```

## 🧪 Testing

### Local Test Scenarios

1. **Single Approval**
   - Secretary uploads
   - Jury approves
   - Document becomes "approved"

2. **Rejection Workflow**
   - Secretary uploads v1
   - Jury rejects with comment
   - Secretary sees reason
   - Secretary uploads v2
   - Jury approves v2

3. **Multi-Jury Consensus**
   - Document needs 2/3 majority
   - First jury votes approve (under_review)
   - Second jury votes approve (reaches approved)
   - Both votes tracked

4. **Analytics**
   - Check all metrics
   - Verify calculations
   - Test time-based filters

See [TEST_GUIDE.md](TEST_GUIDE.md) for complete testing instructions.

## 🚢 Deployment

### Development Deploy

```bash
npm run build
# Outputs to dist/
```

### Production Deployment

#### Option 1: Vercel
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

#### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Blockchain Integration

When ready for mainnet:

1. Deploy Smart Contract
   - Multi-signature voting logic
   - Document registry
   - Access control

2. Configure Testnet
   - Sepolia, Polygon Mumbai, or Arbitrum
   - Update RPC endpoint
   - Configure network in MetaMask

3. Integrate IPFS
   - Replace mock hashes with real IPFS
   - Use Pinata or Infura
   - Add file encryption

4. Deploy Frontend
   - Production ethers.js configuration
   - Real wallet connections
   - Live transaction signing

## 🔐 Security Considerations

### Current (Mock Implementation)
- ✅ Client-side validation
- ✅ Role-based access control
- ⚠️ No real blockchain validation

### For Production
- [ ] Smart contract audits
- [ ] HTTPS only
- [ ] Wallet signature verification
- [ ] Document encryption
- [ ] Rate limiting
- [ ] DDoS protection
- [ ] Event logging
- [ ] Access logs

## 📊 Roadmap

### v1.0 ✅ Current
- Core voting system
- Document versioning
- Analytics dashboard
- Local testing setup

### v1.1 🚧 Next
- [ ] Real IPFS integration
- [ ] Sepolia testnet deployment
- [ ] Email notifications
- [ ] Document categories

### v2.0 🔮 Future
- [ ] Smart contract deployment
- [ ] Polygon production deployment
- [ ] NFT certificates
- [ ] API REST
- [ ] Mobile app
- [ ] Multi-language support

## 🤝 Contributing

Contributions welcome! Please follow:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/issues)
- **Discussions**: [GitHub Discussions](https://github.com/discussions)
- **Email**: support@jurydox.io

## 👥 Team

- **Founded**: April 2026
- **Status**: Beta (Ready for Testing)
- **Version**: 1.0.0-beta

## 🎓 Learning Resources

- [Ethers.js Docs](https://docs.ethers.org)
- [React Documentation](https://react.dev)
- [IPFS Overview](https://ipfs.io)
- [Smart Contracts 101](https://ethereum.org/developers)

## 📞 Contact

- **Website**: Coming soon
- **Twitter**: [@JuryDoX](https://twitter.com)
- **Discord**: [Join Community](https://discord.gg)

---

**Made with ❤️ for Legal Professionals** 🏛️

Built during Ethereum Dev 2026 | Open Source | Community-Driven
