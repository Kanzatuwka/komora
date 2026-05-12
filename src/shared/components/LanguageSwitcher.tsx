import React from 'react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '@/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline';
}

export function LanguageSwitcher({ variant = 'dropdown' }: LanguageSwitcherProps) {
  const { language, changeLanguage } = useLanguage();

  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button
            key={lng}
            onClick={() => changeLanguage(lng as Language)}
            className={`px-2 py-1 text-sm uppercase transition-colors ${
              language === lng ? 'font-bold text-farm-green' : 'text-gray-500 hover:text-farm-green'
            }`}
          >
            {lng}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value as Language)}
      className="bg-transparent text-sm uppercase cursor-pointer hover:text-farm-green transition-colors focus:outline-none"
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <option key={lng} value={lng} className="bg-white text-black">
          {lng}
        </option>
      ))}
    </select>
  );
}
