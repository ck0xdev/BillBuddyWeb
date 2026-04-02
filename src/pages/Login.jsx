import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid sequence: Access Denied');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', 
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Decorative Elements */}
      <div style={{ 
        position: 'absolute', 
        width: '80%', 
        height: '80%', 
        background: 'radial-gradient(circle, rgba(0, 122, 255, 0.05), transparent 60%)', 
        top: '-10%', 
        left: '-10%', 
        filter: 'blur(80px)',
        pointerEvents: 'none' 
      }}></div>

      <div className="card glass animate-slide-up" style={{ 
        padding: '64px 40px', 
        width: '100%', 
        maxWidth: 440, 
        borderRadius: 32,
        boxShadow: '0 32px 80px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.02)',
        border: '1px solid rgba(255,255,255,0.8)',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.7)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ 
            width: 72, 
            height: 72, 
            background: 'var(--primary)', 
            color: 'white', 
            fontSize: 24, 
            fontWeight: 800, 
            borderRadius: 20, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            boxShadow: '0 12px 32px rgba(0, 122, 255, 0.25)',
            letterSpacing: '-0.02em'
          }}>VB</div>
          <h1 className="premium-title" style={{ fontSize: 36, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.03em' }}>Vyapar Book</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ height: 4, width: 4, borderRadius: '50%', background: 'var(--primary)' }}></span>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Market Access</p>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(255, 59, 48, 0.05)', 
            color: 'var(--danger)', 
            padding: '14px 20px', 
            borderRadius: 14, 
            fontSize: 13, 
            fontWeight: 800,
            textAlign: 'center', 
            marginBottom: 32,
            border: '1px solid rgba(255, 59, 48, 0.12)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field" style={{ marginBottom: 20 }}>
            <label className="field-label" style={{ fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>ADMINISTRATOR IDENTITY</label>
            <input
              type="text"
              className="field-input"
              style={{ borderRadius: 16, background: 'rgba(0,0,0,0.03)', border: '1px solid transparent', height: 56, fontSize: 16 }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              autoFocus
              required
            />
          </div>
          <div className="field" style={{ marginBottom: 40 }}>
            <label className="field-label" style={{ fontSize: 11, letterSpacing: '0.08em', marginBottom: 10 }}>SECURITY CREDENTIALS</label>
            <input
              type="password"
              className="field-input"
              style={{ borderRadius: 16, background: 'rgba(0,0,0,0.03)', border: '1px solid transparent', height: 56, fontSize: 16 }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ 
            width: '100%', 
            padding: '18px', 
            borderRadius: 18,
            fontSize: 17, 
            fontWeight: 800,
            boxShadow: '0 16px 32px rgba(0, 122, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}>
            <span>Authenticate</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </form>
        
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Powered by Vyapar Cloud Infrastructure
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-tertiary)', opacity: 0.5 }}>
            © 2026 Vyapar Book — Enterprise Edition
          </div>
        </div>
      </div>
    </div>
  );
}