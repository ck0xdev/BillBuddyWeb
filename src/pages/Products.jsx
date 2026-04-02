import React, { useState } from 'react';
import { useCollectionSync } from '../lib/hooks';
import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Header from '../components/Header';

export default function Products() {
    const { data: products, loading } = useCollectionSync('products', null);
    const [newProductName, setNewProductName] = useState('');

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProductName.trim()) return;
        try {
            await addDoc(collection(db, 'products'), {
                name: newProductName.trim(),
                created_at: new Date().toISOString()
            });
            setNewProductName('');
        } catch (error) {
            alert("Error adding product: " + error.message);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Remove this product from the inventory list?")) {
            await deleteDoc(doc(db, 'products', id));
        }
    };

    return (
        <div style={{ paddingBottom: 100 }}>
            <Header />
            
            <div className="container animate-slide-up">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h2 className="premium-title" style={{ fontSize: 26, color: 'var(--text)' }}>Inventory Management</h2>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Defining product lists for global order tracking</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 28, marginBottom: 40, border: 'none', background: 'var(--surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleAddProduct}>
                        <label className="field-label" style={{ marginBottom: 12, letterSpacing: '0.06em' }}>REGISTER NEW PRODUCT</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input 
                                type="text" 
                                className="field-input" 
                                style={{ borderRadius: 16, background: 'rgba(0,0,0,0.02)', flex: 1, height: 52 }}
                                placeholder="Enter item name (e.g. Premium Milk)..." 
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ height: 52, borderRadius: 16, padding: '0 32px', fontSize: 16, fontWeight: 700 }}>
                                Add Item
                            </button>
                        </div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-tertiary)', marginTop: 14, textTransform: 'uppercase' }}>
                            Items added here will be immediately available in the market order dropdown.
                        </p>
                    </form>
                </div>

                <div style={{ padding: '0 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="premium-title" style={{ fontSize: 20, color: 'var(--text)' }}>Active Inventory List</h3>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{products.length} ITEMS TOTAL</div>
                </div>

                <div className="results-grid">
                    {loading ? (
                        <div className="loading-page" style={{ gridColumn: '1 / -1' }}><div className="spinner"></div></div>
                    ) : products.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 16 }}>Your product inventory is currently empty.</p>
                        </div>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="card" style={{ marginBottom: 0, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)', opacity: 0.8 }}></div>
                                    <span className="premium-title" style={{ fontSize: 17, color: 'var(--text)' }}>{p.name}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className="btn btn-secondary"
                                    style={{ color: 'var(--danger)', fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 10, background: 'rgba(255, 59, 48, 0.04)' }}
                                >
                                    REMOVE
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}