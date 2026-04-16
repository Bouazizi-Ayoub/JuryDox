import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Briefcase, ShieldCheck, FileText, Eye, ExternalLink, Download, Key } from 'lucide-react';

const LawyerDashboard = () => {
    const { getIPFSUrl, useAccessToken } = useWeb3();
    const [unlockedDocs, setUnlockedDocs] = useState([]);
    const [tokenInput, setTokenInput] = useState('');

    const handleUseToken = () => {
        if (!tokenInput.trim()) return;
        const doc = useAccessToken(tokenInput.trim());
        if (doc) {
            setUnlockedDocs(prev => {
                if (prev.find(d => d.id === doc.id)) return prev;
                return [doc, ...prev];
            });
            setTokenInput('');
        }
    };

    const truncateTx = (tx) => {
        if (!tx) return '—';
        return `${tx.slice(0, 10)}...${tx.slice(-8)}`;
    };

    const isRealHash = (hash) => hash && !hash.startsWith('Qm');

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={28} color="var(--accent-color)" /> Lawyer Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>View legal documents securely using a one-time access token provided by the Judge.</p>
            </div>

            {/* Token Input Section */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <Key size={32} color="var(--accent-color)" />
                <h3 style={{ margin: 0 }}>Unlock Document</h3>
                <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px' }}>
                    <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Enter Access Token"
                        style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.3)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)' }}
                    />
                    <button className="btn-primary" onClick={handleUseToken}>
                        Unlock
                    </button>
                </div>
            </div>

            {unlockedDocs.length === 0 ? (
                <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShieldCheck size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No Documents Unlocked</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Use an access token above to securely view a document.</p>
                </div>
            ) : (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Unlocked Documents</h3>
                    {unlockedDocs.map(doc => (
                        <div key={doc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    <FileText size={18} /> {doc.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="badge badge-approved">Approved</span>
                                    <span className="badge badge-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Eye size={10} /> Read Only
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>IPFS Hash</div>
                                    <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--accent-hover)' }}>{doc.ipfsHash}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Transaction Hash</div>
                                    <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--success-color)' }}>{truncateTx(doc.txHash)}</div>
                                </div>
                            </div>

                            {/* IPFS View/Download buttons */}
                            {isRealHash(doc.ipfsHash) && (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <a
                                        href={getIPFSUrl(doc.ipfsHash)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px', borderRadius: '8px',
                                            background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)',
                                            color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.85rem',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <ExternalLink size={14} /> View on IPFS
                                    </a>
                                    <a
                                        href={getIPFSUrl(doc.ipfsHash)}
                                        download={doc.name}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px', borderRadius: '8px',
                                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                                            color: 'var(--success-color)', textDecoration: 'none', fontSize: '0.85rem',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <Download size={14} /> Download
                                    </a>
                                </div>
                            )}

                            {!isRealHash(doc.ipfsHash) && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    ⚠️ Mock IPFS hash — file not stored on IPFS
                                </div>
                            )}

                            {doc.reviewedAt && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Approved on {new Date(doc.reviewedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LawyerDashboard;
