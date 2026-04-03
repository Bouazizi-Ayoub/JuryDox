// Data seeding configuration for local testing
// This file contains mock data and utility functions for testing JuryDoX

export const MOCK_JURY_ADDRESSES = [
  '0x76a215aff4c7b2c9859f6dbbb1b5c6c2a33b91b6',
  '0x28a93215aff4c7b2c9859f6dbbb1b5c6c2a33b97',
  '0x38a93215aff4c7b2c9859f6dbbb1b5c6c2a33b98'
];

export const MOCK_LAWYER_ADDRESSES = [
  '0x48a93215aff4c7b2c9859f6dbbb1b5c6c2a33b99',
  '0x58a93215aff4c7b2c9859f6dbbb1b5c6c2a33b9a'
];

export const MOCK_SECRETARY_ADDRESSES = [
  '0x68a93215aff4c7b2c9859f6dbbb1b5c6c2a33b92',
  '0x78a93215aff4c7b2c9859f6dbbb1b5c6c2a33b93'
];

// Rolebased on last character logic
export const getRoleFromAddress = (addr) => {
  if (!addr) return null;
  const lastChar = addr.slice(-1).toLowerCase();
  if (['0', '1', '2', '3', '4', '5'].includes(lastChar)) return 'Secretary';
  if (['6', '7', '8', '9', 'a', 'b'].includes(lastChar)) return 'Jury';
  return 'Lawyer';
};

// Sample documents for initial testing
export const SAMPLE_DOCUMENTS = [
  {
    name: 'Contract Agreement v1.pdf',
    description: 'Initial legal contract for testing',
    category: 'Contract'
  },
  {
    name: 'NDA Proposal.pdf',
    description: 'Non-Disclosure Agreement proposal',
    category: 'NDA'
  },
  {
    name: 'Partner Terms.pdf',
    description: 'Partnership terms and conditions',
    category: 'Partnership'
  },
  {
    name: 'Service Agreement.pdf',
    description: 'Service level agreement draft',
    category: 'Service'
  }
];

// Test scenarios
export const TEST_SCENARIOS = {
  scenario1: {
    name: 'Single Approval',
    description: 'Jury approves document immediately',
    steps: [
      '1. Secretary uploads document',
      '2. Jury votes Approve',
      '3. Document status changes to "approved"'
    ]
  },
  scenario2: {
    name: 'Rejection with Revision',
    description: 'Jury rejects, Secretary resubmits revised version',
    steps: [
      '1. Secretary uploads document v1',
      '2. Jury votes Reject (mandatory comment)',
      '3. Secretary sees rejection reason',
      '4. Secretary uploads document v2',
      '5. Jury votes Approve on v2',
      '6. Document approved'
    ]
  },
  scenario3: {
    name: 'Multi-Jury Consensus',
    description: 'Multiple jury members vote on same document',
    steps: [
      '1. Secretary uploads document',
      '2. Jury1 votes Approve (under_review)',
      '3. Jury2 votes Approve (reaches majority)',
      '4. Document status → "approved"',
      '5. Both votes visible in audit trail'
    ]
  },
  scenario4: {
    name: 'Document Versioning',
    description: 'Track multiple versions of same document',
    steps: [
      '1. Upload v1 (pending)',
      '2. Jury rejects',
      '3. Upload v2 (previous v1 stored)',
      '4. Jury approves',
      '5. View version history'
    ]
  }
};

// Rejection comment templates for testing
export const REJECTION_TEMPLATES = [
  'Document lacks required compliance certifications',
  'Signature section is incomplete or invalid',
  'Terms and conditions need legal review revision',
  'Document does not comply with latest regulations',
  'Missing required parties\' signatures',
  'Date range in agreement is expired',
  'Document formatting does not meet standards',
  'Critical information redacted without justification'
];

// Testing utilities
export const testUtils = {
  // Generate random IPFS-like hash
  generateMockIPFS: () => {
    return 'Qm' + Array.from({ length: 44 }, () => 
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
    ).join('');
  },

  // Generate random transaction hash
  generateMockTxHash: () => {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  },

  // Generate digital signature
  generateMockSignature: () => {
    return '0x' + Array.from({ length: 130 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  },

  // Format address short version
  formatAddress: (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`,

  // Get random rejection comment
  getRandomRejectionReason: () => 
    REJECTION_TEMPLATES[Math.floor(Math.random() * REJECTION_TEMPLATES.length)],

  // Create document summary
  createDocumentSummary: (doc) => ({
    id: doc.id,
    name: doc.name,
    status: doc.status,
    version: doc.version,
    ipfsHash: doc.ipfsHash.slice(0, 16) + '...',
    votes: doc.votes.length,
    uploadedAt: new Date(doc.timestamp).toLocaleDateString()
  })
};

// Console helpers for testing
export const consoleHelpers = {
  // Log document details
  logDoc: (doc) => {
    console.log('Document Details:');
    console.log(`  ID: ${doc.id}`);
    console.log(`  Name: ${doc.name}`);
    console.log(`  Status: ${doc.status}`);
    console.log(`  Version: ${doc.version}`);
    console.log(`  Votes: ${doc.votes.length}`);
    console.log(`  IPFS: ${doc.ipfsHash}`);
    console.log(`  Audit Trail: (${doc.auditTrail.length} entries)`);
    doc.auditTrail.forEach((entry, i) => {
      console.log(`    ${i + 1}. [${entry.action.toUpperCase()}] ${entry.comment}`);
    });
  },

  // Log all documents
  logAllDocs: (docs) => {
    console.table(docs.map(testUtils.createDocumentSummary));
  },

  // Log voting stats
  logVotingStats: (docs) => {
    const stats = {
      totalDocs: docs.length,
      totalVotes: docs.reduce((sum, d) => sum + d.votes.length, 0),
      avgVotesPerDoc: (docs.reduce((sum, d) => sum + d.votes.length, 0) / docs.length).toFixed(2),
      consensusReached: docs.filter(d => d.status === 'approved' || d.status === 'rejected').length,
      avgVersions: (docs.reduce((sum, d) => sum + d.version, 0) / docs.length).toFixed(2)
    };
    console.table(stats);
  }
};

// Environment configuration
export const ENV_CONFIG = {
  // Development settings
  dev: {
    logLevel: 'debug',
    notificationDuration: 5000,
    mockDelay: 1000,
    enableLogging: true
  },
  // Production settings
  prod: {
    logLevel: 'error',
    notificationDuration: 3000,
    mockDelay: 500,
    enableLogging: false
  },
  // Test settings
  test: {
    logLevel: 'info',
    notificationDuration: 2000,
    mockDelay: 0,
    enableLogging: true
  }
};

// Quick start guide
export const QUICK_START = `
🚀 JuryDoX Local Testing - Quick Start

STEP 1: Start Development Server
  $ npm run dev
  → Open http://localhost:5173

STEP 2: Connect MetaMask
  - Click "Connect Wallet"
  - Accept permissions
  - Your role is determined by address last character

STEP 3: Test Based on Your Role
  
  IF YOU'RE A SECRETARY (address ends 0-5):
    → Go to /secretary
    → Click "Upload Document"
    → Select a PDF file
    → Click "Submit Document"
    → Go to "Track Documents" to see status
  
  IF YOU'RE JURY (address ends 6-b):
    → Go to /jury
    → Add jury members (your other accounts)
    → View "Pending" documents
    → Click "Cast Vote"
    → Approve or Reject (reject requires comment!)
    → View "Analytics" to see stats
  
  IF YOU'RE A LAWYER (address ends c-f):
    → Go to /lawyer
    → View uploaded documents

STEP 4: Multi-Account Testing
  - Switch MetaMask account to another address
  - Different account = Different role
  - Repeat upload/vote workflow

STEP 5: View Analytics
  - Go to /analytics
  - See all statistics in real-time
  - Refresh to update

DEBUGGING TIPS:
  - Open DevTools (F12)
  - Console tab shows notifications
  - Check network tab for API calls
  - Use copilot_getNotebookSummary for state inspection

COMMON ISSUES:
  - "Role is undefined" → Check address last character
  - "Can't vote" → Ensure you're logged in as Jury
  - "Wallet not connecting" → Refresh page, check MetaMask

For detailed guide: see TEST_GUIDE.md
`;

export default {
  MOCK_JURY_ADDRESSES,
  MOCK_LAWYER_ADDRESSES,
  MOCK_SECRETARY_ADDRESSES,
  getRoleFromAddress,
  SAMPLE_DOCUMENTS,
  TEST_SCENARIOS,
  testUtils,
  consoleHelpers,
  ENV_CONFIG,
  QUICK_START
};
