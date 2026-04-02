import React, { useState, useEffect } from 'react';

export default function AddCustomerModal({ isOpen, onClose, customer, defaultDay, api }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [srNo, setSrNo] = useState('');
  const [selectedDay, setSelectedDay] = useState(defaultDay || 'Mon');
  const [loading, setLoading] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Mobile', 'Natubhai'];

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setName(customer.name);
        setMobile(customer.mobile || '');
        setSrNo(customer.sr_no?.toString() || '');
        setSelectedDay(customer.route_day);
      } else {
        setName('');
        setMobile('');
        setSrNo('');
        setSelectedDay(defaultDay || 'Mon');
      }
    }
  }, [isOpen, customer, defaultDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        route_day: selectedDay,
        sr_no: srNo ? parseInt(srNo) : 1
      };

      if (customer) {
        await api.updateCustomer(customer.id, payload);
      } else {
        await api.createCustomer(payload);
      }
      onClose();
    } catch (err) {
      alert('Error saving customer: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this member and all their records?')) {
      setLoading(true);
      await api.deleteCustomer(customer.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
        }} 
        onClick={onClose}
    >
      <div 
        className="animate-slide-up"
        style={{ 
            background: 'var(--surface)', 
            width: '100%', 
            maxWidth: 500, 
            borderRadius: '32px 32px 0 0', 
            padding: '24px 24px 40px',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.15)',
            maxHeight: '92vh',
            overflowY: 'auto'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div style={{ width: 36, height: 5, background: 'var(--border)', borderRadius: 10, margin: '0 auto 24px' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="premium-title" style={{ fontSize: 22, color: 'var(--text)' }}>
            {customer ? 'Update Member' : 'New Ledger Entry'}
          </h2>
          <button 
                onClick={onClose} 
                className="btn-icon" 
                style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.03)', border: 'none' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">ROUTE / CATEGORY</label>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {days.map(d => {
                  const isActive = selectedDay === d;
                  return (
                    <button
                        type="button"
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '14px',
                            background: isActive ? 'var(--primary)' : 'rgba(0,0,0,0.04)',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 4px 12px rgba(0, 122, 255, 0.25)' : 'none'
                        }}
                    >
                        {d}
                    </button>
                  );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 16, marginBottom: 20 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">SHOP / MEMBER NAME</label>
              <input
                autoFocus
                type="text"
                className="field-input"
                style={{ borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}
                placeholder="e.g. Laxmi Store"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">SR NO.</label>
              <input
                type="number"
                className="field-input"
                style={{ borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}
                placeholder="1"
                value={srNo}
                onChange={e => setSrNo(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">CONTACT NUMBER (WHATSAPP)</label>
            <input
              type="tel"
              className="field-input"
              style={{ borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}
              placeholder="9876543210"
              maxLength={10}
              value={mobile}
              onChange={e => setMobile(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {customer && (
              <button 
                  type="button" 
                  className="btn" 
                  onClick={handleDelete} 
                  disabled={loading}
                  style={{ background: 'rgba(255, 59, 48, 0.08)', color: 'var(--danger)', borderRadius: 16, padding: '0 16px' }}
              >
                Delete
              </button>
            )}
            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '16px', borderRadius: 18, fontSize: 16, boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }} 
                disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }}></div> : (customer ? 'Update Member' : 'Enrol Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}