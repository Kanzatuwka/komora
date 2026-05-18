import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/shared/lib/firebase';
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
  const { user, profile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = React.useState<string>(
    () => i18n.language || detectInitialLanguage()
  );
  
  // Track which user we've already synced from Firestore
  // Prevents re-fetching language on every user object identity change
  const syncedUserIdRef = useRef<string | null>(null);
  // True when user is actively changing language — skip Firestore sync
  const isUserChangingRef = useRef<boolean>(false);

  // Subscribe to i18n language changes (single source of truth for UI state)
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Apply initial language from localStorage/browser ONCE on mount
  useEffect(() => {
    const lang = detectInitialLanguage();
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — run once

  // Sync language from Firestore profile
  useEffect(() => {
    if (!profile?.language) return;
    if (isUserChangingRef.current) return;

    if (profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language);
      localStorage.setItem(STORAGE_KEY, profile.language);
    }
  }, [profile?.language, i18n]);

  const changeLanguage = async (lang: Language) => {
    if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) return;
    
    isUserChangingRef.current = true;
    try {
      await i18n.changeLanguage(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), { language: lang });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }
      }
    } finally {
      isUserChangingRef.current = false;
    }
  };

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
