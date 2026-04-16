import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, ShieldAlert, Crown, Wifi, WifiOff } from 'lucide-react';

const Navbar = () => {
    const {
        account, role, isGuest, isContractConnected, ipfsReady,
        testAccounts, connectWallet, disconnectWallet, enterGuest, changeRole, switchAccount
    } = useWeb3();
    const [guestRole, setGuestRole] = useState('Secretary');

    const truncateAddress = (addr) => {
        if (!addr) return 'No account';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <nav className="glass-nav" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert className="glow-success" size={28} />
                <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>JudgeDoX</h2>

                {/* Status indicators */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
                    <span title={isContractConnected ? 'Connected to smart contract' : 'No contract (mock mode)'}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
                            background: isContractConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: isContractConnected ? 'var(--success-color)' : 'var(--text-secondary)',
                            border: `1px solid ${isContractConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
                        }}
                    >
                        {isContractConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                        {isContractConnected ? 'On-Chain' : 'Mock'}
                    </span>
                    <span title={ipfsReady ? 'IPFS via Pinata' : 'IPFS not configured'}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
                            background: ipfsReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: ipfsReady ? 'var(--success-color)' : 'var(--text-secondary)',
                            border: `1px solid ${ipfsReady ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
                        }}
                    >
                        {ipfsReady ? '📦 IPFS' : '📦 No IPFS'}
                    </span>
                </div>
            </div>

            <div>
                {account ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Only show test account switcher in guest mode */}
                            {isGuest && (
                                <select
                                    value={account || ''}
                                    onChange={(e) => switchAccount(e.target.value)}
                                    style={{
                                        background: 'rgba(20, 184, 166, 0.1)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(20, 184, 166, 0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: 600
                                    }}
                                >
                                    <option value={testAccounts?.Secretary}>{`Secretary (${truncateAddress(testAccounts?.Secretary)})`}</option>
                                    <option value={testAccounts?.Judge}>{`Judge (${truncateAddress(testAccounts?.Judge)})`}</option>
                                    <option value={testAccounts?.Lawyer}>{`Lawyer (${truncateAddress(testAccounts?.Lawyer)})`}</option>
                                </select>
                            )}

                            {/* Only show role switcher in guest mode */}
                            {isGuest && (
                                <select
                                    value={role || ''}
                                    onChange={(e) => changeRole(e.target.value)}
                                    style={{
                                        background: 'rgba(100, 116, 139, 0.1)',
                                        color: 'var(--accent-hover)',
                                        border: '1px solid rgba(100, 116, 139, 0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        fontWeight: 600
                                    }}
                                >
                                    <option value="Secretary">Secretary</option>
                                    <option value="Judge">Judge</option>
                                    <option value="Lawyer">Lawyer</option>
                                </select>
                            )}

                            {/* Show role badge when connected via wallet */}
                            {!isGuest && role && (
                                <span style={{
                                    padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                                    background: role === 'Judge' ? 'rgba(234, 179, 8, 0.15)' :
                                        role === 'Secretary' ? 'rgba(20, 184, 166, 0.15)' :
                                            'rgba(139, 92, 246, 0.15)',
                                    color: role === 'Judge' ? 'var(--warning-color)' :
                                        role === 'Secretary' ? 'var(--accent-color)' :
                                            '#8b5cf6',
                                    border: `1px solid ${role === 'Judge' ? 'rgba(234, 179, 8, 0.3)' :
                                        role === 'Secretary' ? 'rgba(20, 184, 166, 0.3)' :
                                            'rgba(139, 92, 246, 0.3)'}`
                                }}>
                                    {role}
                                </span>
                            )}

                            {!isGuest && !role && account && (
                                <span style={{
                                    padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                                    background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}>
                                    No Role Assigned
                                </span>
                            )}

                            {role === 'Judge' && (
                                <span className="badge badge-admin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Crown size={10} /> ADMIN
                                </span>
                            )}
                        </div>
                        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success-color)' }} className="pulse-element" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{truncateAddress(account)}</span>
                            {isGuest && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', paddingLeft: '8px' }}>(Guest)</span>}
                            {!isGuest && isContractConnected && <span style={{ fontSize: '0.8rem', color: 'var(--success-color)', paddingLeft: '8px' }}>(On-Chain)</span>}
                        </div>
                        <button onClick={disconnectWallet} style={{ marginLeft: '12px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            value={guestRole}
                            onChange={(e) => setGuestRole(e.target.value)}
                            style={{
                                background: 'rgba(100, 116, 139, 0.1)',
                                color: 'var(--accent-hover)',
                                border: '1px solid rgba(100, 116, 139, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                outline: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontWeight: 600
                            }}
                        >
                            <option value="Secretary">Secretary</option>
                            <option value="Judge">Judge</option>
                            <option value="Lawyer">Lawyer</option>
                        </select>
                        <button onClick={() => enterGuest(guestRole)} style={{ padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Guest: {guestRole}
                        </button>
                        <button onClick={connectWallet} style={{ padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                            <Wallet size={18} /> Connect Wallet
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
