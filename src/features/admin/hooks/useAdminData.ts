import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

export function useAdminStats() {
  const [stats, setStats] = useState({
    newOrders: 0,
    monthOrders: 0,
    subscribers: 0,
    articles: 0,
    products: 0,
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoTimestamp = Timestamp.fromDate(monthAgo);

    const unsubNewOrders = onSnapshot(query(collection(db, 'orders'), where('status', '==', 'new')), (snap) => {
      setStats(prev => ({ ...prev, newOrders: snap.size }));
    });

    const unsubMonthOrders = onSnapshot(query(collection(db, 'orders'), where('createdAt', '>=', monthAgoTimestamp)), (snap) => {
      setStats(prev => ({ ...prev, monthOrders: snap.size }));
    });

    const unsubRecentOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
      setStats(prev => ({ ...prev, recentOrders: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      setLoading(false);
    });

    const unsubSubscribers = onSnapshot(query(collection(db, 'subscribers'), where('status', '==', 'confirmed')), (snap) => {
      setStats(prev => ({ ...prev, subscribers: snap.size }));
    });

    const unsubArticles = onSnapshot(query(collection(db, 'articles'), where('published', '==', true)), (snap) => {
      setStats(prev => ({ ...prev, articles: snap.size }));
    });

    const unsubProducts = onSnapshot(query(collection(db, 'products'), where('inStock', '==', true)), (snap) => {
      setStats(prev => ({ ...prev, products: snap.size }));
    });

    return () => {
      unsubNewOrders();
      unsubMonthOrders();
      unsubRecentOrders();
      unsubSubscribers();
      unsubArticles();
      unsubProducts();
    };
  }, []);

  return { stats, loading };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { orders, loading };
}

export function useBlogCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'blogCategories'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { categories, loading };
}
