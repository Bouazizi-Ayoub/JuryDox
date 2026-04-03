import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const Web3Context = createContext();

/**
 * Enhanced data model for documents with advanced features:
 * - Multiple status workflow (pending, under_review, approved, rejected, resubmitted)
 * - Versioning support
 * - Multi-jury voting
 * - Audit trail
 * - Blockchain-ready fields
 */

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null); // 'Secretary', 'Jury', 'Lawyer'
  const [isGuest, setIsGuest] = useState(false);

  // Test accounts to switch simulated wallets
  const testAccounts = {
    Secretary: '0xAa0000000000000000000000000000000000000',
    Jury: '0xBb0000000000000000000000000000000000000',
    Lawyer: '0xCc0000000000000000000000000000000000000'
  };

  // Enhanced document structure
  const [documents, setDocuments] = useState([]);

  // Registered lawyer wallet addresses (managed by the Jury)
  const [registeredLawyers, setRegisteredLawyers] = useState([]);

  // Jury members for multi-voting
  const [juryMembers, setJuryMembers] = useState([]);

  // Notifications queue for frontend display
  const [notifications, setNotifications] = useState([]);

  // Mock roles based on the last character of the address
  const assignRole = (addr) => {
    if (!addr) return null;
    const lastChar = addr.slice(-1).toLowerCase();
    if (['0', '1', '2', '3', '4', '5'].includes(lastChar)) return 'Secretary';
    if (['6', '7', '8', '9', 'a', 'b'].includes(lastChar)) return 'Jury';
    return 'Lawyer';
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        setProvider(browserProvider);
        setAccount(address);
        setRole(assignRole(address));
        setIsGuest(false);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to use this application.");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setAccount(null);
    setRole(null);
    setIsGuest(false);
  };

  const enterGuest = (guestRole) => {
    if (!guestRole || !testAccounts[guestRole]) {
      addNotification('error', 'Rôle invité invalide');
      return;
    }

    setProvider(null);
    setAccount(testAccounts[guestRole]);
    setRole(guestRole);
    setIsGuest(true);
    addNotification('success', `Connecté en tant que ${guestRole} (mode invité)`);
  };

  // Persist documents and role state so it survives disconnects/refreshes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jurydox_documents');
      if (stored) {
        setDocuments(JSON.parse(stored));
      }

      const savedRole = localStorage.getItem('jurydox_role');
      const savedAccount = localStorage.getItem('jurydox_account');
      const savedIsGuest = localStorage.getItem('jurydox_isGuest');

      if (savedRole) setRole(savedRole);
      if (savedAccount) setAccount(savedAccount);
      if (savedIsGuest) setIsGuest(savedIsGuest === 'true');
    } catch (error) {
      console.warn('Impossible de charger l\'état depuis localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('jurydox_documents', JSON.stringify(documents));
      if (role) localStorage.setItem('jurydox_role', role); else localStorage.removeItem('jurydox_role');
      if (account) localStorage.setItem('jurydox_account', account); else localStorage.removeItem('jurydox_account');
      localStorage.setItem('jurydox_isGuest', isGuest.toString());
    } catch (error) {
      console.warn('Impossible de sauvegarder l\'état dans localStorage', error);
    }
  }, [documents, account, role, isGuest]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setRole(assignRole(accounts[0]));
          setIsGuest(false);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const changeRole = (newRole) => {
    const normalizedRole = newRole || assignRole(account);
    setRole(normalizedRole);
    setIsGuest(true);
    setProvider(null);

    if (testAccounts[normalizedRole]) {
      setAccount(testAccounts[normalizedRole]);
    }
  };

  const switchAccount = (newAccount) => {
    if (!newAccount) return;
    setAccount(newAccount);
    setRole(assignRole(newAccount));
    setIsGuest(true);
    setProvider(null);
  };

  // ─── Utility Functions ───
  const generateMockHash = (type = 'ipfs') => {
    if (type === 'ipfs') {
      return 'Qm' + Array.from({ length: 44 }, () => 
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
      ).join('');
    } else { // txHash
      return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
  };

  const generateSignature = () => {
    return '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const addNotification = (type, message, documentId = null) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message, documentId, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // ─── Lawyer Management ───
  const addLawyer = (address) => {
    if (!address || registeredLawyers.includes(address.toLowerCase())) return false;
    setRegisteredLawyers([...registeredLawyers, address.toLowerCase()]);
    addNotification('success', `Lawyer ${address.slice(0, 6)}...${address.slice(-4)} registered`);
    return true;
  };

  const removeLawyer = (address) => {
    setRegisteredLawyers(registeredLawyers.filter(a => a !== address.toLowerCase()));
  };

  // ─── Jury Member Management ───
  const addJuryMember = (address) => {
    if (!address || juryMembers.includes(address.toLowerCase())) return false;
    setJuryMembers([...juryMembers, address.toLowerCase()]);
    return true;
  };

  const removeJuryMember = (address) => {
    setJuryMembers(juryMembers.filter(a => a !== address.toLowerCase()));
  };

  // ─── Document Management ───

  /**
   * Create a new document with initial structure
   */
  const createDocument = (name, bytes, uploadedBy) => {
    const newDoc = {
      id: Date.now().toString(),
      name,
      bytes,
      uploadedBy,
      version: 1,
      previousVersions: [],
      status: 'pending', // pending, under_review, approved, rejected, resubmitted
      ipfsHash: generateMockHash('ipfs'),
      walletAddress: uploadedBy,
      signature: null,
      txHash: null,
      reviewedAt: null,
      timestamp: new Date().toISOString(),
      
      // Rejection details
      rejectionComment: null,
      
      // Multi-jury voting
      votes: [], // [{ juryAddress, vote: 'approve'|'reject', comment: '', timestamp }]
      
      // Audit trail
      auditTrail: [
        {
          action: 'upload',
          user: uploadedBy,
          date: new Date().toISOString(),
          comment: `Document uploaded - v${1}`
        }
      ]
    };
    return newDoc;
  };

  /**
   * Upload a new document
   */
  const uploadDocument = (name, bytes, uploadedBy) => {
    const newDoc = createDocument(name, bytes, uploadedBy);
    setDocuments([...documents, newDoc]);
    addNotification('success', `Document "${name}" uploaded successfully`);
    return newDoc.id;
  };

  /**
   * Resubmit a rejected document (creates new version)
   */
  const resubmitDocument = (id, newBytes, userAddress) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const newDoc = {
          ...doc,
          bytes: newBytes,
          version: doc.version + 1,
          previousVersions: [
            ...doc.previousVersions,
            {
              version: doc.version,
              ipfsHash: doc.ipfsHash,
              timestamp: doc.timestamp,
              status: doc.status
            }
          ],
          status: 'pending',
          ipfsHash: generateMockHash('ipfs'),
          reviewedAt: null,
          rejectionComment: null,
          votes: [],
          timestamp: new Date().toISOString(),
          auditTrail: [
            ...doc.auditTrail,
            {
              action: 'resubmit',
              user: userAddress,
              date: new Date().toISOString(),
              comment: `Document resubmitted - v${doc.version + 1}`
            }
          ]
        };
        return newDoc;
      }
      return doc;
    }));
    addNotification('success', `Document resubmitted - Version ${Math.max(...documents.find(d => d.id === id)?.previousVersions?.map(v => v.version) || [0]) + 1}`);
  };

  /**
   * Vote on a document (for jury members)
   */
  const voteOnDocument = (documentId, juryAddress, voteDecision, comment = '') => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === documentId) {
        // Remove previous vote by this jury
        const updatedVotes = doc.votes.filter(v => v.juryAddress !== juryAddress);
        
        // Add new vote
        updatedVotes.push({
          juryAddress,
          vote: voteDecision, // 'approve' or 'reject'
          comment,
          timestamp: new Date().toISOString()
        });

        // Calculate if consensus reached
        const approves = updatedVotes.filter(v => v.vote === 'approve').length;
        const rejects = updatedVotes.filter(v => v.vote === 'reject').length;
        const totalJury = Math.max(juryMembers.length, 1);
        const majority = Math.ceil(totalJury / 2);

        let newStatus = doc.status;
        let newTxHash = doc.txHash;
        let newSignature = doc.signature;
        let newReviewedAt = doc.reviewedAt;

        // Determine consensus
        if (approves >= majority) {
          newStatus = 'approved';
          newTxHash = generateMockHash('tx');
          newSignature = generateSignature();
          newReviewedAt = new Date().toISOString();
        } else if (rejects >= majority) {
          newStatus = 'rejected';
          newReviewedAt = new Date().toISOString();
        } else if (doc.status === 'pending') {
          newStatus = 'under_review';
        }

        const updatedDoc = {
          ...doc,
          votes: updatedVotes,
          status: newStatus,
          txHash: newTxHash,
          signature: newSignature,
          reviewedAt: newReviewedAt,
          auditTrail: [
            ...doc.auditTrail,
            {
              action: voteDecision === 'approve' ? 'approve' : 'reject',
              user: juryAddress,
              date: new Date().toISOString(),
              comment: comment || 'No comment provided'
            }
          ]
        };

        // Add notification
        if (newStatus !== doc.status) {
          addNotification('info', `Document status updated to ${newStatus}`, documentId);
        }

        return updatedDoc;
      }
      return doc;
    }));
  };

  /**
   * Approve document (single jury - legacy support)
   */
  const approveDocument = (id, juryAddress, comment = '') => {
    voteOnDocument(id, juryAddress || account, 'approve', comment);
  };

  /**
   * Reject document with mandatory comment
   */
  const rejectDocument = (id, juryAddress, rejectionComment) => {
    if (!rejectionComment || rejectionComment.trim() === '') {
      addNotification('error', 'Rejection comment is mandatory');
      return false;
    }
    voteOnDocument(id, juryAddress || account, 'reject', rejectionComment);
    return true;
  };

  // ─── Statistics ───
  const getStats = () => {
    const total = documents.length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const rejected = documents.filter(d => d.status === 'rejected').length;
    const pending = documents.filter(d => d.status === 'pending').length;
    const underReview = documents.filter(d => d.status === 'under_review').length;

    return {
      total,
      approved,
      rejected,
      pending,
      underReview,
      approvePercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectPercentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
      pendingPercentage: total > 0 ? Math.round(((pending + underReview) / total) * 100) : 0
    };
  };

  // ─── Search & Filter ───
  const searchDocuments = (query) => {
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.id.includes(query) ||
      doc.ipfsHash.includes(query)
    );
  };

  const filterDocumentsByStatus = (status) => {
    return documents.filter(doc => doc.status === status);
  };

  const filterDocumentsByDateRange = (startDate, endDate) => {
    return documents.filter(doc => {
      const docDate = new Date(doc.timestamp);
      return docDate >= startDate && docDate <= endDate;
    });
  };

  return (
    <Web3Context.Provider value={{
      // Wallet & Auth
      provider, account, role, isGuest,
      testAccounts,
      connectWallet, disconnectWallet, enterGuest, changeRole, switchAccount,
      
      // Documents
      documents, setDocuments,
      uploadDocument, resubmitDocument, voteOnDocument, approveDocument, rejectDocument, createDocument,
      
      // Lawyers & Jury
      registeredLawyers, addLawyer, removeLawyer,
      juryMembers, addJuryMember, removeJuryMember,
      
      // Notifications
      notifications, addNotification,
      
      // Search & Filter
      searchDocuments, filterDocumentsByStatus, filterDocumentsByDateRange,
      
      // Statistics
      getStats
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
