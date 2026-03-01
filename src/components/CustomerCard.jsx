import React from 'react';

export default function CustomerCard({ customer, pending, onEdit, onDetails }) {
  return (
    <div className="customer-card" onClick={onEdit}>
      <div className="customer-avatar">
        {customer.name.charAt(0).toUpperCase()}
      </div>

      <div className="customer-info">
        <div className="customer-name">{customer.name}</div>
        <div className="customer-meta">
          <span className="customer-badge badge-neutral">#{customer.sr_no}</span>
          <span>{customer.mobile || 'No Mobile'}</span>
        </div>
      </div>

      <div className="flex items-center gap-12">
        <div className={`customer-pending ${pending <= 0 ? 'paid' : ''}`}>
          ₹{pending.toLocaleString()}
        </div>

        <button
          className="btn btn-sm btn-primary"
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
        >
          Details
        </button>
      </div>
    </div>
  );
}