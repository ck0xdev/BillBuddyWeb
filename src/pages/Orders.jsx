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
        <div style={{ paddingBottom: 100 }}>
            <Header />
            
            <div className="container animate-slide-up">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h2 className="premium-title" style={{ fontSize: 26, color: 'var(--text)' }}>Active Market Orders</h2>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Processing pending item requests from the market</p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        style={{ borderRadius: 14, height: 48, padding: '0 24px', fontSize: 16, boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }}
                        onClick={() => { setEditingOrder(null); setShowModal(true); }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Take New Order</span>
                    </button>
                </div>

                <div className="field" style={{ margin: '0 0 32px' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            className="field-input" 
                            style={{ paddingLeft: 44, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', height: 52 }}
                            placeholder="Filter orders by member name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading ? (
                        <div className="loading-page"><div className="spinner"></div></div>
                    ) : activeOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 18 }}>No active orders currently pending.</p>
                            <button 
                                className="btn btn-secondary mt-16" 
                                onClick={() => { setEditingOrder(null); setShowModal(true); }}
                            >
                                Take New Market Order
                            </button>
                        </div>
                    ) : (
                        activeOrders.map(order => (
                            <div 
                                key={order.id} 
                                className="card animate-slide-up" 
                                onClick={() => handleEdit(order)}
                                style={{ marginBottom: 0, padding: 24, cursor: 'pointer', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 16 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 className="premium-title" style={{ fontSize: 18, color: 'var(--text)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.customer_name}</h3>
                                        <div className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            ORDER DATE: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="badge badge-danger" style={{ padding: '4px 10px', fontSize: 10, fontWeight: 800 }}>PENDING</div>
                                </div>

                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.02)', borderRadius: '14px' }}>
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: idx === order.items.length - 1 ? 0 : 10 }}>
                                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{item.name}</span>
                                            <span className="font-bold" style={{ color: 'var(--primary)' }}>x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                                    <button 
                                        className="btn btn-secondary" 
                                        style={{ flex: 1, height: 40, padding: 0, fontSize: 13, borderRadius: 10, background: 'rgba(52, 199, 89, 0.08)', color: 'var(--success)', border: 'none' }}
                                        onClick={(e) => handleDone(e, order.id)}
                                    >
                                        Mark as Completed
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

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