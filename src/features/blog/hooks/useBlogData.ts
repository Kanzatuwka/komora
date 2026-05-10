import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';

interface BlogFilters {
  tag?: string;
  categoryId?: string;
  count?: number;
}

export function useArticles({ tag, categoryId, count = 12 }: BlogFilters) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, 'articles'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    if (categoryId && categoryId !== 'all') {
      q = query(q, where('categoryId', '==', categoryId));
    } else if (tag && tag !== 'all') {
      q = query(q, where('tags', 'array-contains', tag));
    }

    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return unsub;
  }, [tag, categoryId, count]);

  return { articles, loading };
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

export function useArticle(id: string) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'articles', id), (snap) => {
      if (snap.exists()) {
        setArticle({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `articles/${id}`);
    });
    return unsub;
  }, [id]);

  return { article, loading };
}

export function useLinkedProducts(productIds: string[]) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productIds || productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('__name__', 'in', productIds.slice(0, 10))
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsub;
  }, [JSON.stringify(productIds)]);

  return { products, loading };
}
