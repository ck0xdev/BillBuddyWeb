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

  const mainNav = [
    { path: '/', label: 'Dashboard' },
    { path: '/orders', label: 'Orders' },
    { path: '/history', label: 'History' },
    { path: '/menu', label: 'Menu' }
  ];

  const menuSubItems = [
    { path: '/menu', label: 'All Customers' },
    { path: '/all-orders', label: 'All Orders' },
    { path: '/products', label: 'Manage Products' }
  ];

  const isMenuSection = ['/menu', '/products', '/all-orders'].includes(location.pathname);

  return (
    <header className="header" style={{ flexDirection: 'column', height: 'auto', padding: '16px 20px 0' }}>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="header-brand">
          <div className="header-logo" style={{ background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 18 }}>B</span>
          </div>
          <div className="header-title">BillBuddy</div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
      </div>

      <div style={{ display: 'flex', gap: 20, overflowX: 'auto', width: '100%' }}>
        {mainNav.map(item => {
          const isActive = location.pathname === item.path || (item.path === '/menu' && isMenuSection);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 800 : 600,
                fontSize: 14,
                paddingBottom: 12,
                borderBottom: `3px solid ${isActive ? 'white' : 'transparent'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {isMenuSection && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 0', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
          {menuSubItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: location.pathname === item.path ? 'var(--primary)' : 'white',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}