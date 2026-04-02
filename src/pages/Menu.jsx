import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useCollectionSync } from '../lib/hooks';
import { importCustomers } from '../lib/api';
import { getLocalDateString } from '../lib/dateUtils';
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
            .reduce((sum, b) => sum + (parseFloat(b.total_amount) - parseFloat(b.paid_amount || 0)), 0);
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
        XLSX.writeFile(wb, `VyaparBook_Directory_${getLocalDateString()}.xlsx`);
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
        <div style={{ paddingBottom: 100 }}>
            <Header />

            <div className="container animate-slide-up">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h2 className="premium-title" style={{ fontSize: 26, color: 'var(--text)' }}>Member Directory</h2>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Central management for all market entries</p>
                    </div>
                </div>

                <div className="field" style={{ margin: '0 0 32px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="field-input"
                            style={{ paddingLeft: 44, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', height: 52 }}
                            placeholder="Filter members by name or contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
                    <div className="card" style={{ padding: 20, border: 'none', background: 'rgba(52, 199, 89, 0.05)' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--success)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL COLLECTION</div>
                        <div className="premium-title" style={{ fontSize: 24, color: 'var(--success)' }}>
                            ₹{totalPaid.toLocaleString()}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20, border: 'none', background: 'rgba(255, 59, 48, 0.05)' }}>
                        <div className="text-xs font-bold" style={{ color: 'var(--danger)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>MARKET OUTSTANDING</div>
                        <div className="premium-title" style={{ fontSize: 24, color: 'var(--danger)' }}>
                            ₹{totalPending.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {loadingCust || loadingBills ? (
                        <div className="loading-page"><div className="spinner"></div></div>
                    ) : filteredCustomers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 18 }}>No member records found in the directory.</p>
                        </div>
                    ) : (
                        filteredCustomers.map(c => (
                            <div key={c.id} className="card" onClick={() => navigate(`/customer/${c.id}`)} style={{ marginBottom: 0, padding: 20, cursor: 'pointer', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ 
                                        width: 48, 
                                        height: 48, 
                                        borderRadius: 14, 
                                        background: 'rgba(0, 122, 255, 0.06)', 
                                        color: 'var(--primary)', 
                                        fontSize: 18, 
                                        fontWeight: 800, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="premium-title" style={{ fontSize: 17, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{c.route_day}</span>
                                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-tertiary)' }}></span>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{c.mobile || 'No Contact'}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        {c.pendingAmt > 0 ? (
                                            <>
                                                <div className="font-bold" style={{ fontSize: 18, color: 'var(--danger)', fontFamily: 'Outfit' }}>₹{c.pendingAmt.toLocaleString()}</div>
                                                <div className="text-xs font-bold" style={{ color: 'var(--success)', marginTop: 2 }}>PAID: ₹{c.paidAmt.toLocaleString()}</div>
                                            </>
                                        ) : (
                                            <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12 }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                SETTLED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
