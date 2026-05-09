import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { UploadCloud, FileText, CheckCircle, Clock, XCircle, FileStack, RefreshCw, Eye, ExternalLink, Hourglass } from 'lucide-react';

const SecretaryDashboard = () => {
    const {
        documents, uploadDocument, resubmitDocument, account,
        filterDocumentsByStatus, searchDocuments, ipfsReady, getIPFSUrl,
        judgeAddress,
    } = useWeb3();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);
    const [isResubmitting, setIsResubmitting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Filter documents
    let displayedDocs = documents;
    if (filterStatus && filterStatus !== 'all') {
        displayedDocs = filterDocumentsByStatus(filterStatus);
    }
    if (searchQuery) {
        displayedDocs = searchDocuments(searchQuery);
    }

    const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'under_review');
    const approvedDocs = documents.filter(d => d.status === 'approved');
    const rejectedDocs = documents.filter(d => d.status === 'rejected');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            await uploadDocument(file.name, file.size, account, file);
            setSuccess(true);
            setFile(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleResubmit = async (docId) => {
        if (!resubmitFile) return;
        setIsResubmitting(docId);

        try {
            await resubmitDocument(docId, resubmitFile.size, account, resubmitFile);
            setResubmitFile(null);
            setSelectedDoc(null);
        } catch (error) {
            console.error('Resubmit failed:', error);
        } finally {
            setIsResubmitting(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
            case 'under_review':
                return 'var(--warning-color)';
            case 'approved':
                return 'var(--success-color)';
            case 'rejected':
                return 'var(--danger-color)';
            case 'resubmitted':
                return 'var(--accent-color)';
            default:
                return 'var(--text-secondary)';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'under_review': return <Clock size={14} />;
            case 'approved': return <CheckCircle size={14} />;
            case 'rejected': return <XCircle size={14} />;
            default: return null;
        }
    };

    const statusBadge = (status) => {
        const badgeClass = status === 'pending' || status === 'under_review' ? 'badge-pending'
            : status === 'approved' ? 'badge-approved'
                : 'badge-refused';
        return <span className={badgeClass}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>;
    };

    // ─── Waiting Gate ───
    if (!judgeAddress) {
        return (
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
                    <Hourglass size={48} color="var(--accent-color)" style={{ marginBottom: '1.2rem', opacity: 0.7 }} />
                    <h2 style={{ marginBottom: '0.5rem' }}>Waiting for Assignment</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        You haven't been assigned to a Judge's case room yet.<br />
                        Ask your Judge to add your wallet address from their dashboard.
                    </p>
                    <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                        Your address: {account}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UploadCloud size={28} color="var(--accent-color)" /> Secretary Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    Upload and manage legal documents through the review process.
                    <span style={{ fontSize: '0.78rem', background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)', borderRadius: '6px', padding: '3px 10px', fontFamily: 'monospace', color: 'var(--accent-color)' }}>
                        Judge: {judgeAddress.slice(0, 6)}...{judgeAddress.slice(-4)}
                    </span>
                </p>
            </div>

            {/* Tabs */}
            <div className="tab-bar">
                <button className="tab-btn" onClick={() => setActiveTab('upload')}>
                    <UploadCloud size={14} /> Upload Document
                </button>
                <button className="tab-btn" onClick={() => setActiveTab('tracking')}>
                    <FileStack size={14} /> Track Documents <span className="count-badge">{documents.length}</span>
                </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
                <div className="fade-in">
                    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <label className="file-upload-label" style={{ marginBottom: '24px' }}>
                            <UploadCloud size={48} color="var(--accent-color)" style={{ marginBottom: '16px' }} />
                            <h3 style={{ marginBottom: '8px' }}>Upload New Document</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click or drag to drop a PDF file</p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                Document will be encrypted and stored on IPFS
                            </div>
                            <input type="file" accept=".pdf" onChange={handleFileChange} />
                        </label>

                        {file && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                                <FileText size={20} color="var(--accent-hover)" />
                                <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                                    <div className="mono">{file.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{(file.size / 1024).toFixed(2)} KB</div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            {isUploading ? (
                                <><UploadCloud size={18} style={{ animation: 'spin 1s linear infinite' }} /> {ipfsReady ? 'Uploading to IPFS...' : 'Uploading...'}</>
                            ) : (
                                <>{ipfsReady ? 'Submit Document (IPFS)' : 'Submit Document for Review'}</>
                            )}
                        </button>

                        {success && (
                            <div className="fade-in" style={{ marginTop: '16px', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <CheckCircle size={18} /> Document submitted successfully!
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
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending/Review</div>
                                </div>
                                <div className="glass-panel" style={{ flex: 1, minWidth: '140px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{approvedDocs.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved</div>
                                </div>
                                <div className="glass-panel" style={{ flex: 1, minWidth: '140px', padding: '16px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger-color)' }}>{rejectedDocs.length}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected</div>
                                </div>
                            </div>

                            {/* Search & Filter */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Search by document name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ flex: 1, minWidth: '200px' }}
                                />
                                <select
                                    className="text-input"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ minWidth: '150px' }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Document list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {displayedDocs.length === 0 ? (
                                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No documents match your criteria
                                    </div>
                                ) : (
                                    displayedDocs.map(doc => (
                                        <div key={doc.id} className="glass-panel" style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: getStatusColor(doc.status), marginTop: '2px' }}>
                                                        {getStatusIcon(doc.status)}
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {doc.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                            <div className="mono">ID: {doc.id.slice(0, 12)}...</div>
                                                            <div className="mono">v{doc.version} � {new Date(doc.timestamp).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                                    {statusBadge(doc.status)}
                                                    <button
                                                        className="btn-ghost btn-sm"
                                                        onClick={() => setSelectedDoc(doc)}
                                                        title="View details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rejection info */}
                                            {doc.status === 'rejected' && doc.rejectionComment && (
                                                <div style={{ background: 'rgba(255, 0, 0, 0.05)', border: '1px solid var(--danger-color)', borderRadius: '6px', padding: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                                                    <div style={{ color: 'var(--danger-color)', fontWeight: 600, marginBottom: '4px' }}>Rejection Reason:</div>
                                                    <div style={{ color: 'var(--text-secondary)' }}>{doc.rejectionComment}</div>
                                                </div>
                                            )}

                                            {/* Resubmit button */}
                                            {doc.status === 'rejected' && (
                                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--accent-color)', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                                                    <div style={{ marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                        <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                                        Resubmit Updated Document
                                                    </div>
                                                    {resubmitFile ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', background: 'rgba(20,184,166,0.1)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(20,184,166,0.2)' }}>
                                                            <FileText size={16} color="var(--accent-color)" />
                                                            <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{resubmitFile.name}</div>
                                                            <button onClick={() => setResubmitFile(null)} style={{ background: 'none', border: 'none', padding: '2px', color: 'var(--text-secondary)' }}><XCircle size={14}/></button>
                                                        </div>
                                                    ) : (
                                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(20,184,166,0.5)', borderRadius: '8px', padding: '16px', cursor: 'pointer', marginBottom: '12px', background: 'rgba(20,184,166,0.05)', transition: 'all 0.2s' }}>
                                                            <UploadCloud size={20} color="var(--accent-color)" style={{ marginBottom: '6px' }} />
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click to select updated PDF</span>
                                                            <input
                                                                type="file"
                                                                accept=".pdf"
                                                                onChange={(e) => setResubmitFile(e.target.files?.[0])}
                                                            />
                                                        </label>
                                                    )}
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => {
                                                            if (!resubmitFile) {
                                                                alert('Please select a PDF file to resubmit.');
                                                                return;
                                                            }
                                                            handleResubmit(doc.id);
                                                        }}
                                                        disabled={isResubmitting === doc.id}
                                                        style={{ width: '100%', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                    >
                                                        {isResubmitting === doc.id ? '⏳ Resubmitting...' : 'Submit New Version'}
                                                    </button>
                                                </div>
                                            )}

                                            {selectedDoc?.id === doc.id && (
                                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <strong>IPFS Hash:</strong> <code style={{ fontSize: '0.75rem' }}>{doc.ipfsHash}</code>
                                                        {doc.ipfsHash && !doc.ipfsHash.startsWith('Qm') && (
                                                            <a href={getIPFSUrl(doc.ipfsHash)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                <ExternalLink size={12} /> View
                                                            </a>
                                                        )}
                                                    </div>
                                                    {doc.txHash && <div><strong>TX Hash:</strong> <code style={{ fontSize: '0.75rem' }}>{doc.txHash}</code></div>}
                                                    {doc.votes?.length > 0 && (
                                                        <div style={{ marginTop: '8px' }}>
                                                            <strong>Judge Votes ({doc.votes.length}):</strong>
                                                            {doc.votes.map((vote, i) => (
                                                                <div key={i} style={{ marginLeft: '12px', fontSize: '0.8rem' }}>
                                                                    {vote.vote.toUpperCase()} {vote.comment ? `- ${vote.comment}` : ''}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SecretaryDashboard;
