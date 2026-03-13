import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import SecretaryDashboard from './pages/SecretaryDashboard';
import JuryDashboard from './pages/JuryDashboard';
import LawyerDashboard from './pages/LawyerDashboard';

const RoleBasedRoute = ({ children, allowedRole }) => {
  const { role, account } = useWeb3();
  if (!account) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="glow-text">Please connect your wallet to continue.</h2>
      </div>
    );
  }
  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }
  return children;
};

const DashboardRouter = () => {
  const { role, account } = useWeb3();

  if (!account) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '10rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="glow-text gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          JuryDoX Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.6 }}>
          A decentralized, tamper-proof platform for managing legal documents.
          Connect your wallet to access your role-specific dashboard.
        </p>
      </div>
    );
  }

  switch (role) {
    case 'Secretary': return <Navigate to="/secretary" />;
    case 'Jury': return <Navigate to="/jury" />;
    case 'Lawyer': return <Navigate to="/lawyer" />;
    default: return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="glow-text" style={{ color: 'var(--danger-color)' }}>Unknown Role</h2>
      </div>
    );
  }
};

const App = () => {
  return (
    <Web3Provider>
      <BrowserRouter>
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/secretary" element={
              <RoleBasedRoute allowedRole="Secretary">
                <SecretaryDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/jury" element={
              <RoleBasedRoute allowedRole="Jury">
                <JuryDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/lawyer" element={
              <RoleBasedRoute allowedRole="Lawyer">
                <LawyerDashboard />
              </RoleBasedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
};

export default App;
