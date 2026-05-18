import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCurrency, Currency } from './CurrencyContext';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  cartCurrency: Currency | null;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartCurrency, setCartCurrency] = useState<Currency | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('komora-cart');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && typeof data === 'object' && 'items' in data) {
          setItems(data.items || []);
          setCartCurrency(data.cartCurrency || null);
          
          // Sync currency context with cart currency if it exists
          if (data.cartCurrency) {
            changeCurrency(data.cartCurrency);
          }
        } else if (Array.isArray(data)) {
          // Backward compatibility for array-only format
          setItems(data);
        }
      } catch (e) {
        console.error('Failed to load cart from local storage', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('komora-cart', JSON.stringify({ items, cartCurrency }));
    }
  }, [items, cartCurrency, isInitialized]);

  // Clear cart on logout
  useEffect(() => {
    if (!user && isInitialized) {
      // If we're not logged in, we shouldn't have items from a previous session
      // (AuthContext already removes it from localStorage on logout)
      if (items.length > 0) {
        setItems([]);
        setCartCurrency(null);
      }
    }
  }, [user, isInitialized, items.length]);

  const addItem = (product: any, quantity: number) => {
    // Set cart currency if this is the first item
    if (!cartCurrency) {
      setCartCurrency(currency);
    }

    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId);
      if (next.length === 0) {
        setCartCurrency(null);
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.productId === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    setCartCurrency(null);
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      total, 
      count,
      cartCurrency
    }}>
      {children}
    </CartContext.Provider>
  );
}
