import React, { useState } from 'react';
import { useCollectionSync } from '../lib/hooks';
import { createOrder, updateOrder, deleteOrder, markOrderDone } from '../lib/api';
import Header from '../components/Header';
import AddOrderModal from '../components/Modals/AddOrderModal';

export default function Orders() {
    const { data: orders, loading } = useCollectionSync('orders', null);
    const { data: customers } = useCollectionSync('customers', null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const activeOrders = orders.filter(o => 
        !o.is_deleted && 
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const handleEdit = (order) => {
        setEditingOrder(order);
        setShowModal(true);
    };

    const handleDone = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Mark this order as completed?")) {
            try {
                await markOrderDone(id);
            } catch (err) {
                alert("Update failed: " + err.message);
            }
        }
    };

    return (
        <div>
            <Header />
            
            <div className="detail-header" style={{ background: 'var(--accent)' }}>
                <div className="detail-name">Market Orders</div>
                <div className="detail-sub">Take and manage active orders</div>
            </div>

            <div className="search-wrap">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search by customer name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="detail-content">
                {loading ? (
                    <div className="loading-page"><div className="spinner"></div></div>
                ) : activeOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <div className="empty-title">No active orders</div>
                        <button className="btn btn-primary mt-16" onClick={() => { setEditingOrder(null); setShowModal(true); }}>
                            Create First Order
                        </button>
                    </div>
                ) : (
                    activeOrders.map(order => (
                        <div key={order.id} className="bill-card" style={{ display: 'block' }} onClick={() => handleEdit(order)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="bill-info">
                                    <div className="bill-no" style={{ color: 'var(--text)', fontSize: '16px' }}>{order.customer_name}</div>
                                    <div className="bill-date">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                </div>
                                <div className="flex gap-8">
                                    {order.status === 'pending' && (
                                        <button className="btn btn-sm btn-success" onClick={(e) => handleDone(e, order.id)}>
                                            Done
                                        </button>
                                    )}
                                    <div className={`customer-badge ${order.status === 'pending' ? 'badge-danger' : 'badge-success'}`}>
                                        {order.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>• {item.name}</span>
                                        <span style={{ fontWeight: '600' }}>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="fab" style={{ background: 'var(--accent)' }} onClick={() => { setEditingOrder(null); setShowModal(true); }}>+</button>

            {showModal && (
                <AddOrderModal 
                    isOpen={showModal} 
                    onClose={() => { setShowModal(false); setEditingOrder(null); }}
                    customers={customers}
                    editOrder={editingOrder}
                    api={{ createOrder, updateOrder, deleteOrder }}
                />
            )}
        </div>
    );
}