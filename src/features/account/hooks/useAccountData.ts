import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';

export function useUserOrders(userId: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return unsub;
  }, [userId]);

  return { orders, loading };
}

export function useUserAddresses(userId: string) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'addresses');
    });
    return unsub;
  }, [userId]);

  const addAddress = async (data: any) => {
    await addDoc(collection(db, 'addresses'), { ...data, userId });
  };

  const removeAddress = async (id: string) => {
    return deleteDoc(doc(db, 'addresses', id));
  };

  return { addresses, loading, addAddress, removeAddress };
}

export function useOrderDetails(id: string) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `orders/${id}`);
    });
    return unsub;
  }, [id]);

  return { order, loading };
}

export function useUpdateProfile(userId: string) {
  const [loading, setLoading] = useState(false);

  const updateProfile = async (data: any) => {
    if (!userId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading };
}
