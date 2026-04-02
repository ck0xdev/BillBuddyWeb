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
    { path: '/menu', label: 'Directory' }
  ];

  const menuSubItems = [
    { path: '/menu', label: 'Members' },
    { path: '/all-orders', label: 'All Bills' },
    { path: '/products', label: 'Products' }
  ];

  const isMenuSection = ['/menu', '/products', '/all-orders'].includes(location.pathname);

  return (
    <header className="header-wrapper glass" style={{ marginBottom: 32 }}>
      <div className="container header" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ 
              background: 'var(--primary)', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, 
              height: 40,
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)'
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>VB</span>
            </div>
            <div>
              <h1 className="premium-title" style={{ fontSize: 20, color: 'var(--text)', marginBottom: -2 }}>Vyapar Book</h1>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Professional Ledger</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            title="Logout"
            style={{ borderRadius: '14px', height: 40, padding: '0 16px', fontSize: 14, fontWeight: 700 }}
          >
            Log Out
          </button>
        </div>

        <nav className="no-scrollbar" style={{ display: 'flex', gap: 24, overflowX: 'auto', width: '100%', paddingTop: 4 }}>
          {mainNav.map(item => {
            const isActive = location.pathname === item.path || (item.path === '/menu' && isMenuSection);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 14,
                  paddingBottom: 10,
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {isMenuSection && (
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', width: '100%', padding: '0 0 4px', marginTop: -8 }}>
            {menuSubItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: location.pathname === item.path ? 'var(--primary)' : 'rgba(0,0,0,0.04)',
                  border: 'none',
                  color: location.pathname === item.path ? 'white' : 'var(--text-secondary)',
                  padding: '6px 16px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}