import React from 'react';

export default function CustomerCard({ customer, pending, onDetails }) {
  return (
    <div className="card container animate-slide-up" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div onClick={onDetails} style={{ cursor: 'pointer', flex: 1 }}>
          <h3 className="premium-title" style={{ fontSize: 17, color: 'var(--text)', marginBottom: 2 }}>{customer.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{customer.mobile || 'No Mobile'}</span>
            {customer.area && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-tertiary)' }}></span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{customer.area}</span>
              </>
            )}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 2, letterSpacing: '0.02em' }}>Balance</div>
          <div className="font-bold" style={{ 
            fontSize: 20, 
            color: pending > 0 ? 'var(--danger)' : 'var(--success)',
            fontFamily: 'Outfit'
          }}>
            ₹{pending.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12, display: 'flex', gap: 8 }}>
        <button 
          onClick={onDetails}
          className="btn btn-primary" 
          style={{ flex: 1, height: 40, padding: 0 }}
        >
          View Ledger
        </button>
        <button 
          className="btn-icon" 
          onClick={() => { /* Logic is in parent */ }}
          style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.03)', border: 'none' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}