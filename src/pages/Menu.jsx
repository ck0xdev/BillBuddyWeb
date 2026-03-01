import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useCollectionSync } from '../lib/hooks';
import { importCustomers } from '../lib/api';
import Header from '../components/Header';

export default function Menu() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const navigate = useNavigate();

    const { data: customers, loading: loadingCust } = useCollectionSync('customers', null);
    const { data: bills, loading: loadingBills } = useCollectionSync('bills', null);

    const getPendingAmount = (customerId) => {
        return bills
            .filter(b => b.customer_id === customerId)
            .reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount)), 0);
    };

    const getPaidAmount = (customerId) => {
        return bills
            .filter(b => b.customer_id === customerId)
            .reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0);
    };

    // Enriched customers list
    const enrichedCustomers = customers.map(c => ({
        ...c,
        pendingAmt: getPendingAmount(c.id),
        paidAmt: getPaidAmount(c.id)
    }));

    const filteredCustomers = enrichedCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.mobile && c.mobile.includes(searchTerm))
    );

    const totalPending = enrichedCustomers.reduce((sum, c) => sum + c.pendingAmt, 0);
    const totalPaid = enrichedCustomers.reduce((sum, c) => sum + c.paidAmt, 0);

    const handleExport = () => {
        if (enrichedCustomers.length === 0) return;

        const exportData = enrichedCustomers.map(c => ({
            'Route Day': c.route_day,
            'Serial No': c.sr_no || '-',
            'Shop/Customer Name': c.name,
            'Mobile': c.mobile || '-',
            'Pending Due (₹)': c.pendingAmt,
            'Total Paid (₹)': c.paidAmt
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "All Customers");
        XLSX.writeFile(wb, `BillBuddy_Directory_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const newCustomers = data.map(row => ({
                    name: row['Shop/Customer Name'] || row['Name'] || row['name'] || 'Unknown Shop',
                    mobile: row['Mobile'] || row['mobile'] || row['Phone'] || '',
                    route_day: row['Route Day'] || row['route_day'] || row['Day'] || 'Mon',
                    sr_no: parseInt(row['Serial No'] || row['sr_no'] || row['SrNo']) || 1,
                }));

                if (newCustomers.length > 0) {
                    const addedCount = await importCustomers(newCustomers, customers);
                    alert(`Successfully imported ${addedCount} new shops! (${newCustomers.length - addedCount} duplicates skipped)`);
                } else {
                    alert('No valid customer data found in file.');
                }
            } catch (error) {
                console.error(error);
                alert('Error importing data: ' + error.message);
            }
            setIsImporting(false);
            e.target.value = ''; // reset file input
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <Header />

            <div className="search-wrap">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search all customers in directory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-label">Total Shops</div>
                    <div className="stat-value primary">{enrichedCustomers.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Market Due</div>
                    <div className="stat-value danger">₹{totalPending.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Collected</div>
                    <div className="stat-value success">₹{totalPaid.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--text-muted)' }}>Directory ({filteredCustomers.length})</div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <label className="btn btn-sm btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                        <span style={{ fontSize: 16 }}>📥</span> {isImporting ? 'Importing...' : 'Import'}
                        <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} onChange={handleImport} disabled={isImporting} />
                    </label>
                    <button className="btn btn-sm btn-outline" onClick={handleExport} disabled={enrichedCustomers.length === 0}>
                        <span style={{ fontSize: 16 }}>📊</span> Export Excel
                    </button>
                </div>
            </div>

            <div className="customer-list">
                {loadingCust || loadingBills ? (
                    <div className="loading-page">
                        <div className="spinner"></div>
                        <div>Loading directory...</div>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <div className="empty-title">No customers found</div>
                    </div>
                ) : (
                    filteredCustomers.map(c => (
                        <div key={c.id} className="customer-card" onClick={() => navigate(`/customer/${c.id}`)}>
                            <div className="customer-avatar" style={{ background: 'var(--bg)', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="customer-info">
                                <div className="customer-name">{c.name}</div>
                                <div className="customer-meta">
                                    <span>{c.route_day} Route</span>
                                    <span>•</span>
                                    <span>{c.mobile || 'No Mobile'}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {c.pendingAmt > 0 ? (
                                    <>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)' }}>₹{c.pendingAmt.toLocaleString()}</div>
                                        <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>Paid: ₹{c.paidAmt}</div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: 16 }}>✅</div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
