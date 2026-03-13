import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Briefcase, ShieldCheck, FileText, Eye } from 'lucide-react';

const LawyerDashboard = () => {
    const { documents } = useWeb3();

    const approvedDocs = documents.filter(d => d.status === 'Approved');

    const truncateTx = (tx) => {
        if (!tx) return '—';
        return `${tx.slice(0, 10)}...${tx.slice(-8)}`;
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={28} color="var(--accent-color)" /> Lawyer Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>View approved legal documents. Read-only access.</p>
            </div>

            {approvedDocs.length === 0 ? (
                <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                    <ShieldCheck size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No Approved Documents</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Documents will appear here once the Jury approves them.</p>
                </div>
            ) : (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {approvedDocs.map(doc => (
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
