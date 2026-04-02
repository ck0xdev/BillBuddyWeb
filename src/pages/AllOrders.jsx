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

    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;

    return (
        <div>
            <Header />
            <div className="detail-header" style={{ background: 'var(--primary-dark)' }}>
                <div className="detail-name">Order Directory</div>
                <div className="detail-sub">Viewing all recorded market orders</div>
            </div>

            <div className="search-wrap">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search by customer or route day..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-label">Total Orders</div>
                    <div className="stat-value primary">{filteredOrders.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Pending</div>
                    <div className="stat-value danger">{pendingOrders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Completed</div>
                    <div className="stat-value success">{filteredOrders.length - pendingOrders}</div>
                </div>
            </div>

            <div className="customer-list">
                {loading ? (
                    <div className="loading-page"><div className="spinner"></div></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <div className="empty-title">No orders found</div>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="customer-card" style={{ display: 'block', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div className="customer-info">
                                    <div className="customer-name">{order.customer_name}</div>
                                    <div className="customer-meta">
                                        <span>{order.route_day} Route</span>
                                        <span>•</span>
                                        <span>{new Date(order.date).toLocaleDateString('en-IN')}</span>
                                    </div>
                                </div>
                                <div className={`customer-badge ${order.status === 'pending' ? 'badge-danger' : 'badge-success'}`}>
                                    {order.status.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                {order.items?.map((item, i) => (
                                    <span key={i}>{item.name} ({item.quantity}){i < order.items.length - 1 ? ', ' : ''}</span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}