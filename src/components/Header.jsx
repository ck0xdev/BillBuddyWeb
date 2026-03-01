import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/menu', label: 'All Customers' },
    { path: '/history', label: 'History' }
  ];

  return (
    <header className="header" style={{ flexDirection: 'column', height: 'auto', padding: '16px 20px 0' }}>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="header-brand">
          <div className="header-logo" style={{ background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 18 }}>B</span>
          </div>
          <div>
            <div className="header-title">BillBuddy</div>
            <div className="header-subtitle">Workspace</div>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: 'transparent',
              border: 'none',
              color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.6)',
              fontWeight: location.pathname === item.path ? 800 : 600,
              fontSize: 14,
              paddingBottom: 12,
              borderBottom: `3px solid ${location.pathname === item.path ? 'white' : 'transparent'}`,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}