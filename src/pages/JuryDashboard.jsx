import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Gavel, CheckCircle, XCircle, Clock, UserPlus, Users, Trash2, FileText, ClipboardList, AlertTriangle } from 'lucide-react';

const JuryDashboard = () => {
    const { documents, registeredLawyers, addLawyer, removeLawyer, approveDocument, refuseDocument, provider } = useWeb3();
    const [activeTab, setActiveTab] = useState('pending');
    const [lawyerInput, setLawyerInput] = useState('');
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [refuseReasonInput, setRefuseReasonInput] = useState('');
    const [refusingId, setRefusingId] = useState(null);

    const pendingDocs = documents.filter(d => d.status === 'Pending');
    const approvedDocs = documents.filter(d => d.status === 'Approved');
    const refusedDocs = documents.filter(d => d.status === 'Refused');

    const handleAddLawyer = () => {
        setAddError('');
        setAddSuccess('');
        const addr = lawyerInput.trim();
        if (!addr) {
            setAddError('Please enter a wallet address.');
            return;
        }
        if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
            setAddError('Invalid Ethereum address format (must be 0x + 40 hex characters).');
            return;
        }
        const ok = addLawyer(addr);
        if (ok) {
            setAddSuccess(`Lawyer ${addr.slice(0, 6)}...${addr.slice(-4)} registered successfully!`);
            setLawyerInput('');
            setTimeout(() => setAddSuccess(''), 3000);
        } else {
            setAddError('This address is already registered.');
        }
    };

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            if (provider) {
                const signer = await provider.getSigner();
                await signer.signMessage(`Approve Document ID: ${id}`);
            }
            setTimeout(() => {
                approveDocument(id);
                setProcessingId(null);
            }, 1500);
        } catch (error) {
            console.error("Approval failed:", error);
            setProcessingId(null);
        }
    };

    const handleRefuseStart = (id) => {
        setRefusingId(id);
        setRefuseReasonInput('');
    };

    const handleRefuseConfirm = (id) => {
        setProcessingId(id);
        setTimeout(() => {
            refuseDocument(id, refuseReasonInput || 'No reason provided');
            setProcessingId(null);
            setRefusingId(null);
            setRefuseReasonInput('');
        }, 1000);
    };

    const truncateAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="container">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Gavel size={28} color="var(--accent-color)" />
                    <h2 className="glow-text" style={{ margin: 0 }}>Jury Administration</h2>
                    <span className="badge badge-admin">ADMIN</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Manage registered lawyers and review submitted documents.</p>
            </div>

            {/* ─── Lawyer Management ─── */}
            <div className="glass-panel" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Users size={20} color="var(--accent-color)" />
                    <h3 style={{ margin: 0 }}>Lawyer Registry</h3>
                    <span className="count-badge" style={{ marginLeft: '4px' }}>{registeredLawyers.length}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        className="text-input"
                        placeholder="Enter lawyer wallet address (0x...)"
                        value={lawyerInput}
                        onChange={(e) => { setLawyerInput(e.target.value); setAddError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLawyer()}
                        style={{ fontFamily: "'Inter', monospace" }}
                    />
                    <button onClick={handleAddLawyer} style={{ whiteSpace: 'nowrap' }}>
                        <UserPlus size={16} /> Add Lawyer
                    </button>
                </div>

                {addError && (
                    <div className="fade-in" style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> {addError}
                    </div>
                )}
                {addSuccess && (
                    <div className="fade-in" style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> {addSuccess}
                    </div>
                )}

                {registeredLawyers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No lawyers registered yet. Add wallet addresses above.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {registeredLawyers.map((addr, i) => (
                            <div key={addr} className="lawyer-item fade-in">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--warning-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-hover)' }}>{truncateAddr(addr)}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full: {addr}</div>
                                    </div>
                                </div>
                                <button className="btn-ghost btn-sm" onClick={() => removeLawyer(addr)} title="Remove lawyer">
                                    <Trash2 size={14} color="var(--danger-color)" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Document Review ─── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ClipboardList size={20} color="var(--accent-color)" />
                <h3 style={{ margin: 0 }}>Document Review</h3>
            </div>

            <div className="tab-bar">
                <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    <Clock size={14} /> Pending <span className="count-badge">{pendingDocs.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                    <CheckCircle size={14} /> Approved <span className="count-badge">{approvedDocs.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'refused' ? 'active' : ''}`} onClick={() => setActiveTab('refused')}>
                    <XCircle size={14} /> Refused <span className="count-badge">{refusedDocs.length}</span>
                </button>
            </div>

            {/* Pending Tab */}
            {activeTab === 'pending' && (
                <>
                    {pendingDocs.length === 0 ? (
                        <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Clock size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No Pending Documents</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>All caught up! Waiting for Secretary submissions.</p>
                        </div>
                    ) : (
                        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
                            {pendingDocs.map(doc => (
                                <div key={doc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '65%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={18} /> {doc.name}
                                        </h3>
                                        <span className="badge badge-pending">Pending Review</span>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>IPFS Hash:</div>
                                        <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--accent-hover)' }}>{doc.ipfsHash}</div>
                                        <div style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '4px' }}>Submitted:</div>
                                        <div>{new Date(doc.timestamp).toLocaleString()}</div>
                                    </div>

                                    {refusingId === doc.id ? (
                                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="text-input"
                                                placeholder="Reason for refusal (optional)"
                                                value={refuseReasonInput}
                                                onChange={(e) => setRefuseReasonInput(e.target.value)}
                                                autoFocus
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleRefuseConfirm(doc.id)} disabled={processingId === doc.id}>
                                                    {processingId === doc.id ? <><Clock className="animate-spin" size={16} /> Refusing...</> : <><XCircle size={16} /> Confirm Refuse</>}
                                                </button>
                                                <button className="btn-ghost" onClick={() => setRefusingId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                            <button className="btn-success" style={{ flex: 1 }} onClick={() => handleApprove(doc.id)} disabled={processingId === doc.id}>
                                                {processingId === doc.id ? <><Clock className="animate-spin" size={16} /> Processing...</> : <><CheckCircle size={16} /> Approve</>}
                                            </button>
                                            <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleRefuseStart(doc.id)} disabled={processingId === doc.id}>
                                                <XCircle size={16} /> Refuse
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Approved Tab */}
            {activeTab === 'approved' && (
                <>
                    {approvedDocs.length === 0 ? (
                        <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                            <CheckCircle size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No Approved Documents</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Approved documents will appear here.</p>
                        </div>
                    ) : (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {approvedDocs.map(doc => (
                                <div key={doc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FileText size={18} /> {doc.name}</h3>
                                        <span className="badge badge-approved">Approved</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>IPFS Hash</div>
                                            <div style={{ fontFamily: 'monospace', color: 'var(--accent-hover)', wordBreak: 'break-all' }}>{doc.ipfsHash}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Tx Hash</div>
                                            <div style={{ fontFamily: 'monospace', color: 'var(--success-color)', wordBreak: 'break-all' }}>{doc.txHash ? `${doc.txHash.slice(0, 10)}...${doc.txHash.slice(-8)}` : '—'}</div>
                                        </div>
                                    </div>
                                    {doc.reviewedAt && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Approved on {new Date(doc.reviewedAt).toLocaleString()}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Refused Tab */}
            {activeTab === 'refused' && (
                <>
                    {refusedDocs.length === 0 ? (
                        <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                            <XCircle size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No Refused Documents</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Refused documents will appear here.</p>
                        </div>
                    ) : (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {refusedDocs.map(doc => (
                                <div key={doc.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><FileText size={18} /> {doc.name}</h3>
                                        <span className="badge badge-refused">Refused</span>
                                    </div>
                                    <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                                        <div style={{ color: 'var(--danger-color)', fontWeight: 500, marginBottom: '4px' }}>Reason:</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{doc.refuseReason || 'No reason provided'}</div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        IPFS: <span style={{ fontFamily: 'monospace', color: 'var(--accent-hover)' }}>{doc.ipfsHash}</span>
                                    </div>
                                    {doc.reviewedAt && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Refused on {new Date(doc.reviewedAt).toLocaleString()}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JuryDashboard;
