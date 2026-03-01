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
    const customerBills = bills.filter(b => b.customer_id === id).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!customer) return <div><Header /><div className="loading-page">Customer not found or loading...</div></div>;

    const getPendingAmount = (cid) => {
        return bills.filter(b => b.customer_id === cid).reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount)), 0);
    };

    const totalPaid = customerBills.reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0);
    const pending = getPendingAmount(customer.id);

    return (
        <div>
            <Header />

            <div className="detail-header" style={{ marginTop: -1 }}>
                <button className="detail-back" onClick={() => navigate(-1)}>
                    ←
                </button>
                <div className="detail-name">{customer.name}</div>
                <div className="detail-sub">
                    <span>{customer.route_day} Route</span>
                    <span>•</span>
                    <span>{customer.mobile || 'No Mobile'}</span>
                </div>

                <div className="detail-stats">
                    <div className="detail-stat">
                        <div className="detail-stat-val" style={{ color: pending > 0 ? '#FCA5A5' : '#86EFAC' }}>₹{pending.toLocaleString()}</div>
                        <div className="detail-stat-lab">Total Due</div>
                    </div>
                    <div className="detail-stat">
                        <div className="detail-stat-val">₹{totalPaid.toLocaleString()}</div>
                        <div className="detail-stat-lab">Paid Overall</div>
                    </div>
                    <div className="detail-stat" style={{ background: 'rgba(59,130,246,0.3)', cursor: 'pointer' }} onClick={() => { setEditingBill(null); setShowPayModal(true); }}>
                        <div className="detail-stat-val" style={{ fontSize: 28, marginTop: -4, marginBottom: -6 }}>+</div>
                        <div className="detail-stat-lab" style={{ color: 'white' }}>New Bill</div>
                    </div>
                </div>
            </div>

            <div className="detail-content">
                <div className="section-title">
                    <span>Bill History ({customerBills.length})</span>
                </div>

                {loading ? (
                    <div className="loading-page" style={{ minHeight: 100 }}><div className="spinner"></div></div>
                ) : customerBills.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                        <div className="empty-icon">🧾</div>
                        <div className="empty-title">No bills yet</div>
                        <div className="empty-desc">Create the first bill for {customer.name}.</div>
                    </div>
                ) : (
                    customerBills.map(bill => {
                        const billBalance = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);

                        return (
                            <div key={bill.id} className="bill-card" style={{ cursor: 'pointer' }} onClick={() => { setEditingBill(bill); setShowPayModal(true); }}>
                                <div className="bill-info">
                                    <div className="bill-no">Bill #{bill.bill_no}</div>
                                    <div className="bill-date">{new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                                <div className="bill-amounts">
                                    <div className="bill-total">₹{parseFloat(bill.total_amount).toLocaleString()}</div>
                                    <div className={`bill-balance ${billBalance > 0 ? 'due' : 'paid'}`}>
                                        {billBalance > 0 ? `Due: ₹${billBalance.toLocaleString()}` : 'Fully Paid'}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
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
