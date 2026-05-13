import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { useAuth } from './AuthContext';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, Language } from '@/i18n/config';

const STORAGE_KEY = 'komora-language';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

function detectInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored;
  
  const browser = navigator.language.slice(0, 2).toLowerCase() as any;
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(browser)) return browser;
  
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] = React.useState<string>(i18n.language || detectInitialLanguage());

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    const lang = detectInitialLanguage();
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [i18n]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const stored = snap.data()?.language as Language | undefined;
        if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored) && stored !== i18n.language) {
          await i18n.changeLanguage(stored);
          localStorage.setItem(STORAGE_KEY, stored);
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
      }
    })();
  }, [user?.uid]);

  const changeLanguage = async (lang: Language) => {
    if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) return;
    await i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { language: lang });
      } catch (error) {
        console.error('Error updating user language:', error);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
