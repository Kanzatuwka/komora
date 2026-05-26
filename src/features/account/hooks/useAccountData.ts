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
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { pickLocale } from '@/shared/lib/i18nContent';

/**
 * Hook to retrieve the orders of a specific user.
 * It listens to real-time updates from Firestore.
 */
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

/**
 * Hook to manage a user's shipping addresses.
 * Provides functions to fetch, add, and remove addresses.
 */
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

/**
 * Hook to retrieve real-time details of a single order.
 */
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

/**
 * Hook to update a user's profile information.
 */
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

/**
 * Hook to retrieve real-time details of a single pickup address point,
 * resolving localized values according to current language selection.
 */
export function usePickupAddress(id: string | null | undefined) {
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (!id) {
      setAddress(null);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'pickupAddresses', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAddress({
          id: snap.id,
          label: pickLocale(data.label, language),
          address: pickLocale(data.address, language),
          workingHours: pickLocale(data.workingHours, language),
          raw: data
        });
      } else {
        setAddress(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `pickupAddresses/${id}`);
      setLoading(false);
    });
    return unsub;
  }, [id, language]);

  return { address, loading };
}

