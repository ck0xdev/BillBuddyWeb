import React, { useState, useEffect } from 'react';

export default function AddCustomerModal({ isOpen, onClose, customer, defaultDay, api }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [srNo, setSrNo] = useState('');
  const [selectedDay, setSelectedDay] = useState(defaultDay || 'Mon');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setName(customer.name);
        setMobile(customer.mobile || '');
        setSrNo(customer.sr_no?.toString() || '');
        setSelectedDay(customer.route_day);
      } else {
        setName('');
        setMobile('');
        setSrNo('');
        setSelectedDay(defaultDay);
      }
    }
  }, [isOpen, customer, defaultDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Name is required');

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        route_day: selectedDay,
        sr_no: srNo ? parseInt(srNo) : 1
      };

      if (customer) {
        await api.updateCustomer(customer.id, payload);
      } else {
        await api.createCustomer(payload);
      }
      onClose();
    } catch (err) {
      alert('Error saving customer: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer and all their bills?')) {
      setLoading(true);
      await api.deleteCustomer(customer.id);
      onClose();
    }
  };

  if (!isOpen) return null;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{customer ? 'Edit Customer' : 'New Customer'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Route Day</label>
            <div className="day-picker">
              {days.map(d => (
                <button
                  type="button"
                  key={d}
                  className={`day-option ${selectedDay === d ? 'active' : ''}`}
                  onClick={() => setSelectedDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-12">
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">Shop Name</label>
              <input
                autoFocus
                type="text"
                className="field-input"
                placeholder="e.g. Laxmi Store"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="field" style={{ width: 90 }}>
              <label className="field-label">Sr No.</label>
              <input
                type="number"
                className="field-input"
                placeholder="1"
                value={srNo}
                onChange={e => setSrNo(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Mobile Number (Optional)</label>
            <input
              type="tel"
              className="field-input"
              placeholder="9876543210"
              maxLength={10}
              value={mobile}
              onChange={e => setMobile(e.target.value)}
            />
          </div>

          <div className="flex gap-12 mt-16">
            {customer && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                Delete
              </button>
            )}
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}