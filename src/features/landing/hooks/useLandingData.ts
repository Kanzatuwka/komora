import { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { pickLocale, pickPrice } from '@/shared/lib/i18nContent';

export function useFeaturedProducts(count = 4) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const { currency } = useCurrency();

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      where('featured', '==', true),
      limit(count)
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsub;
  }, [count, language, currency]);

  return { products, loading };
}

export function useFeaturedArticles(count = 3) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const q = query(
      collection(db, 'articles'),
      where('featured', '==', true),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return unsub;
  }, [count, language]);

  return { articles, loading };
}

export function useLandingSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'landing'));
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            ...data,
            hero: data.hero ? {
              ...data.hero,
              title: pickLocale(data.hero.title, language),
              subtitle: pickLocale(data.hero.subtitle, language),
              ctaText: pickLocale(data.hero.ctaText, language),
              raw: data.hero
            } : null,
            about: data.about ? {
              ...data.about,
              text: pickLocale(data.about.text, language),
              raw: data.about
            } : null,
            raw: data
          });
        } else {
          // Default fallbacks (Ukrainian)
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
  }, [language]);

  return { settings, loading };
}
