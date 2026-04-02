import React, { useState } from 'react';
import { useCollectionSync } from '../lib/hooks';
import Header from '../components/Header';

export default function AllOrders() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: orders, loading } = useCollectionSync('orders', null);

    const filteredOrders = orders.filter(o => 
        !o.is_deleted && 
        (o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (o.route_day && o.route_day.toLowerCase().includes(searchTerm.toLowerCase())))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const pendingOrdersCount = filteredOrders.filter(o => o.status === 'pending').length;

    return (
        <div style={{ paddingBottom: 100 }}>
            <Header />
            
            <div className="container animate-slide-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '0 4px' }}>
                    <h2 className="premium-title" style={{ fontSize: 22, color: 'var(--text)' }}>Order Directory</h2>
                    <div className="badge badge-info" style={{ padding: '6px 12px' }}>History</div>
                </div>

                <div className="field" style={{ margin: '0 0 24px' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            className="field-input" 
                            style={{ paddingLeft: 44, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }}
                            placeholder="Search by member or route day..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <div className="card" style={{ padding: 20, border: 'none', background: 'rgba(0, 122, 255, 0.05)', textAlign: 'center' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL RECORDS</div>
                        <div className="premium-title" style={{ fontSize: 22, color: 'var(--primary)' }}>{filteredOrders.length}</div>
                    </div>
                    <div className="card" style={{ padding: 20, border: 'none', background: 'rgba(255, 59, 48, 0.05)', textAlign: 'center' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--danger)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTIVE PENDING</div>
                        <div className="premium-title" style={{ fontSize: 22, color: 'var(--danger)' }}>{pendingOrdersCount}</div>
                    </div>
                    <div className="card" style={{ padding: 20, border: 'none', background: 'rgba(52, 199, 89, 0.05)', textAlign: 'center' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--success)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>COMPLETED</div>
                        <div className="premium-title" style={{ fontSize: 22, color: 'var(--success)' }}>{filteredOrders.length - pendingOrdersCount}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loading ? (
                        <div className="loading-page"><div className="spinner"></div></div>
                    ) : filteredOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 18 }}>No orders found in the directory.</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <div 
                                key={order.id} 
                                className="card" 
                                style={{ marginBottom: 12, padding: 16, border: '1px solid var(--border-light)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <h3 className="premium-title" style={{ fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{order.customer_name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>{order.route_day} Route</span>
                                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-tertiary)' }}></span>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>
                                                {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`badge ${order.status === 'pending' ? 'badge-danger' : 'badge-success'}`} style={{ padding: '3px 8px', fontSize: 9 }}>
                                        {order.status}
                                    </div>
                                </div>
                                <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    {order.items?.map((item, i) => (
                                        <span key={i}>
                                            <span style={{ color: 'var(--text)' }}>{item.name}</span>
                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}> (x{item.quantity})</span>
                                            {i < order.items.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}