import { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';

export function useFeaturedProducts(count = 4) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
      limit(count)
    );

    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsub;
  }, [count]);

  return { products, loading };
}

export function useFeaturedArticles(count = 3) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'articles'),
      where('featured', '==', true),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    const unsub = onSnapshot(q, (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return unsub;
  }, [count]);

  return { articles, loading };
}

export function useLandingSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'landing'));
        if (snap.exists()) {
          setSettings(snap.data());
        } else {
          setSettings({
            hero: {
              title: 'Справжні смаки природи',
              subtitle: 'Сімейні рецепти, зібрані з любов’ю на наших полях та садах.',
              ctaText: 'До магазину',
              imageUrl: '',
            },
            about: {
              text: 'Ласкаво просимо до Комори! Ми – сімейна ферма, що присвятила себе створенню натуральних продуктів. Кожна баночка нашого варення чи соусу – це результат ручної праці та найкращих інгредієнтів.',
              imageUrl: '',
            }
          });
        }
      } catch (err) {
        console.error('Error fetching landing settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}
