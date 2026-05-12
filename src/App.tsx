/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { LanguageProvider } from './shared/contexts/LanguageContext';
import { CurrencyProvider } from './shared/contexts/CurrencyContext';
import { CartProvider } from './shared/contexts/CartContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import { AppRouter } from './shared/router/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <ToastProvider>
                <AppRouter />
              </ToastProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

