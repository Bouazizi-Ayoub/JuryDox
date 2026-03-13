import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { UploadCloud, FileText, CheckCircle, Clock, XCircle, FileStack } from 'lucide-react';

const SecretaryDashboard = () => {
    const { documents, setDocuments } = useWeb3();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');

    const pendingDocs = documents.filter(d => d.status === 'Pending');
    const approvedDocs = documents.filter(d => d.status === 'Approved');
    const refusedDocs = documents.filter(d => d.status === 'Refused');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setIsUploading(true);

        // Simulate IPFS upload delay
        setTimeout(() => {
            const mockIpfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            const newDoc = {
                id: Date.now().toString(),
                name: file.name,
                ipfsHash: mockIpfsHash,
                status: 'Pending',
                timestamp: new Date().toISOString()
            };

            setDocuments([...documents, newDoc]);
            setIsUploading(false);
            setSuccess(true);
            setFile(null);

            setTimeout(() => setSuccess(false), 3000);
        }, 2000);
    };

    const statusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={14} color="var(--warning-color)" />;
            case 'Approved': return <CheckCircle size={14} color="var(--success-color)" />;
            case 'Refused': return <XCircle size={14} color="var(--danger-color)" />;
            default: return null;
        }
    };

    const statusBadge = (status) => {
        const cls = status === 'Pending' ? 'badge-pending' : status === 'Approved' ? 'badge-approved' : 'badge-refused';
        return <span className={`badge ${cls}`}>{status}</span>;
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UploadCloud size={28} color="var(--accent-color)" /> Secretary Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Upload legal documents for Jury review and track their status.</p>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
                <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                    <UploadCloud size={14} /> Upload Document
                </button>
                <button className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
                    <FileStack size={14} /> All Documents <span className="count-badge">{documents.length}</span>
                </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
                <div className="fade-in">
                    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <label className="file-upload-label" style={{ marginBottom: '24px' }}>
                            <UploadCloud size={48} color="var(--accent-color)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Select PDF Document</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click or drag to drop a file</p>
                            <input type="file" accept=".pdf" onChange={handleFileChange} />
                        </label>

                        {file && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                                <FileText size={20} color="var(--accent-hover)" />
                                <span>{file.name}</span>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            {isUploading ? (
                                <><UploadCloud className="animate-spin" size={18} /> Uploading to IPFS...</>
                            ) : (
                                <>Submit Document for Review</>
                            )}
                        </button>

                        {success && (
                            <div className="fade-in" style={{ marginTop: '16px', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <CheckCircle size={18} /> Document uploaded and queued for Jury review!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tracking Tab */}
            {activeTab === 'tracking' && (
                <div className="fade-in">
                    {documents.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <FileStack size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>No Documents Yet</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Upload your first document to get started.</p>
                        </div>
                    ) : (
                        <>
                            {/* Summary bar */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div className="glass-panel" style={{ flex: 1, minWidth: '140px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning-color)' }}>{pendingDocs.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                                </div>
                                <div className="glass-panel" style={{ flex: 1, minWidth: '140px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{approvedDocs.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</div>
                                </div>
                                <div className="glass-panel" style={{ flex: 1, minWidth: '140px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger-color)' }}>{refusedDocs.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refused</div>
                                </div>
                            </div>

                            {/* Document list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {documents.map(doc => (
                                    <div key={doc.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                            {statusIcon(doc.status)}
                                            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{doc.ipfsHash.slice(0, 12)}...</span>
                                            {statusBadge(doc.status)}
                                        </div>
                                        {doc.status === 'Refused' && doc.refuseReason && (
                                            <div style={{ width: '100%', fontSize: '0.8rem', color: 'var(--danger-color)', paddingLeft: '28px', marginTop: '4px' }}>
                                                Reason: {doc.refuseReason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SecretaryDashboard;
