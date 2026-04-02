import React, { useState, useMemo } from 'react';
import { useCollectionSync } from '../lib/hooks';
import { useNavigate } from 'react-router-dom';
import { createCustomer, updateCustomer, deleteCustomer } from '../lib/api';
import Header from '../components/Header';
import DayScroller from '../components/DayScroller';
import CustomerCard from '../components/CustomerCard';
import AddCustomerModal from '../components/Modals/AddCustomerModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentDay, setCurrentDay] = useState(() => localStorage.getItem('billbuddy_day') || 'Mon');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: customers, loading: loadingCustomers } = useCollectionSync('customers', currentDay);
  const { data: allCustomers } = useCollectionSync('customers', null);
  const { data: bills, loading: loadingBills } = useCollectionSync('bills', null);

  const scheduledDays = useMemo(() => [...new Set(allCustomers.map(c => c.route_day))], [allCustomers]);

  React.useEffect(() => {
    localStorage.setItem('billbuddy_day', currentDay);
    document.title = 'Vyapar Book — Ledger Dashboard';
  }, [currentDay]);

  const getPendingAmount = (customerId) => {
    return bills
      .filter(b => b.customer_id === customerId)
      .reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount || 0)), 0);
  };

  const totalPending = customers.reduce((sum, c) => sum + getPendingAmount(c.id), 0);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.mobile && c.mobile.includes(searchTerm))
  );

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header />
      
      <div className="container animate-slide-up">
        {/* Dashboard Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 className="premium-title" style={{ fontSize: 28, color: 'var(--text)' }}>Market Ledger</h2>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Managing active records for the selected route</p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ borderRadius: 14, height: 48, padding: '0 24px', fontSize: 16, boxShadow: '0 8px 16px rgba(0, 122, 255, 0.2)' }}
            onClick={() => setShowAddModal(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Member</span>
          </button>
        </div>

        <DayScroller currentDay={currentDay} onDayChange={setCurrentDay} scheduledDays={scheduledDays} />

        <div className="field" style={{ margin: '8px 0 32px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="field-input"
              style={{ paddingLeft: 48, borderRadius: 18, background: 'var(--surface)', border: '1px solid var(--border)', height: 56 }}
              placeholder="Search by shop name, member or contact number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* Stats Section - Re-designed for wider screens */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="card" style={{ padding: 24, border: 'none', background: 'rgba(255, 59, 48, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'var(--danger)', color: 'white', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Total Market Due</span>
                <div className="premium-title" style={{ fontSize: 28, color: 'var(--text)' }}>
                  ₹{totalPending.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24, border: 'none', background: 'var(--surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                   <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Active Shop Count</span>
                <div className="premium-title" style={{ fontSize: 28, color: 'var(--text)' }}>
                  {filteredCustomers.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-grid">
          {(loadingCustomers || loadingBills) && customers.length === 0 ? (
            <div className="loading-page"><div className="spinner"></div></div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: 24 }}>
              <div style={{ color: 'var(--primary)', marginBottom: 20 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="premium-title" style={{ color: 'var(--text)', marginBottom: 12, fontSize: 22 }}>No Records Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>Try refining your search or select a different route from the scroller above.</p>
            </div>
          ) : filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              pending={getPendingAmount(customer.id)}
              onDetails={() => navigate(`/customer/${customer.id}`)}
              onEdit={() => {}} // Placeholder for edit logic
            />
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          defaultDay={currentDay}
          api={{ createCustomer, updateCustomer, deleteCustomer }}
        />
      )}
    </div>
  );
}