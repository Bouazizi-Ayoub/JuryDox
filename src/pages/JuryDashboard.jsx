import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { BarChart2, FileText, CheckCircle2, XCircle, Download, Eye } from 'lucide-react';

const JuryDashboard = () => {
    const { documents, voteOnDocument, getStats, account, role } = useWeb3();
    const [comments, setComments] = useState({});
    const [selectedDocId, setSelectedDocId] = useState(null);

    const stats = getStats();
    const pendingDocs = documents.filter(d => d.status === 'pending' || d.status === 'under_review');

    const handleCommentChange = (docId, value) => {
        setComments(prev => ({ ...prev, [docId]: value }));
    };

    const handleVote = (docId, decision) => {
        const comment = (comments[docId] || '').trim();
        if (decision === 'reject' && comment === '') {
            alert('Le commentaire est obligatoire pour un rejet.');
            return;
        }

        voteOnDocument(docId, account || role, decision, comment);
        setComments(prev => ({ ...prev, [docId]: '' }));
    };

    const viewDocument = (ipfsHash) => {
        // Utilise le gateway IPFS configuré ou un gateway public par défaut
        const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
        const url = `${gateway}/${ipfsHash}`;
        window.open(url, '_blank');
    };

    const downloadDocument = async (ipfsHash, fileName) => {
        try {
            const gateway = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
            const url = `${gateway}/${ipfsHash}`;

            // Pour le téléchargement, on ouvre dans un nouvel onglet
            // En production, tu pourrais implémenter un vrai téléchargement avec fetch + blob
            window.open(url, '_blank');

            // Alternative pour vrai téléchargement (si besoin) :
            /*
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName || `document-${ipfsHash.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
            */
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            alert('Erreur lors du téléchargement du document');
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart2 size={28} color="var(--accent-color)" /> Jury Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Accès jury (en mode {role || 'inconnu'}). Gestion des votes et revue des documents.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="card glass-panel">
                    <h3>Documents totaux</h3>
                    <p>{stats.total}</p>
                </div>
                <div className="card glass-panel">
                    <h3>En attente</h3>
                    <p>{stats.pending + stats.underReview}</p>
                </div>
                <div className="card glass-panel">
                    <h3>Approuvés</h3>
                    <p>{stats.approved}</p>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}><FileText size={18} /> Liste des documents en attente</h3>
                {pendingDocs.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        Aucun document en attente pour le moment.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingDocs.map(doc => (
                            <div key={doc.id} className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 8px 0' }}>{doc.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            Status: {doc.status}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Uploadé par: {doc.uploadedBy || 'Anonyme'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            IPFS: {doc.ipfsHash.slice(0, 16)}...
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column' }}>
                                        <span className="badge badge-role">{doc.status}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => viewDocument(doc.ipfsHash)}
                                                style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
                                                title="Voir le document"
                                            >
                                                <Eye size={12} />
                                            </button>
                                            <button
                                                onClick={() => downloadDocument(doc.ipfsHash, doc.name)}
                                                style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
                                                title="Télécharger le document"
                                            >
                                                <Download size={12} />
                                            </button>
                                            <button onClick={() => setSelectedDocId(doc.id)} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                Historique
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px' }}>
                                    <textarea
                                        value={comments[doc.id] || ''}
                                        onChange={(e) => handleCommentChange(doc.id, e.target.value)}
                                        placeholder="Commentaire (obligatoire pour rejet)"
                                        style={{ width: '100%', minHeight: '80px', marginBottom: '8px', borderRadius: '8px', padding: '10px', border: '1px solid rgba(100,116,139,0.25)', background: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-primary" onClick={() => handleVote(doc.id, 'approve')}>
                                            <CheckCircle2 size={16} /> Approuver
                                        </button>
                                        <button className="btn-danger" onClick={() => handleVote(doc.id, 'reject')}>
                                            <XCircle size={16} /> Rejeter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 style={{ marginBottom: '1rem' }}>Historique de document</h3>
                {selectedDocId ? (
                    (() => {
                        const doc = documents.find(d => d.id === selectedDocId);
                        if (!doc) return <div>Aucun document sélectionné.</div>;
                        return (
                            <div className="glass-panel" style={{ padding: '16px', borderRadius: '10px' }}>
                                <h4>{doc.name}</h4>
                                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                    {doc.auditTrail.map((entry, index) => (
                                        <li key={`${entry.action}-${index}`} style={{ marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <strong>{entry.action}</strong> par {entry.user} le {new Date(entry.date).toLocaleString()} - {entry.comment}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()
                ) : (
                    <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px', color: 'var(--text-secondary)' }}>
                        Sélectionnez un document en attente pour voir l'historique.
                    </div>
                )}
            </div>
        </div>
    );
};

export default JuryDashboard;

