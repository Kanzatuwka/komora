import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { pickLocale, pickPrice } from '@/shared/lib/i18nContent';

interface BlogFilters {
  tag?: string;
  categoryId?: string;
  count?: number;
}

/**
 * Hook to retrieve a filtered and locale-resolved array of published articles.
 */
export function useArticles({ tag, categoryId, count = 12 }: BlogFilters) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return unsub;
  }, [tag, categoryId, count, language]);

  return { articles, loading };
}

/**
 * Hook to grab all active blog categories resolving their translated locale dynamic structures.
 */
export function useBlogCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, 'blogCategories'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          name: pickLocale(data.name, language),
          raw: data
        };
      }));
      setLoading(false);
    });
    return unsub;
  }, [language]);

  return { categories, loading };
}

/**
 * Hook to load a single article with dynamic parsing of its multilingual body, excerpts and titles.
 */
export function useArticle(id: string) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'articles', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setArticle({
          id: snap.id,
          ...data,
          title: pickLocale(data.title, language),
          body: pickLocale(data.body, language),
          excerpt: pickLocale(data.excerpt, language),
          raw: data
        });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `articles/${id}`);
    });
    return unsub;
  }, [id, language]);

  return { article, loading };
}

/**
 * Hook to resolve any products explicitly tagged or embedded inside a given article.
 */
export function useLinkedProducts(productIds: string[]) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { currency } = useCurrency();

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
      setProducts(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          name: pickLocale(data.name, language),
          description: pickLocale(data.description, language),
          price: pickPrice(data.price, currency),
          raw: data
        };
      }));
      setLoading(false);
    });

    return unsub;
  }, [JSON.stringify(productIds), language, currency]);

  return { products, loading };
}
