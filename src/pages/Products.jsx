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
        if (window.confirm("Remove this product?")) {
            await deleteDoc(doc(db, 'products', id));
        }
    };

    return (
        <div>
            <Header />
            <div className="detail-header" style={{ background: 'var(--primary-dark)' }}>
                <div className="detail-name">Product Management</div>
                <div className="detail-sub">Manage items for the order dropdown</div>
            </div>

            <div className="search-wrap">
                <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: 10 }}>
                    <input 
                        type="text" 
                        className="field-input" 
                        placeholder="New Product Name..." 
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>
            </div>

            <div className="customer-list">
                {loading ? <div className="spinner"></div> : products.map(p => (
                    <div key={p.id} className="customer-card" style={{ justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                        <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}