import React, { useState, useMemo } from 'react';
import { useCollectionSync } from '../lib/hooks';
import Header from '../components/Header';

export default function History() {
  const { data: bills, loading } = useCollectionSync('bills', null);
  
  // Logic for Grouping Bills by Date
  const groupedBills = useMemo(() => {
    const groups = {};
    bills.filter(b => !b.is_deleted).forEach(bill => {
      const dateKey = bill.paid_date || bill.date;
      if (!groups[dateKey]) groups[dateKey] = { total: 0, items: [] };
      groups[dateKey].items.push(bill);
      groups[dateKey].total += parseFloat(bill.paid_amount || 0);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [bills]);

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header />
      <div className="container animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '0 4px' }}>
          <div>
            <h2 className="premium-title" style={{ fontSize: 26, color: 'var(--text)' }}>Collection Timeline</h2>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>A historical record of all market settlements</p>
          </div>
          <div className="badge badge-info" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 800 }}>
            HISTORY ARCHIVE
          </div>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : groupedBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
             <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 18 }}>No collection history found.</p>
          </div>
        ) : (
          groupedBills.map(([date, data]) => (
            <div key={date} style={{ marginBottom: 48 }}>
              <div style={{ 
                position: 'sticky', 
                top: 156, 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '16px 24px', 
                margin: '0 -24px',
                zIndex: 10, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-light)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                borderRadius: '0 0 16px 16px'
              }}>
                <div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>COLLECTION DATE</span>
                  <span className="premium-title" style={{ fontSize: 18, color: 'var(--text)' }}>
                    {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>TOTAL COLLECTED</span>
                  <span className="premium-title" style={{ fontSize: 20, color: 'var(--success)' }}>
                    ₹{data.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                {data.items.map(bill => (
                  <div key={bill.id} className="card" style={{ padding: 20, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 className="premium-title" style={{ fontSize: 17, color: 'var(--text)', marginBottom: 2 }}>{bill.customer_name}</h4>
                        <div className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>BILL INVOICE: #{bill.bill_no}</div>
                      </div>
                      <div className="badge badge-success" style={{ fontSize: 9, padding: '4px 10px' }}>SETTLED</div>
                    </div>
                    
                    <div style={{ padding: '12px 16px', background: 'rgba(52, 199, 89, 0.05)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>PAYMENT RECEIVED</span>
                      <span className="premium-title" style={{ fontSize: 16, color: 'var(--success)' }}>+ ₹{parseFloat(bill.paid_amount).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Bill Value</span>
                      <span style={{ color: 'var(--text)', fontWeight: 700 }}>₹{parseFloat(bill.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}