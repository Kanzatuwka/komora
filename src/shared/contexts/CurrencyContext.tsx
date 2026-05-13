import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export const SUPPORTED_CURRENCIES = ['UAH', 'EUR', 'USD'] as const;
export type Currency = typeof SUPPORTED_CURRENCIES[number];

const STORAGE_KEY = 'komora-currency';
const DEFAULT_BY_LANGUAGE: Record<string, Currency> = { uk: 'UAH', en: 'USD', de: 'EUR' };

interface CurrencyContextType {
  currency: Currency;
  changeCurrency: (c: Currency) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<Currency>('UAH');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) {
      setCurrency(stored);
    } else {
      setCurrency(DEFAULT_BY_LANGUAGE[language] || 'UAH');
    }
  }, [language]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const stored = snap.data()?.preferredCurrency as Currency | undefined;
        if (stored && (SUPPORTED_CURRENCIES as readonly string[]).includes(stored)) {
          setCurrency(stored);
          localStorage.setItem(STORAGE_KEY, stored);
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    })();
  }, [user?.uid]);

  const changeCurrency = async (c: Currency) => {
    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(c)) return;
    setCurrency(c);
    localStorage.setItem(STORAGE_KEY, c);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { preferredCurrency: c });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
