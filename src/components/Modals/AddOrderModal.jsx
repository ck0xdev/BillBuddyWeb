import React, { useState, useEffect } from 'react';
import { useCollectionSync } from '../../lib/hooks';

export default function AddOrderModal({ isOpen, onClose, customers, editOrder, api }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([{ name: '', quantity: '' }]);
  const [loading, setLoading] = useState(false);

  const { data: products } = useCollectionSync('products', null);
  const orderDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (editOrder && isOpen) {
      setSelectedCustomer({ 
        id: editOrder.customer_id, 
        name: editOrder.customer_name, 
        route_day: editOrder.route_day 
      });
      setItems(editOrder.items || [{ name: '', quantity: '' }]);
    } else if (isOpen) {
      setSelectedCustomer(null);
      setItems([{ name: '', quantity: '' }]);
      setSearchTerm('');
    }
  }, [editOrder, isOpen]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mobile && c.mobile.includes(searchTerm))
  ).slice(0, 5);

  const handleAddItem = () => setItems([...items, { name: '', quantity: '' }]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return alert('Please select a member');
    if (items.some(i => !i.name || !i.quantity)) return alert('Please fill all item details');

    setLoading(true);
    try {
      const payload = {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        route_day: selectedCustomer.route_day,
        date: orderDate,
        items: items
      };

      if (editOrder) {
        await api.updateOrder(editOrder.id, payload);
      } else {
        await api.createOrder({ ...payload, status: 'pending' });
      }
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this order?")) {
      setLoading(true);
      await api.deleteOrder(editOrder.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(8px)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'flex-end', 
            justifyContent: 'center' 
        }} 
        onClick={onClose}
    >
      <div 
        className="animate-slide-up"
        style={{ 
            background: 'var(--surface)', 
            width: '100%', 
            maxWidth: 500, 
            borderRadius: '32px 32px 0 0', 
            padding: '24px 24px 40px',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.15)',
            maxHeight: '92vh',
            overflowY: 'auto'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* iOS Drag Handle */}
        <div style={{ width: 36, height: 5, background: 'var(--border)', borderRadius: 10, margin: '0 auto 24px' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="premium-title" style={{ fontSize: 22, color: 'var(--text)' }}>
            {editOrder ? 'Update Order' : 'New Market Order'}
          </h2>
          <button 
                onClick={onClose} 
                className="btn-icon" 
                style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.03)', border: 'none' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">SELECT MEMBER</label>
            {!selectedCustomer ? (
              <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    className="field-input"
                    style={{ paddingLeft: 44, borderRadius: 16, background: 'rgba(0,0,0,0.02)' }}
                    placeholder="Search name or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            ) : (
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0, 122, 255, 0.04)', border: '1px solid rgba(0, 122, 255, 0.1)' }}>
                <div>
                  <h4 className="premium-title" style={{ fontSize: 16, color: 'var(--text)' }}>{selectedCustomer.name}</h4>
                  <span className="text-xs font-bold" style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{selectedCustomer.route_day} Route</span>
                </div>
                {!editOrder && (
                    <button type="button" className="btn btn-secondary" style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8 }} onClick={() => setSelectedCustomer(null)}>
                        Change
                    </button>
                )}
              </div>
            )}
            
            {searchTerm && !selectedCustomer && (
              <div className="card" style={{ padding: 0, marginTop: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {filteredCustomers.map(c => (
                  <div 
                    key={c.id} 
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                    onClick={() => { setSelectedCustomer(c); setSearchTerm(''); }}
                  >
                    <div className="premium-title" style={{ fontSize: 14 }}>{c.name}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{c.route_day} Route • {c.mobile || 'No Mobile'}</div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No results found</div>}
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="premium-title" style={{ fontSize: 16, color: 'var(--text)' }}>Selected Items</h3>
            <button type="button" className="btn btn-secondary" style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8 }} onClick={handleAddItem}>
                + Add Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, index) => (
                <div key={index} className="card" style={{ padding: 12, background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <label className="field-label" style={{ fontSize: 9 }}>PRODUCT</label>
                            <select 
                                className="field-input" 
                                style={{ height: 44, padding: '0 12px', fontSize: 14, borderRadius: 10, background: 'var(--surface)' }}
                                value={item.name} 
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)} 
                                required
                            >
                                <option value="">Select Item</option>
                                {products?.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={{ width: 80 }}>
                            <label className="field-label" style={{ fontSize: 9 }}>QTY</label>
                            <input 
                                type="number" 
                                className="field-input" 
                                style={{ height: 44, textAlign: 'center', fontSize: 14, borderRadius: 10, background: 'var(--surface)' }}
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                required 
                            />
                        </div>
                        {items.length > 1 && (
                            <button 
                                type="button" 
                                className="btn-icon" 
                                style={{ marginTop: 20, width: 36, height: 36, background: 'rgba(255, 59, 48, 0.05)', color: 'var(--danger)', border: 'none' }}
                                onClick={() => handleRemoveItem(index)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            {editOrder && (
              <button 
                  type="button" 
                  className="btn" 
                  onClick={handleDelete} 
                  disabled={loading}
                  style={{ background: 'rgba(255, 59, 48, 0.08)', color: 'var(--danger)', borderRadius: 16, padding: '0 16px' }}
              >
                Delete
              </button>
            )}
            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '16px', borderRadius: 18, fontSize: 16, boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }} 
                disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }}></div> : (editOrder ? 'Update Order' : 'Place Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}