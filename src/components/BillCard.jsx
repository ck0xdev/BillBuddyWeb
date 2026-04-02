import React from 'react';

export default function BillCard({ bill, customerName, onEdit, onDelete }) {
  const isPaid = parseFloat(bill.paid_amount) >= parseFloat(bill.total_amount);
  const isPartial = !isPaid && parseFloat(bill.paid_amount) > 0;
  
  return (
    <div className="card container animate-slide-up" style={{ marginBottom: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <h4 className="premium-title" style={{ fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{customerName || 'Customer'}</h4>
          <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{bill.date}</span>
        </div>
        <div className={`badge ${isPaid ? 'badge-success' : isPartial ? 'badge-warning' : 'badge-danger'}`}>
          {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Due'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border-light)' }}>
        <div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Total</div>
          <div className="font-bold text-md" style={{ color: 'var(--text)', fontFamily: 'Outfit' }}>₹{parseFloat(bill.total_amount).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Paid</div>
          <div className="font-bold text-md" style={{ color: 'var(--success)', fontFamily: 'Outfit' }}>₹{parseFloat(bill.paid_amount || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Due</div>
          <div className="font-bold text-md" style={{ color: 'var(--danger)', fontFamily: 'Outfit' }}>₹{(parseFloat(bill.total_amount) - parseFloat(bill.paid_amount || 0)).toLocaleString()}</div>
        </div>
      </div>

      {bill.items && bill.items.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.02)', padding: '6px 10px', borderRadius: 8, marginTop: 4 }}>
          {bill.items.map(item => `${item.name} (${item.qty})`).join(', ')}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button onClick={() => onEdit(bill)} className="btn-ghost text-sm font-bold" style={{ padding: '6px 12px' }}>Edit</button>
        <button onClick={() => onDelete(bill.id)} className="btn-ghost text-sm font-bold" style={{ color: 'var(--danger)', padding: '6px 12px' }}>Delete</button>
      </div>
    </div>
  );
}