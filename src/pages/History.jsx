import React, { useState } from 'react';
import { useCollectionSync } from '../lib/hooks';
import Header from '../components/Header';

export default function History() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: bills, loading } = useCollectionSync('bills', null);

    // Filter bills for the chosen date that have some payment recorded
    const dailyBills = bills
        .filter(b => b.date === selectedDate)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // newest first

    const totalCollected = dailyBills.reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0);
    const totalBilled = dailyBills.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

    return (
        <div>
            <Header />

            <div style={{ background: 'var(--primary)', padding: '20px 16px 30px', color: 'white' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, marginBottom: 8, fontWeight: 600 }}>Filter Timeline</div>
                <input
                    type="date"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none', fontSize: 16, fontFamily: 'inherit', outline: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                />
            </div>

            <div className="stats-bar" style={{ marginTop: -20, padding: '0 16px', marginBottom: 20 }}>
                <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                    <div className="stat-label">Transactions</div>
                    <div className="stat-value">{dailyBills.length}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, textAlign: 'center' }}>
                    <div className="stat-label">Collected</div>
                    <div className="stat-value success">₹{totalCollected.toLocaleString()}</div>
                </div>
            </div>

            <div className="customer-list">
                <div className="section-title">Timeline feed for {new Date(selectedDate).toLocaleDateString()}</div>

                {loading ? (
                    <div className="loading-page"><div className="spinner" style={{ borderColor: 'var(--primary)' }}></div></div>
                ) : dailyBills.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⏳</div>
                        <div className="empty-title">No transactions</div>
                        <div className="empty-desc">No bills or payments were recorded on this date.</div>
                    </div>
                ) : (
                    dailyBills.map(bill => (
                        <div key={bill.id} className="bill-card" style={{ padding: 16 }}>
                            <div style={{ width: 40, height: 40, background: '#ECFDF5', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginRight: 12 }}>
                                💰
                            </div>
                            <div className="bill-info">
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{bill.customer_name || 'Unknown Customer'}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Bill #{bill.bill_no}</div>
                            </div>
                            <div className="bill-amounts">
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)' }}>+ ₹{parseFloat(bill.paid_amount || 0).toLocaleString()}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>Total ₹{parseFloat(bill.total_amount).toLocaleString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
