import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { uploadToIPFS, getIPFSUrl, isPinataConfigured } from '../utils/ipfs';
import JudgeDoXABI from '../config/JudgeDoXABI.json';
import contractsConfig from '../config/contracts.json';

const Web3Context = createContext();

// Role enum matching the smart contract: 0=None, 1=Secretary, 2=Judge, 3=Lawyer
const ROLE_MAP = { 0: null, 1: 'Secretary', 2: 'Judge', 3: 'Lawyer' };
const ROLE_REVERSE = { Secretary: 1, Judge: 2, Lawyer: 3 };

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(() => {
    return localStorage.getItem('judgedox_account') || null;
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('judgedox_role') || null;
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('judgedox_isGuest') === 'true';
  });
  const [contract, setContract] = useState(null);
  const [isContractConnected, setIsContractConnected] = useState(false);
  const [ipfsReady, setIpfsReady] = useState(false);

  // Test accounts for guest mode
  const testAccounts = {
    Secretary: '0xAa0000000000000000000000000000000000000',
    Judge: '0xBb0000000000000000000000000000000000000',
    Lawyer: '0xCc0000000000000000000000000000000000000',
  };

  // Documents, judge, lawyers, notifications
  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem('judgedox_documents');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [accessTokens, setAccessTokens] = useState(() => {
    try {
      const stored = localStorage.getItem('judgedox_accessTokens');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [registeredLawyers, setRegisteredLawyers] = useState([]);
  const [judgeMembers, setJudgeMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ─── Contract Connection ───
  const getContractAddress = () => {
    return import.meta.env.VITE_CONTRACT_ADDRESS || contractsConfig.contractAddress;
  };

  const connectContract = async (browserProvider) => {
    const address = getContractAddress();
    if (!address) {
      console.warn('No contract address configured — using guest mode roles');
      setIsContractConnected(false);
      return null;
    }
    try {
      const signerInstance = await browserProvider.getSigner();
      const judgeDoX = new Contract(address, JudgeDoXABI, signerInstance);
      // Quick sanity check
      await judgeDoX.owner();
      setContract(judgeDoX);
      setSigner(signerInstance);
      setIsContractConnected(true);
      return judgeDoX;
    } catch (error) {
      console.warn('Could not connect to contract:', error.message);
      setIsContractConnected(false);
      return null;
    }
  };

  // ─── Role from Smart Contract ───
  const getRoleFromContract = async (judgeDoX, address) => {
    try {
      const roleIndex = await judgeDoX.getUserRole(address);
      return ROLE_MAP[Number(roleIndex)] || null;
    } catch (error) {
      console.warn('Could not read role from contract:', error.message);
      return null;
    }
  };

  // Fallback mock role assignment (guest mode only)
  const assignMockRole = (addr) => {
    if (!addr) return null;
    const lastChar = addr.slice(-1).toLowerCase();
    if (['0', '1', '2', '3', '4', '5'].includes(lastChar)) return 'Secretary';
    if (['6', '7', '8', '9', 'a', 'b'].includes(lastChar)) return 'Judge';
    return 'Lawyer';
  };

  // ─── Wallet Connection ───
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application.');
      return;
    }
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signerInstance = await browserProvider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(browserProvider);
      setAccount(address);
      setIsGuest(false);

      // Try to get role from smart contract
      const judgeDoX = await connectContract(browserProvider);
      if (judgeDoX) {
        const contractRole = await getRoleFromContract(judgeDoX, address);
        if (contractRole) {
          setRole(contractRole);
          addNotification('success', `Connected as ${contractRole} (from blockchain)`);
        } else {
          setRole(null);
          addNotification('warning', 'Your wallet has no role assigned on the contract. Contact the admin.');
        }
      } else {
        // Fallback: no contract → use mock role
        const mockRole = assignMockRole(address);
        setRole(mockRole);
        addNotification('info', `Connected as ${mockRole} (mock mode — no contract)`);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      addNotification('error', 'Wallet connection failed');
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setRole(null);
    setIsGuest(false);
    setContract(null);
    setIsContractConnected(false);
  };

  const enterGuest = (guestRole) => {
    if (!guestRole || !testAccounts[guestRole]) {
      addNotification('error', 'Invalid guest role');
      return;
    }
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsContractConnected(false);
    setAccount(testAccounts[guestRole]);
    setRole(guestRole);
    setIsGuest(true);
    addNotification('success', `Connected as ${guestRole} (guest mode)`);
  };

  // ─── Persistence & Auto-Connect ───
  useEffect(() => {
    // Check IPFS readiness
    setIpfsReady(isPinataConfigured());

    // Auto-connect wallet if already authorized
    const silentlyConnectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const browserProvider = new BrowserProvider(window.ethereum);
            const signerInstance = await browserProvider.getSigner();
            const address = await signerInstance.getAddress();

            setProvider(browserProvider);
            setAccount(address);
            setIsGuest(false);

            const judgeDoX = await connectContract(browserProvider);
            if (judgeDoX) {
              const contractRole = await getRoleFromContract(judgeDoX, address);
              if (contractRole) {
                setRole(contractRole);
              } else {
                setRole(null);
              }
            } else {
              setRole(assignMockRole(address));
            }
          }
        } catch (err) {
          console.warn('Silent connect failed', err);
        }
      }
    };
    silentlyConnectWallet();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('judgedox_documents', JSON.stringify(documents));
      if (role) localStorage.setItem('judgedox_role', role);
      else localStorage.removeItem('judgedox_role');
      if (account) localStorage.setItem('judgedox_account', account);
      else localStorage.removeItem('judgedox_account');
      localStorage.setItem('judgedox_isGuest', isGuest.toString());
      localStorage.setItem('judgedox_accessTokens', JSON.stringify(accessTokens));
    } catch (error) {
      console.warn('Could not save state to localStorage', error);
    }
  }, [documents, account, role, isGuest, accessTokens]);

  // ─── One-Time Access Tokens ───
  const generateAccessToken = (documentId) => {
    const token = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const newTokenObj = { token, documentId, timestamp: Date.now() };
    setAccessTokens((prev) => [...prev, newTokenObj]);

    try {
      navigator.clipboard.writeText(token);
      addNotification('success', `Code copied to clipboard! Token: ${token}`);
    } catch (e) {
      addNotification('success', `Access link generated! Token: ${token}`);
    }

    return token;
  };

  const useAccessToken = (token) => {
    // In local testing, Judge and Lawyer might be in different browser tabs.
    // React state won't sync automatically, so we read directly from the "database" (localStorage).
    let latestTokens = accessTokens;
    let latestDocs = documents;
    try {
      const storedTokens = localStorage.getItem('judgedox_accessTokens');
      if (storedTokens) latestTokens = JSON.parse(storedTokens);
      const storedDocs = localStorage.getItem('judgedox_documents');
      if (storedDocs) latestDocs = JSON.parse(storedDocs);
    } catch (e) { }

    const tokenObj = latestTokens.find((t) => t.token === token);
    if (!tokenObj) {
      addNotification('error', 'Invalid or expired access token');
      return null;
    }

    // Consume the token (one-time use)
    const updatedTokens = latestTokens.filter((t) => t.token !== token);
    setAccessTokens(updatedTokens);
    try {
      localStorage.setItem('judgedox_accessTokens', JSON.stringify(updatedTokens));
    } catch (e) { }

    // Find the document
    const doc = latestDocs.find((d) => d.id === tokenObj.documentId);
    if (!doc) {
      addNotification('error', 'Document associated with this token not found');
      return null;
    }

    addNotification('success', 'Access granted to document successfully!');
    return doc;
  };

  // MetaMask events
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsGuest(false);

          let activeContract = contract;
          if (!activeContract) {
            try {
              const browserProvider = new BrowserProvider(window.ethereum);
              activeContract = await connectContract(browserProvider);
            } catch (err) {
              console.warn('Auto-connect on account change failed:', err);
            }
          }

          if (activeContract) {
            const contractRole = await getRoleFromContract(activeContract, accounts[0]);
            if (contractRole) {
              setRole(contractRole);
              addNotification('info', `Role updated to ${contractRole} (from blockchain)`);
            } else {
              setRole(assignMockRole(accounts[0]));
            }
          } else {
            setRole(assignMockRole(accounts[0]));
          }
        } else {
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => { });
      };
    }
  }, [contract]);

  // Guest mode: switch role
  const changeRole = (newRole) => {
    setRole(newRole || assignMockRole(account));
    setIsGuest(true);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsContractConnected(false);
    if (testAccounts[newRole]) setAccount(testAccounts[newRole]);
  };

  const switchAccount = (newAccount) => {
    if (!newAccount) return;
    setAccount(newAccount);
    setRole(assignMockRole(newAccount));
    setIsGuest(true);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsContractConnected(false);
  };

  // ─── Utility Functions ───
  const generateMockHash = (type = 'ipfs') => {
    if (type === 'ipfs') {
      return 'Qm' + Array.from({ length: 44 }, () =>
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
      ).join('');
    }
    return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const generateSignature = () => {
    return '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const addNotification = (type, message, documentId = null) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message, documentId, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
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
    setRegisteredLawyers(registeredLawyers.filter((a) => a !== address.toLowerCase()));
  };

  // ─── Judge Member Management ───
  const addJudgeMember = (address) => {
    if (!address || judgeMembers.includes(address.toLowerCase())) return false;
    setJudgeMembers([...judgeMembers, address.toLowerCase()]);
    return true;
  };

  const removeJudgeMember = (address) => {
    setJudgeMembers(judgeMembers.filter((a) => a !== address.toLowerCase()));
  };

  // ─── Document Management ───

  /**
   * Create a new document structure
   */
  const createDocument = (name, bytes, uploadedBy, ipfsHash = null, onChainId = null) => {
    return {
      id: Date.now().toString(),
      onChainId: onChainId,
      name,
      bytes,
      uploadedBy,
      version: 1,
      previousVersions: [],
      status: 'pending',
      ipfsHash: ipfsHash || generateMockHash('ipfs'),
      walletAddress: uploadedBy,
      signature: null,
      txHash: null,
      reviewedAt: null,
      timestamp: new Date().toISOString(),
      rejectionComment: null,
      votes: [],
      auditTrail: [
        {
          action: 'upload',
          user: uploadedBy,
          date: new Date().toISOString(),
          comment: `Document uploaded - v1`,
        },
      ],
    };
  };

  /**
   * Upload a document — uses real IPFS if configured, mock otherwise
   * @param {string} name - Document name
   * @param {number} bytes - File size in bytes
   * @param {string} uploadedBy - Wallet address
   * @param {File|null} file - Actual file object for IPFS upload
   */
  const uploadDocument = async (name, bytes, uploadedBy, file = null) => {
    let ipfsHash = null;
    let onChainId = null;

    // Try real IPFS upload if file is provided and Pinata is configured
    if (file && isPinataConfigured()) {
      try {
        const result = await uploadToIPFS(file, {
          name,
          uploadedBy,
        });
        ipfsHash = result.hash;
        addNotification('success', `File uploaded to IPFS: ${ipfsHash.slice(0, 12)}...`);
      } catch (error) {
        addNotification('error', `IPFS upload failed: ${error.message}`);
        ipfsHash = generateMockHash('ipfs');
      }
    }

    // PUSH TO BLOCKCHAIN
    if (contract && signer) {
      try {
        addNotification('info', `Please confirm the MetaMask transaction to push to the blockchain...`);
        const tx = await contract.createDocument(name, "Uploaded via Frontend", ipfsHash || 'mock-hash');
        addNotification('info', `Transaction submitted. Waiting for confirmation...`);
        const receipt = await tx.wait();

        // Parse the transaction receipt for the true on-chain Document ID
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
            if (parsedLog && parsedLog.name === 'DocumentWorkflowStarted') {
              onChainId = parsedLog.args[0].toString();
            }
          } catch (e) { }
        }
        addNotification('success', `Document stored on blockchain! (On-Chain ID: ${onChainId})`);
      } catch (error) {
        console.error("Blockchain upload failed:", error);
        addNotification('warning', `Blockchain upload skipped (using mock behavior). ${error.reason || error.message}`);
      }
    }

    const newDoc = createDocument(name, bytes, uploadedBy, ipfsHash, onChainId);
    setDocuments((prev) => [...prev, newDoc]);
    addNotification('success', `Document "${name}" created locally.`);
    return newDoc.id;
  };

  /**
   * Resubmit a rejected document
   */
  const resubmitDocument = async (id, newBytes, userAddress, file = null) => {
    let ipfsHash = null;

    if (file && isPinataConfigured()) {
      try {
        const result = await uploadToIPFS(file, {
          name: `resubmit-${id}`,
          uploadedBy: userAddress,
        });
        ipfsHash = result.hash;
      } catch {
        ipfsHash = generateMockHash('ipfs');
      }
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          return {
            ...doc,
            bytes: newBytes,
            version: doc.version + 1,
            previousVersions: [
              ...doc.previousVersions,
              { version: doc.version, ipfsHash: doc.ipfsHash, timestamp: doc.timestamp, status: doc.status },
            ],
            status: 'pending',
            ipfsHash: ipfsHash || generateMockHash('ipfs'),
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
                comment: `Document resubmitted - v${doc.version + 1}`,
              },
            ],
          };
        }
        return doc;
      })
    );
    addNotification('success', 'Document resubmitted with new version');
  };

  /**
   * Vote on a document (multi-judge)
   */
  const voteOnDocument = (documentId, judgeAddress, voteDecision, comment = '') => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const updatedVotes = doc.votes.filter((v) => v.judgeAddress !== judgeAddress);
          updatedVotes.push({
            judgeAddress,
            vote: voteDecision,
            comment,
            timestamp: new Date().toISOString(),
          });

          const approves = updatedVotes.filter((v) => v.vote === 'approve').length;
          const rejects = updatedVotes.filter((v) => v.vote === 'reject').length;
          const totalJudge = Math.max(judgeMembers.length, 1);
          const majority = Math.ceil(totalJudge / 2);

          let newStatus = doc.status;
          let newTxHash = doc.txHash;
          let newSignature = doc.signature;
          let newReviewedAt = doc.reviewedAt;

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
                user: judgeAddress,
                date: new Date().toISOString(),
                comment: comment || 'No comment provided',
              },
            ],
          };

          if (newStatus !== doc.status) {
            addNotification('info', `Document status updated to ${newStatus}`, documentId);
          }

          return updatedDoc;
        }
        return doc;
      })
    );
  };

  const approveDocument = async (id, judgeAddress, comment = '') => {
    const doc = documents.find((d) => d.id === id);
    if (contract && signer && doc && doc.onChainId) {
      try {
        addNotification('info', `Please confirm the MetaMask transaction to log your approval...`);
        const tx = await contract.voteOnDocument(doc.onChainId, true, comment || "Approved by Judge");
        addNotification('info', `Transaction submitted. Waiting for confirmation...`);
        await tx.wait();
        addNotification('success', `Approval successfully pushed to the blockchain!`);
      } catch (error) {
        console.error("Blockchain vote failed:", error);
        addNotification('warning', `Blockchain vote skipped. ${error.reason || error.message}`);
      }
    }
    voteOnDocument(id, judgeAddress || account, 'approve', comment);
  };

  const rejectDocument = async (id, judgeAddress, rejectionComment) => {
    if (!rejectionComment || rejectionComment.trim() === '') {
      addNotification('error', 'Rejection comment is mandatory');
      return false;
    }

    const doc = documents.find((d) => d.id === id);
    if (contract && signer && doc && doc.onChainId) {
      try {
        addNotification('info', `Please confirm the MetaMask transaction to log your rejection...`);
        const tx = await contract.voteOnDocument(doc.onChainId, false, rejectionComment);
        addNotification('info', `Transaction submitted. Waiting for confirmation...`);
        await tx.wait();
        addNotification('success', `Rejection successfully pushed to the blockchain!`);
      } catch (error) {
        console.error("Blockchain vote failed:", error);
        addNotification('warning', `Blockchain vote skipped. ${error.reason || error.message}`);
      }
    }

    voteOnDocument(id, judgeAddress || account, 'reject', rejectionComment);
    return true;
  };

  // ─── Role Assignment (Owner only) ───
  const assignRoleOnContract = async (userAddress, roleName) => {
    if (!contract || !signer) {
      addNotification('error', 'Not connected to contract');
      return false;
    }
    try {
      const roleIndex = ROLE_REVERSE[roleName];
      if (!roleIndex) {
        addNotification('error', `Invalid role: ${roleName}`);
        return false;
      }
      const tx = await contract.assignRole(userAddress, roleIndex);
      await tx.wait();
      addNotification('success', `Role "${roleName}" assigned to ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`);
      return true;
    } catch (error) {
      console.error('Role assignment failed:', error);
      addNotification('error', `Role assignment failed: ${error.reason || error.message}`);
      return false;
    }
  };

  // ─── Statistics ───
  const getStats = () => {
    const total = documents.length;
    const approved = documents.filter((d) => d.status === 'approved').length;
    const rejected = documents.filter((d) => d.status === 'rejected').length;
    const pending = documents.filter((d) => d.status === 'pending').length;
    const underReview = documents.filter((d) => d.status === 'under_review').length;

    return {
      total,
      approved,
      rejected,
      pending,
      underReview,
      approvePercentage: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectPercentage: total > 0 ? Math.round((rejected / total) * 100) : 0,
      pendingPercentage: total > 0 ? Math.round(((pending + underReview) / total) * 100) : 0,
    };
  };

  // ─── Search & Filter ───
  const searchDocuments = (query) => {
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.id.includes(query) ||
        doc.ipfsHash.includes(query)
    );
  };

  const filterDocumentsByStatus = (status) => {
    return documents.filter((doc) => doc.status === status);
  };

  const filterDocumentsByDateRange = (startDate, endDate) => {
    return documents.filter((doc) => {
      const docDate = new Date(doc.timestamp);
      return docDate >= startDate && docDate <= endDate;
    });
  };

  return (
    <Web3Context.Provider
      value={{
        // Wallet & Auth
        provider, account, role, isGuest, signer,
        testAccounts,
        connectWallet, disconnectWallet, enterGuest, changeRole, switchAccount,

        // Contract
        contract, isContractConnected, assignRoleOnContract,

        // IPFS
        ipfsReady, getIPFSUrl: getIPFSUrl,

        // Access Tokens
        generateAccessToken, useAccessToken,

        // Documents
        documents, setDocuments,
        uploadDocument, resubmitDocument, voteOnDocument, approveDocument, rejectDocument, createDocument,

        // Lawyers & Judge
        registeredLawyers, addLawyer, removeLawyer,
        judgeMembers, addJudgeMember, removeJudgeMember,

        // Notifications
        notifications, addNotification,

        // Search & Filter
        searchDocuments, filterDocumentsByStatus, filterDocumentsByDateRange,

        // Statistics
        getStats,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
