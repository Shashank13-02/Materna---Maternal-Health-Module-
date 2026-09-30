import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import OTPLoginPage from './pages/OTPLoginPage';
import DashboardPage from './pages/DashboardPage';
import ANCFormPage from './pages/ANCFormPage';
import MotherWellbeingPage from './pages/MotherWellbeingPage';
import AppIcon from './components/AppIcon';
import { registerAutoSync } from './services/syncService';
import './i18n/index.js';

function SyncStatusBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => { setOnline(true); setSyncing(true); setShowBanner(true); };
    const handleOffline = () => { setOnline(false); setShowBanner(true); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const cleanup = registerAutoSync(() => {
      setSyncing(false);
      setTimeout(() => setShowBanner(false), 2500);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`sync-banner ${!online ? 'offline' : syncing ? 'syncing' : 'synced'}`} role="status">
      {!online ? '📶 Offline — data saved locally'
        : syncing ? '↑ Syncing records...'
        : '✓ Records synced'}
    </div>
  );
}

function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAuth = ['/', '/login', '/wellbeing', '/mental-health/new'].includes(location.pathname);
  if (isAuth) return null;

  const items = [
    { to: '/dashboard', icon: 'home', label: t('nav_home'), id: 'nav-home' },
    { to: '/anc/new',   icon: 'plus', label: t('nav_new'),  id: 'nav-new-anc' },
    { to: '/mental-health/new', icon: 'heart', label: 'Wellbeing', id: 'nav-mental-health' },
    { to: '/records',   icon: 'clipboard', label: t('nav_records'), id: 'nav-records' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          id={item.id}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon"><AppIcon name={item.icon} size={21} /></span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
      <LangToggle />
    </nav>
  );
}

function LangToggle() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const toggle = () => {
    const next = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };
  return (
    <button id="lang-toggle" onClick={toggle} className="nav-item" aria-label="Toggle Language" title="Toggle Hindi/English">
      <span className="nav-icon"><AppIcon name="language" size={21} /></span>
      <span className="nav-label">Lang</span>
    </button>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

function WorkerSync() {
  const { pathname } = useLocation();
  // No ANC synchronization or misleading storage banners on the home check-in.
  return ['/dashboard', '/anc/new'].includes(pathname) ? <SyncStatusBanner /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <WorkerSync />
        <Routes>
          <Route path="/" element={<Navigate to="/wellbeing" replace />} />
          <Route path="/wellbeing" element={<MotherWellbeingPage />} />
          <Route path="/login" element={<OTPLoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/anc/new" element={<ProtectedRoute><ANCFormPage /></ProtectedRoute>} />
          <Route path="/mental-health/new" element={<Navigate to="/wellbeing" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
