import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollectionSync } from '../lib/hooks';
import { createBill, updateBill, deleteBill } from '../lib/api';
import Header from '../components/Header';
import PaymentModal from '../components/Modals/PaymentModal';

export default function CustomerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: customers } = useCollectionSync('customers', null);
    const { data: bills, loading } = useCollectionSync('bills', null);

    const [showPayModal, setShowPayModal] = useState(false);
    const [editingBill, setEditingBill] = useState(null);

    const customer = customers.find(c => c.id === id);
    const customerBills = bills
        .filter(b => b.customer_id === id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!customer) return (
        <div>
            <Header />
            <div className="container animate-slide-up" style={{ textAlign: 'center', paddingTop: 100 }}>
                <h3 className="premium-title" style={{ fontSize: 24, color: 'var(--text-tertiary)' }}>Member Profile Not Found</h3>
                <button className="btn btn-secondary mt-24" onClick={() => navigate('/')}>Return to Dashboard</button>
            </div>
        </div>
    );

    const getPendingAmount = (cid) => {
        return bills
            .filter(b => b.customer_id === cid)
            .reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount || 0)), 0);
    };

    const totalPaid = customerBills.reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0);
    const pending = getPendingAmount(customer.id);

    return (
        <div style={{ paddingBottom: 100 }}>
            <Header />

            <div className="container animate-slide-up">
                {/* Desktop-optimized Grid Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'start' }}>
                    
                    {/* Header Row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => navigate(-1)}
                                style={{ width: 44, height: 44, padding: 0, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                            </button>
                            <div>
                                <h2 className="premium-title" style={{ fontSize: 28, color: 'var(--text)' }}>{customer.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ height: 6, width: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {customer.route_day} Route Member
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ height: 48, padding: '0 24px', borderRadius: 14, fontSize: 15, fontWeight: 700 }}
                                onClick={() => { setEditingBill(null); setShowPayModal(true); }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                New Bill Entry
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 16 }}>
                        {/* Member Details Card */}
                        <div className="card" style={{ padding: 24, border: 'none', background: 'var(--surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
                            <h4 className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member Information</h4>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>CONTACT NUMBER</label>
                                <div style={{ fontSize: 17, color: 'var(--text)', fontWeight: 700 }}>{customer.mobile || 'No mobile linked'}</div>
                            </div>
                            
                            {customer.area && (
                                <div style={{ marginBottom: 20 }}>
                                    <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>LOCATIONS / AREA</label>
                                    <div style={{ fontSize: 17, color: 'var(--text)', fontWeight: 700 }}>{customer.area}</div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>MEMBER SR NO.</label>
                                <div style={{ fontSize: 17, color: 'var(--text)', fontWeight: 700 }}>#{customer.sr_no || '1'}</div>
                            </div>
                        </div>

                        {/* Financial Stats Card */}
                        <div className="card" style={{ padding: 24, border: 'none', background: 'var(--primary)', boxShadow: '0 12px 32px rgba(0, 122, 255, 0.25)', color: 'white' }}>
                            <h4 className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ledger Summary</h4>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div>
                                    <label className="text-xs font-extrabold" style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 2 }}>TOTAL MARKET DUE</label>
                                    <div className="premium-title" style={{ fontSize: 28, color: 'white' }}>₹{pending.toLocaleString()}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800 }}>
                                    {pending > 0 ? 'STATUS: DUE' : 'STATUS: CLEAR'}
                                </div>
                            </div>

                            <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.1)', borderRadius: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>LIFETIME COLLECTION</label>
                                <span className="premium-title" style={{ fontSize: 16, color: 'white' }}>₹{totalPaid.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bill History List */}
                    <div>
                        <div style={{ padding: '0 8px 16px' }}>
                            <h3 className="premium-title" style={{ fontSize: 20, color: 'var(--text)' }}>Recorded Transaction History</h3>
                        </div>

                        <div className="results-grid">
                            {loading ? (
                                <div className="loading-page" style={{ gridColumn: '1 / -1', minHeight: 200 }}><div className="spinner"></div></div>
                            ) : customerBills.length === 0 ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: 16 }}>This member has no recorded transactions yet.</p>
                                </div>
                            ) : (
                                customerBills.map(bill => {
                                    const billBalance = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount || 0);
                                    const isPaid = billBalance <= 0;

                                    return (
                                        <div 
                                            key={bill.id} 
                                            className="card" 
                                            onClick={() => { setEditingBill(bill); setShowPayModal(true); }}
                                            style={{ marginBottom: 0, padding: 24, cursor: 'pointer', border: isPaid ? '1px solid var(--border-light)' : '1px solid rgba(255, 59, 48, 0.15)' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                                <div>
                                                    <div className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                                                        {new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <h4 className="premium-title" style={{ fontSize: 18, color: 'var(--text)' }}>Bill No: #{bill.bill_no || '—'}</h4>
                                                </div>
                                                <div className={`badge ${isPaid ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 12px', fontSize: 10, fontWeight: 800 }}>
                                                    {isPaid ? 'PAID' : 'DUE'}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                <div>
                                                    <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>TOTAL AMOUNT</label>
                                                    <div className="premium-title" style={{ fontSize: 18, color: 'var(--text)' }}>₹{parseFloat(bill.total_amount).toLocaleString()}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    {!isPaid && (
                                                        <>
                                                            <label className="text-xs font-extrabold" style={{ color: 'var(--danger)', display: 'block', marginBottom: 2 }}>REMAINING DUE</label>
                                                            <div className="premium-title" style={{ fontSize: 18, color: 'var(--danger)' }}>₹{billBalance.toLocaleString()}</div>
                                                        </>
                                                    )}
                                                    {isPaid && (
                                                        <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                            FULLY SETTLED
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showPayModal && (
                <PaymentModal
                    isOpen={showPayModal}
                    onClose={() => { setShowPayModal(false); setEditingBill(null); }}
                    customer={customer}
                    pending={pending}
                    bill={editingBill}
                    api={{ createBill, updateBill, deleteBill }}
                />
            )}
        </div>
    );
}
