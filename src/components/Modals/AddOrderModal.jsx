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
    if (!selectedCustomer) return alert('Please select a customer');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editOrder ? 'Edit Order' : 'New Order'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Customer</label>
            {!selectedCustomer ? (
              <input
                type="text"
                className="field-input"
                placeholder="Search name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="balance-box" style={{ background: 'var(--bg)', marginBottom: 0 }}>
                <div className="balance-label">
                  <strong>{selectedCustomer.name}</strong> 
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>{selectedCustomer.route_day} Route</small>
                </div>
                {!editOrder && <button type="button" className="btn btn-sm btn-outline" onClick={() => setSelectedCustomer(null)}>Change</button>}
              </div>
            )}
            
            {searchTerm && !selectedCustomer && (
              <div className="customer-list" style={{ padding: 0, marginTop: 4, border: '1px solid var(--border)', maxHeight: '150px', overflowY: 'auto' }}>
                {filteredCustomers.map(c => (
                  <div key={c.id} className="customer-card" style={{ padding: '10px', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)' }}
                    onClick={() => { setSelectedCustomer(c); setSearchTerm(''); }}>
                    <div>{c.name} <small>({c.route_day})</small></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="divider" />

          <div className="section-title">Products</div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-8 mt-8" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <label className="field-label" style={{ fontSize: 10 }}>Product</label>
                <select className="field-input" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} required>
                  <option value="">Select</option>
                  {products?.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label" style={{ fontSize: 10 }}>Qty</label>
                <input type="number" className="field-input" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
              </div>
              {items.length > 1 && <button type="button" className="btn btn-danger btn-icon" onClick={() => handleRemoveItem(index)}>×</button>}
            </div>
          ))}

          <button type="button" className="btn btn-outline w-full mt-12" onClick={handleAddItem}>+ Add Product</button>

          <div className="flex gap-12 mt-24">
            {editOrder && <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>Delete</button>}
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '16px' }} disabled={loading}>
              {loading ? 'Saving...' : (editOrder ? 'UPDATE ORDER' : 'SAVE ORDER')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}