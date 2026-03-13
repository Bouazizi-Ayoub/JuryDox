import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null); // 'Secretary', 'Jury', 'Lawyer'

  // Centralized mock state for documents
  // shape: { id, name, ipfsHash, status: 'Pending'|'Approved'|'Refused', txHash?, reviewedAt?, refuseReason? }
  const [documents, setDocuments] = useState([]);

  // Registered lawyer wallet addresses (managed by the Jury)
  const [registeredLawyers, setRegisteredLawyers] = useState([]);

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
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setRole(assignRole(accounts[0]));
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
    setRole(newRole);
  };

  // --- Jury admin actions ---
  const addLawyer = (address) => {
    if (!address || registeredLawyers.includes(address.toLowerCase())) return false;
    setRegisteredLawyers([...registeredLawyers, address.toLowerCase()]);
    return true;
  };

  const removeLawyer = (address) => {
    setRegisteredLawyers(registeredLawyers.filter(a => a !== address.toLowerCase()));
  };

  const approveDocument = (id) => {
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, status: 'Approved', txHash: mockTxHash, reviewedAt: new Date().toISOString() } : doc
    ));
  };

  const refuseDocument = (id, reason = '') => {
    setDocuments(prev => prev.map(doc =>
      doc.id === id ? { ...doc, status: 'Refused', refuseReason: reason, reviewedAt: new Date().toISOString() } : doc
    ));
  };

  return (
    <Web3Context.Provider value={{
      provider, account, role,
      connectWallet, disconnectWallet, changeRole,
      documents, setDocuments,
      registeredLawyers, addLawyer, removeLawyer,
      approveDocument, refuseDocument
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
