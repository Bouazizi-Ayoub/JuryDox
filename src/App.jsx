import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import NotificationCenter from './components/NotificationCenter';
import SecretaryDashboard from './pages/SecretaryDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const RoleBasedRoute = ({ children, allowedRole }) => {
  const { role } = useWeb3();
  if (!role) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 className="glow-text">Veuillez choisir un rôle ou connecter un wallet pour continuer.</h2>
      </div>
    );
  }
  if (role !== allowedRole) {
    return <Navigate to="/" />;
  }
  return children;
};

const DashboardRouter = () => {
  const { role } = useWeb3();

  if (!role) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '10rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="glow-text gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          JudgeDoX Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', lineHeight: 1.6 }}>
          A decentralized, tamper-proof platform pour gérer les documents juridiques.
          Choisissez un rôle invité ou connectez votre wallet pour continuer.
        </p>
      </div>
    );
  }

  switch (role) {
    case 'Secretary': return <Navigate to="/secretary" />;
    case 'Judge': return <Navigate to="/judge" />;
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
        <NotificationCenter />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/secretary" element={
              <RoleBasedRoute allowedRole="Secretary">
                <SecretaryDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/judge" element={
              <RoleBasedRoute allowedRole="Judge">
                <JudgeDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/lawyer" element={
              <RoleBasedRoute allowedRole="Lawyer">
                <LawyerDashboard />
              </RoleBasedRoute>
            } />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
};

export default App;
