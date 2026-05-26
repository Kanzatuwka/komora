import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';

/**
 * Hook to retrieve aggregated live metrics for the Admin Dashboard.
 * Listens to active collections including orders, subscribers, and catalog sizing.
 */
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

    // Stream count of newly submitted orders
    const unsubNewOrders = onSnapshot(query(collection(db, 'orders'), where('status', '==', 'new')), (snap) => {
      setStats(prev => ({ ...prev, newOrders: snap.size }));
    });

    // Stream count of orders processed during current 30-day window
    const unsubMonthOrders = onSnapshot(query(collection(db, 'orders'), where('createdAt', '>=', monthAgoTimestamp)), (snap) => {
      setStats(prev => ({ ...prev, monthOrders: snap.size }));
    });

    // Stream list of the most recent 5 orders
    const unsubRecentOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
      setStats(prev => ({ ...prev, recentOrders: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      setLoading(false);
    });

    // Stream count of verified system newsletter subscribers
    const unsubSubscribers = onSnapshot(query(collection(db, 'subscribers'), where('status', '==', 'confirmed')), (snap) => {
      setStats(prev => ({ ...prev, subscribers: snap.size }));
    });

    // Stream active published articles count
    const unsubArticles = onSnapshot(query(collection(db, 'articles'), where('published', '==', true)), (snap) => {
      setStats(prev => ({ ...prev, articles: snap.size }));
    });

    // Stream catalog counts for stock-available items
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

/**
 * Hook to read all system orders with real-time sync.
 */
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

/**
 * Hook to fetch blog post categories sorted by preference hierarchy.
 */
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
