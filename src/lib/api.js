import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { generateUUID } from './hooks';

// --- CUSTOMER FUNCTIONS ---
export const createCustomer = async (data) => {
    const id = generateUUID();
    await setDoc(doc(db, 'customers', id), {
        ...data,
        pending: 0,
        paid: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
    });
    return id;
};

export const updateCustomer = async (id, data) => {
    await updateDoc(doc(db, 'customers', id), {
        ...data,
        updated_at: new Date().toISOString(),
    });
};

export const deleteCustomer = async (customerId) => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'customers', customerId), { is_deleted: true, updated_at: new Date().toISOString() });

    const billsQ = query(collection(db, 'bills'), where('customer_id', '==', customerId));
    const billsSnap = await getDocs(billsQ);
    billsSnap.forEach(doc => {
        batch.update(doc.ref, { is_deleted: true, updated_at: new Date().toISOString() });
    });

    await batch.commit();
};

export const importCustomers = async (customersList, existingCustomers = []) => {
    const batch = writeBatch(db);
    let addedCount = 0;

    customersList.forEach(data => {
        const existing = existingCustomers.find(c =>
            c.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
            (c.mobile || '').trim() === (data.mobile || '').trim()
        );

        if (!existing) {
            const id = generateUUID();
            batch.set(doc(db, 'customers', id), {
                ...data,
                pending: 0,
                paid: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_deleted: false,
            });
            addedCount++;
        }
    });

    if (addedCount > 0) {
        await batch.commit();
    }
    return addedCount;
};

// --- BILLING FUNCTIONS ---
export const createBill = async (data) => {
    const id = generateUUID();
    await setDoc(doc(db, 'bills', id), {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
    });

    const pendingChange = data.total_amount - data.paid_amount;
    await updateDoc(doc(db, 'customers', data.customer_id), {
        pending: increment(pendingChange),
        paid: increment(data.paid_amount)
    });
};

export const updateBill = async (id, data, oldTotal, oldPaid, customerId) => {
    const pendingChange = (data.total_amount - oldTotal) - (data.paid_amount - oldPaid);
    const paidChange = data.paid_amount - oldPaid;

    const batch = writeBatch(db);
    batch.update(doc(db, 'bills', id), {
        ...data,
        updated_at: new Date().toISOString()
    });

    if (pendingChange !== 0 || paidChange !== 0) {
        batch.update(doc(db, 'customers', customerId), {
            pending: increment(pendingChange),
            paid: increment(paidChange)
        });
    }
    await batch.commit();
};

export const deleteBill = async (billId, bill, customerId) => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'bills', billId), {
        is_deleted: true,
        updated_at: new Date().toISOString()
    });

    const pendingChange = -(bill.total_amount - bill.paid_amount);
    const paidChange = -bill.paid_amount;

    batch.update(doc(db, 'customers', customerId), {
        pending: increment(pendingChange),
        paid: increment(paidChange)
    });

    await batch.commit();
};

// --- ORDER FUNCTIONS ---
export const createOrder = async (data) => {
    const id = generateUUID();
    await setDoc(doc(db, 'orders', id), {
        ...data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
    });
    return id;
};

export const updateOrder = async (id, data) => {
    await updateDoc(doc(db, 'orders', id), {
        ...data,
        updated_at: new Date().toISOString(),
    });
};

export const markOrderDone = async (orderId) => {
    await updateDoc(doc(db, 'orders', orderId), {
        status: 'completed',
        updated_at: new Date().toISOString(),
    });
};

export const deleteOrder = async (orderId) => {
    await updateDoc(doc(db, 'orders', orderId), { 
        is_deleted: true, 
        updated_at: new Date().toISOString() 
    });
};

// --- PRODUCT FUNCTIONS ---
export const addProduct = async (name) => {
    const id = generateUUID();
    await setDoc(doc(db, 'products', id), {
        name,
        created_at: new Date().toISOString()
    });
    return id;
};

export const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
};