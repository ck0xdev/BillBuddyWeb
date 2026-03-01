import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCollectionSync(collectionName, activeDay) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let q = collection(db, collectionName);

        // Apply filters based on collection type
        if (collectionName === 'customers') {
            if (activeDay) {
                q = query(q, where('is_deleted', '==', false), where('route_day', '==', activeDay));
            } else {
                q = query(q, where('is_deleted', '==', false));
            }
        } else if (collectionName === 'bills') {
            q = query(q, where('is_deleted', '==', false));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort in JS to avoid composite index requirements
            if (collectionName === 'customers') {
                items.sort((a, b) => (a.sr_no || 0) - (b.sr_no || 0));
            }

            setData(items);
            setLoading(false);
        }, (err) => {
            console.error('Firebase error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName, activeDay]);

    return { data, loading };
}

export function generateUUID() {
    return crypto.randomUUID();
}
