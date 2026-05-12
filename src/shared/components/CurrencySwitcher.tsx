import React, { useState } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES, Currency } from '@/shared/contexts/CurrencyContext';
import { useCart } from '@/shared/contexts/CartContext';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

interface CurrencySwitcherProps {
  variant?: 'dropdown' | 'inline';
}

export function CurrencySwitcher({ variant = 'dropdown' }: CurrencySwitcherProps) {
  const { currency, changeCurrency } = useCurrency();
  const { cartCurrency, clearCart } = useCart();
  const { t } = useTranslation('common');
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null);

  const handleCurrencyAttempt = (newCurrency: Currency) => {
    if (newCurrency === (cartCurrency || currency)) return;

    if (cartCurrency && cartCurrency !== newCurrency) {
      setPendingCurrency(newCurrency);
    } else {
      changeCurrency(newCurrency);
    }
  };

  const confirmSwitch = () => {
    if (pendingCurrency) {
      clearCart();
      changeCurrency(pendingCurrency);
      setPendingCurrency(null);
    }
  };

  if (variant === 'inline') {
    return (
      <>
        <div className="flex gap-2">
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCurrencyAttempt(c as Currency)}
              className={`px-2 py-1 text-sm uppercase transition-colors ${
                (cartCurrency || currency) === c ? 'font-bold text-farm-green' : 'text-gray-500 hover:text-farm-green'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        
        <Modal 
          isOpen={!!pendingCurrency} 
          onClose={() => setPendingCurrency(null)}
          title={t('currencyChangeModal.title')}
        >
          <div className="space-y-6">
            <p className="text-farm-wood opacity-80">
              {t('currencyChangeModal.description', { current: cartCurrency, new: pendingCurrency })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPendingCurrency(null)} 
                className="flex-1"
              >
                {t('currencyChangeModal.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmSwitch} 
                className="flex-1"
              >
                {t('currencyChangeModal.confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <select
        value={cartCurrency || currency}
        onChange={(e) => handleCurrencyAttempt(e.target.value as Currency)}
        className="bg-transparent text-sm uppercase cursor-pointer hover:text-farm-green transition-colors focus:outline-none"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c} value={c} className="bg-white text-black">
            {c}
          </option>
        ))}
      </select>

      <Modal 
        isOpen={!!pendingCurrency} 
        onClose={() => setPendingCurrency(null)}
        title={t('currencyChangeModal.title')}
      >
        <div className="space-y-6">
          <p className="text-farm-wood opacity-80">
            {t('currencyChangeModal.description', { current: cartCurrency, new: pendingCurrency })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => setPendingCurrency(null)} 
              className="flex-1"
            >
              {t('currencyChangeModal.cancel')}
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmSwitch} 
              className="flex-1"
            >
              {t('currencyChangeModal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
