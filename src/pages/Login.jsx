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
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', padding: 20 }}>
      <div style={{ background: 'white', padding: 30, borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, background: 'var(--primary)', color: 'white', fontSize: 32, fontWeight: 900, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>B</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>BillBuddy Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Please log in to continue</p>
        </div>

        {error && <div style={{ background: '#FEF2F2', color: 'var(--danger)', padding: 12, borderRadius: 8, fontSize: 13, textAlign: 'center', marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label className="field-label">Username</label>
            <input
              type="text"
              className="field-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-8" style={{ padding: '14px', fontSize: 15, justifyContent: 'center' }}>
            Login securely
          </button>
        </form>
      </div>
    </div>
  );
}