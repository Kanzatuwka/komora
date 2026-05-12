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
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { pickLocale, pickPrice } from '@/shared/lib/i18nContent';
import { useTranslation } from 'react-i18next';

interface FilterOptions {
  category?: string;
  tag?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
}

export function useProducts(filters: FilterOptions) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { currency } = useCurrency();

  useEffect(() => {
    let q = query(collection(db, 'products'));

    if (filters.category && filters.category !== 'all') {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.tag) {
      q = query(q, where('tags', 'array-contains', filters.tag));
    }

    // Apply sorting
    // NOTE: sorting by price in Firestore with multi-currency is tricky 
    // without a separate field for normalized price. For now, we sort by raw field
    // but in a real app we might need a hidden 'sortPrice' field.
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
      setProducts(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          name: pickLocale(data.name, language),
          description: pickLocale(data.description, language),
          price: pickPrice(data.price, currency),
          raw: data // keep raw data for admin or special cases
        };
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsub;
  }, [filters.category, filters.tag, filters.sortBy, language, currency]);

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
  const { language } = useLanguage();
  const { currency } = useCurrency();

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'products', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProduct({
          id: snap.id,
          ...data,
          name: pickLocale(data.name, language),
          description: pickLocale(data.description, language),
          price: pickPrice(data.price, currency),
          raw: data
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `products/${id}`);
    });
    return unsub;
  }, [id, language, currency]);

  return { product, loading };
}

export function useLinkedArticles(articleIds: string[]) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

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
      setArticles(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          title: pickLocale(data.title, language),
          body: pickLocale(data.body, language),
          excerpt: pickLocale(data.excerpt, language),
          raw: data
        };
      }));
      setLoading(false);
    });

    return unsub;
  }, [JSON.stringify(articleIds), language]);

  return { articles, loading };
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const { currency } = useCurrency();

  const createOrder = async (orderData: any) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'new',
        userLanguage: i18n.language,
        currency: currency,
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
  const { language } = useLanguage();

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const unsub = onSnapshot(q, (snap) => {
      setAddresses(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          label: pickLocale(data.label, language), // Assuming addresses might be localized labels
          raw: data
        };
      }));
      setLoading(false);
    });
    return unsub;
  }, [userId, language]);

  return { addresses, loading };
}

export function usePickupAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pickupAddresses'), (snap) => {
      setAddresses(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          label: pickLocale(data.label, language),
          address: pickLocale(data.address, language),
          workingHours: pickLocale(data.workingHours, language),
          raw: data
        };
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pickupAddresses');
    });
    return unsub;
  }, [language]);

  return { addresses, loading };
}
