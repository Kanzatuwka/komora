import React from 'react';
import { useCurrency, SUPPORTED_CURRENCIES, Currency } from '@/shared/contexts/CurrencyContext';

interface CurrencySwitcherProps {
  variant?: 'dropdown' | 'inline';
}

export function CurrencySwitcher({ variant = 'dropdown' }: CurrencySwitcherProps) {
  const { currency, changeCurrency } = useCurrency();

  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        {SUPPORTED_CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => changeCurrency(c as Currency)}
            className={`px-2 py-1 text-sm uppercase transition-colors ${
              currency === c ? 'font-bold text-farm-green' : 'text-gray-500 hover:text-farm-green'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select
      value={currency}
      onChange={(e) => changeCurrency(e.target.value as Currency)}
      className="bg-transparent text-sm uppercase cursor-pointer hover:text-farm-green transition-colors focus:outline-none"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c} className="bg-white text-black">
          {c}
        </option>
      ))}
    </select>
  );
}
