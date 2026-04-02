import React, { useState } from 'react';
import { useCollectionSync, generateUUID } from '../lib/hooks';
import { createCustomer, updateCustomer, deleteCustomer, createBill } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { getLocalDateString } from '../lib/dateUtils';
import Header from '../components/Header';
import DayScroller from '../components/DayScroller';
import CustomerCard from '../components/CustomerCard';
import AddCustomerModal from '../components/Modals/AddCustomerModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(() => localStorage.getItem('billbuddy_day') || 'Mon');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, loading: loadingCustomers } = useCollectionSync('customers', currentDay);
  const { data: bills, loading: loadingBills } = useCollectionSync('bills', null); // Fetch all active bills to calculate pending

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Sync day to local storage
  React.useEffect(() => {
    localStorage.setItem('billbuddy_day', currentDay);
  }, [currentDay]);

  const getPendingAmount = (customerId) => {
    return bills
      .filter(b => b.customer_id === customerId)
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount)), 0);
  };

  const totalPending = customers.reduce((sum, c) => sum + getPendingAmount(c.id), 0);

  const todayStr = getLocalDateString();
  const totalCollectedToday = bills
    .filter(b => b.date === todayStr)
    .reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mobile && c.mobile.includes(searchTerm))
  );

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
  };

  const handleDetails = (customer) => {
    navigate(`/customer/${customer.id}`);
  };

  return (
    <div>
      <Header />

      <DayScroller currentDay={currentDay} onDayChange={setCurrentDay} />

      <div className="search-wrap">
        <input
          type="text"
          className="search-input"
          placeholder="Search Customer or Mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-label">Shops</div>
          <div className="stat-value primary">{filteredCustomers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Due</div>
          <div className="stat-value danger">₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--success)', color: 'white', borderColor: 'var(--success)' }}>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Collected (Today)</div>
          <div className="stat-value" style={{ color: 'white' }}>₹{totalCollectedToday.toLocaleString()}</div>
        </div>
      </div>

      <div className="customer-list">
        {loadingCustomers || loadingBills ? (
          <div className="loading-page">
            <div className="spinner"></div>
            <div>Loading customers...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <div className="empty-title">No customers found</div>
            <div className="empty-desc">There are no shops or customers registered for {currentDay}.</div>
            <button className="btn btn-primary" onClick={() => { setEditingCustomer(null); setShowAddModal(true); }}>
              Add First Customer
            </button>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              pending={getPendingAmount(customer.id)}
              onEdit={() => handleEdit(customer)}
              onDetails={() => handleDetails(customer)}
            />
          ))
        )}
      </div>

      <button className="fab" onClick={() => { setEditingCustomer(null); setShowAddModal(true); }}>+</button>

      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          customer={editingCustomer}
          defaultDay={currentDay}
          api={{ createCustomer, updateCustomer, deleteCustomer }}
        />
      )}
    </div>
  );
}