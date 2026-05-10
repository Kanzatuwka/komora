import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';

interface FilterOptions {
  category?: string;
  tag?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
}

export function useProducts(filters: FilterOptions) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'products'));

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.tag) {
      q = query(q, where('tags', 'array-contains', filters.tag));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        q = query(q, orderBy('price', 'asc'));
        break;
      case 'price-desc':
        q = query(q, orderBy('price', 'desc'));
        break;
      default:
        q = query(q, orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsub;
  }, [filters.category, filters.tag, filters.sortBy]);

  return { products, loading };
}

export function useCategoryTags(category: string) {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let q = query(collection(db, 'products'));
    if (category && category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    const unsub = onSnapshot(q, (snap) => {
      const allTags = new Set<string>();
      snap.docs.forEach(d => {
        const productTags = d.data().tags;
        if (Array.isArray(productTags)) {
          productTags.forEach(t => allTags.add(t));
        }
      });
      setTags(Array.from(allTags));
    });

    return unsub;
  }, [category]);

  return tags;
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'products', id), (snap) => {
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `products/${id}`);
    });
    return unsub;
  }, [id]);

  return { product, loading };
}

export function useLinkedArticles(articleIds: string[]) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleIds || articleIds.length === 0) {
      setArticles([]);
      setLoading(false);
      return;
    }

    // Firestore 'in' query is limited to 10 items
    const q = query(
      collection(db, 'articles'),
      where('__name__', 'in', articleIds.slice(0, 10)),
      where('published', '==', true)
    );

    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [JSON.stringify(articleIds)]);

  return { articles, loading };
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData: any) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading };
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
    });
    return unsub;
  }, [userId]);

  return { addresses, loading };
}

export function usePickupAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pickupAddresses'), (snap) => {
      setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { addresses, loading };
}
