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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!total || !billNo) return alert('Bill Number and Total Amount are required');

    const t = parseFloat(total);
    const p = parseFloat(paid || 0);

    if (isNaN(t) || t <= 0) return alert('Total Amount must be a valid positive number');
    if (isNaN(p) || p < 0) return alert('Paid amount cannot be negative or invalid');
    if (t < p) return alert('Paid amount cannot exceed total amount');

    setLoading(true);
    try {
      if (bill) {
        const oldTotal = parseFloat(bill.total_amount) || 0;
        const oldPaid = parseFloat(bill.paid_amount) || 0;
        await api.updateBill(bill.id, {
          bill_no: billNo,
          date: date,
          paid_date: p > 0 ? paidDate : null,
          total_amount: t,
          paid_amount: p
        }, oldTotal, oldPaid, customer.id);
      } else {
        await api.createBill({
          customer_id: customer.id,
          customer_name: customer.name,
          bill_no: billNo,
          date: date,
          paid_date: p > 0 ? paidDate : null,
          total_amount: t,
          paid_amount: p
        });
      }
      onClose();
    } catch (err) {
      alert('Error saving bill: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this bill? This cannot be undone.')) {
      setLoading(true);
      try {
        await api.deleteBill(bill.id, bill, customer.id);
        onClose();
      } catch (err) {
        alert('Error deleting bill: ' + err.message);
      }
      setLoading(false);
    }
  };

  const balance = (parseFloat(total) || 0) - (parseFloat(paid) || 0);

  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{bill ? 'Edit Bill' : 'New Bill / Payment'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>For {customer.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!bill && pending > 0 && (
          <div className="balance-box" style={{ background: '#FEF2F2', borderColor: '#FCA5A5', marginBottom: 20 }}>
            <div className="balance-label" style={{ color: 'var(--danger)' }}>Previous Due</div>
            <div className="balance-value due">₹{pending.toLocaleString()}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-12">
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Bill Number</label>
              <input type="number" className="field-input" value={billNo} onChange={e => setBillNo(e.target.value)} placeholder="e.g 1045" required />
            </div>
          </div>

          <div className="flex gap-12">
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Bill Total (₹)</label>
              <input autoFocus={!bill} type="number" className="field-input" value={total} onChange={e => setTotal(e.target.value)} placeholder="0" required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Amount Paid (₹)</label>
              <input type="number" className="field-input" value={paid} onChange={e => setPaid(e.target.value)} placeholder="0" />
            </div>
          </div>

          {parseFloat(paid || 0) > 0 && (
            <div className="flex gap-12 mt-12">
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label" style={{ color: 'var(--success)' }}>Payment Date</label>
                <input type="date" className="field-input" value={paidDate} onChange={e => setPaidDate(e.target.value)} required />
              </div>
            </div>
          )}

          <div className="balance-box mt-8">
            <div className="balance-label">Current Bill Balance</div>
            <div className={`balance-value ${balance > 0 ? 'due' : 'clear'}`}>
              ₹{balance.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-12 mt-16">
            {bill && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Delete
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: 16 }} disabled={loading}>
              {loading ? 'Saving...' : (bill ? 'UPDATE BILL' : 'SAVE BILL')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}