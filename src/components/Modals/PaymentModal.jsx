import React, { useState, useEffect } from 'react';
import { getLocalDateString } from '../../lib/dateUtils';

export default function PaymentModal({ isOpen, onClose, customer, pending, bill, api }) {
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [billNo, setBillNo] = useState('');
  const [date, setDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setTotal(bill.total_amount?.toString() || '');
        setPaid(bill.paid_amount?.toString() || '');
        setBillNo(bill.bill_no?.toString() || '');
        setDate(bill.date || getLocalDateString());
        setPaidDate(bill.paid_date || bill.date || getLocalDateString());
      } else {
        setTotal('');
        setPaid('');
        setBillNo('');
        setDate(getLocalDateString());
        setPaidDate(getLocalDateString());
      }
    }
  }, [isOpen, bill]);

  // Preset Amount Logic
  const handleQuickAmount = (amount) => {
    if (amount === 'full') setPaid(total || pending.toString());
    else setPaid(amount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bill) {
        await api.updateBill(bill.id, {
          bill_no: billNo,
          date,
          paid_date: parseFloat(paid) > 0 ? paidDate : null,
          total_amount: parseFloat(total),
          paid_amount: parseFloat(paid || 0)
        }, bill.total_amount, bill.paid_amount, customer.id);
      } else {
        await api.createBill({
          customer_id: customer.id,
          customer_name: customer.name,
          bill_no: billNo,
          date,
          paid_date: parseFloat(paid) > 0 ? paidDate : null,
          total_amount: parseFloat(total),
          paid_amount: parseFloat(paid || 0)
        });
      }
      onClose();
    } catch (err) { alert(err.message); }
    setLoading(false);
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
            justifyContent: 'center',
            padding: 0
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
            {bill ? 'Refine Transaction' : 'New Bill Entry'}
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

        {!bill && pending > 0 && (
          <div className="card" style={{ padding: 16, marginBottom: 24, border: 'none', background: 'rgba(0, 122, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--primary)', letterSpacing: '0.04em' }}>MARKET OUTSTANDING</span>
            <span className="premium-title" style={{ fontSize: 18, color: 'var(--primary)' }}>₹{pending.toLocaleString()}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">BILL NO</label>
              <input 
                type="text" 
                className="field-input" 
                style={{ borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}
                value={billNo} 
                onChange={e => setBillNo(e.target.value)} 
                placeholder="Ex: 101"
                required 
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">DATE</label>
              <input 
                type="date" 
                className="field-input" 
                style={{ borderRadius: 14, background: 'rgba(0,0,0,0.02)' }}
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">TOTAL BILL AMOUNT (₹)</label>
            <input 
                type="number" 
                className="field-input" 
                style={{ fontSize: 20, fontWeight: 800, borderRadius: 16, padding: '16px 20px' }} 
                value={total} 
                onChange={e => setTotal(e.target.value)} 
                placeholder="Amount to bill" 
                required 
            />
          </div>

          <div className="field">
            <label className="field-label">AMOUNT COLLECTED (₹)</label>
            <input 
                type="number" 
                className="field-input" 
                style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', borderRadius: 16, padding: '16px 20px' }} 
                value={paid} 
                onChange={e => setPaid(e.target.value)} 
                placeholder="Amount received" 
            />
            
            {/* Premium Presets */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {[100, 500, 1000, 2000, 'full'].map(amt => (
                <button 
                    key={amt} 
                    type="button" 
                    onClick={() => handleQuickAmount(amt)} 
                    style={{ 
                        flexShrink: 0,
                        padding: '8px 16px', 
                        borderRadius: 12, 
                        background: 'rgba(0,0,0,0.04)', 
                        border: 'none', 
                        fontSize: 12, 
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                  {amt === 'full' ? 'FULL BALANCE' : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
                width: '100%', 
                padding: '18px', 
                borderRadius: 18, 
                fontSize: 16,
                marginTop: 16,
                boxShadow: '0 12px 24px rgba(0, 122, 255, 0.25)'
            }} 
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }}></div> : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{bill ? 'UPDATE LEDGER' : 'SAVE TRANSACTION'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}