import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, ShieldAlert, Crown } from 'lucide-react';

const Navbar = () => {
    const { account, role, isGuest, testAccounts, connectWallet, disconnectWallet, enterGuest, changeRole, switchAccount } = useWeb3();
    const [guestRole, setGuestRole] = useState('Secretary');

    const truncateAddress = (addr) => {
        if (!addr) return 'No account';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <nav className="glass-nav" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert className="glow-success" size={28} />
                <h2 className="gradient-text" style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>JuryDoX</h2>
            </div>

            <div>
                {account ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                <option value={testAccounts?.Jury}>{`Jury (${truncateAddress(testAccounts?.Jury)})`}</option>
                                <option value={testAccounts?.Lawyer}>{`Lawyer (${truncateAddress(testAccounts?.Lawyer)})`}</option>
                            </select>

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
                                <option value="Jury">Jury</option>
                                <option value="Lawyer">Lawyer</option>
                            </select>

                            {role === 'Jury' && (
                                <span className="badge badge-admin" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Crown size={10} /> ADMIN
                                </span>
                            )}
                        </div>
                        <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success-color)' }} className="pulse-element" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{truncateAddress(account)}</span>
                            {isGuest && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', paddingLeft: '8px' }}>(Mode invité)</span>}
                        </div>
                        <button onClick={disconnectWallet} style={{ marginLeft: '12px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Déconnecter
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
                            <option value="Jury">Jury</option>
                            <option value="Lawyer">Lawyer</option>
                        </select>
                        <button onClick={() => enterGuest(guestRole)} style={{ padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                            Entrer en tant que {guestRole}
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
