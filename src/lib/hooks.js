import { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Memoized sort comparator outside the effect
const customerSort = (a, b) => (a.sr_no || 0) - (b.sr_no || 0);

export function useCollectionSync(collectionName, activeDay) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const prevDataRef = useRef(null); // For deep comparison

    useEffect(() => {
        setLoading(true);
        let q = collection(db, collectionName);

        if (collectionName === 'customers') {
            q = activeDay 
                ? query(q, where('is_deleted', '==', false), where('route_day', '==', activeDay))
                : query(q, where('is_deleted', '==', false));
        } else if (collectionName === 'bills') {
            q = query(q, where('is_deleted', '==', false));
        } else if (collectionName === 'orders') {
            q = query(q, where('is_deleted', '==', false));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (collectionName === 'customers') {
                items.sort(customerSort);
            }

            // deduplication check
            const newJson = JSON.stringify(items);
            if (newJson !== prevDataRef.current) {
                prevDataRef.current = newJson;
                setData(items);
            }
            setLoading(false); // Move inside callback
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