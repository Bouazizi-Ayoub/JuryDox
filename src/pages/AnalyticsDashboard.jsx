import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { BarChart3, TrendingUp, FileText, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

const AnalyticsDashboard = () => {
    const { documents, getStats } = useWeb3();
    const stats = getStats();

    // Calculate additional metrics
    const avgTimeToApproval = documents
        .filter(d => d.status === 'approved' && d.reviewedAt)
        .reduce((sum, d) => sum + (new Date(d.reviewedAt) - new Date(d.timestamp)), 0) / 
        Math.max(documents.filter(d => d.status === 'approved').length, 1);

    const versionStats = documents.reduce((acc, doc) => {
        acc.totalVersions += doc.version;
        acc.avgVersion = acc.totalVersions / documents.length;
        return acc;
    }, { totalVersions: 0, avgVersion: 0 });

    const juryVoteStats = documents.reduce((acc, doc) => {
        acc.totalVotes += doc.votes.length;
        acc.avgVotesPerDoc = acc.totalVotes / Math.max(documents.length, 1);
        return acc;
    }, { totalVotes: 0, avgVotesPerDoc: 0 });

    const rejectionsWithComments = documents.filter(d => d.status === 'rejected' && d.rejectionComment).length;

    const today = new Date();
    const thisMonth = documents.filter(d => {
        const docDate = new Date(d.timestamp);
        return docDate.getMonth() === today.getMonth() && docDate.getFullYear() === today.getFullYear();
    });

    const thisWeek = documents.filter(d => {
        const docDate = new Date(d.timestamp);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return docDate >= weekAgo;
    });

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="glow-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={28} color="var(--accent-color)" /> Analytics Dashboard
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time statistics and document workflow metrics</p>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <FileText size={32} color="var(--accent-color)" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4px' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Documents</div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <CheckCircle size={32} color="var(--success-color)" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4px', color: 'var(--success-color)' }}>{stats.approved}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved ({stats.approvePercentage}%)</div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <XCircle size={32} color="var(--danger-color)" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4px', color: 'var(--danger-color)' }}>{stats.rejected}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected ({stats.rejectPercentage}%)</div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <Clock size={32} color="var(--warning-color)" style={{ marginBottom: '12px', opacity: 0.7 }} />
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '4px', color: 'var(--warning-color)' }}>{stats.pending + stats.underReview}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending ({stats.pendingPercentage}%)</div>
                </div>
            </div>

            {/* Advanced Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <TrendingUp size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Document Versions</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                {versionStats.avgVersion.toFixed(1)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Average version per document
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5 }}>
                            {versionStats.totalVersions}
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <TrendingUp size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Jury Voting</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                {juryVoteStats.avgVotesPerDoc.toFixed(1)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Average votes per document
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5 }}>
                            {juryVoteStats.totalVotes}
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <CheckCircle size={20} color="var(--success-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Rejection Quality</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>
                                {stats.rejected > 0 ? Math.round((rejectionsWithComments / stats.rejected) * 100) : 0}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Rejections with comments
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-secondary)', opacity: 0.5 }}>
                            {rejectionsWithComments}/{stats.rejected}
                        </div>
                    </div>
                </div>
            </div>

            {/* Time-based Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Calendar size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>This Week</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{thisWeek.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Documents</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                                {thisWeek.filter(d => d.status === 'approved').length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Approved</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Calendar size={20} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>This Month</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{thisMonth.length}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Documents</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>
                                {thisMonth.filter(d => d.status === 'approved').length}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Approved</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Status Breakdown */}
            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={20} color="var(--accent-color)" /> Status Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span>Approved</span>
                            <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>{stats.approvePercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.approvePercentage}%`, height: '100%', background: 'var(--success-color)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span>Rejected</span>
                            <span style={{ fontWeight: 600, color: 'var(--danger-color)' }}>{stats.rejectPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.rejectPercentage}%`, height: '100%', background: 'var(--danger-color)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                            <span>Pending/Review</span>
                            <span style={{ fontWeight: 600, color: 'var(--warning-color)' }}>{stats.pendingPercentage}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${stats.pendingPercentage}%`, height: '100%', background: 'var(--warning-color)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
