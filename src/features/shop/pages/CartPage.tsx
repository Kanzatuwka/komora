import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/shared/contexts/CartContext';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Minus, Plus, Trash2, ShoppingBasket, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { formatPrice } from '@/shared/lib/format';
import { getLocalizedValue } from '@/shared/lib/utils';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, count, cartCurrency } = useCart();
  const { t } = useTranslation(['shop', 'common']);
  const { language } = useLanguage();
  const { currency: currentCurrency } = useCurrency();
  const currency = cartCurrency || currentCurrency;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-farm-cream/30">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-32 pb-24 flex items-center justify-center">
          <EmptyState 
            title={t('shop:cart.empty')}
            description={t('shop:cart.emptyDescription')}
            icon={<ShoppingBasket className="w-16 h-16 text-farm-wood/20" />}
            action={{ label: t('shop:cart.toShop'), onClick: () => navigate('/shop') }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-farm-green mb-2">{t('shop:cart.title')}</h1>
            <p className="text-farm-wood opacity-70">{t('shop:cart.itemsCount', { count: items.length })}</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-farm-green font-bold hover:underline">
            <ChevronLeft className="w-5 h-5" /> {t('shop:cart.continueShopping')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map(item => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center gap-6"
                >
                  <Link to={`/shop/${item.productId}`} className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                    <img src={item.image || undefined} alt={getLocalizedValue(item.name, language)} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/shop/${item.productId}`}>
                      <h3 className="font-bold text-lg text-farm-green hover:text-farm-berry transition-colors">{getLocalizedValue(item.name, language)}</h3>
                    </Link>
                    <p className="text-farm-wood font-bold mt-1">{formatPrice(item.price, currency, language)}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-farm-green/5 rounded-full p-1 px-4">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <span className="font-bold text-lg text-farm-green">{formatPrice(item.price * item.quantity, currency, language)}</span>
                  </div>

                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="p-3 text-farm-berry/40 hover:text-farm-berry hover:bg-farm-berry/10 rounded-full transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-farm-green text-white p-10 rounded-[3.5rem] shadow-xl sticky top-32">
              <h2 className="text-2xl font-bold mb-8">{t('shop:cart.summary')}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between opacity-80">
                  <span>{t('shop:cart.items')} ({count})</span>
                  <span>{formatPrice(total, currency, language)}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>{t('shop:cart.delivery')}</span>
                  <span className="text-xs uppercase tracking-widest font-bold">{t('shop:cart.deliveryCalculated')}</span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-lg opacity-80">{t('shop:cart.total')}</span>
                  <span className="text-4xl font-bold">{formatPrice(total, currency, language)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full bg-white text-farm-green hover:bg-farm-cream py-6 h-auto text-xl font-bold rounded-full group">
                  {t('shop:cart.checkout')} <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <p className="mt-8 text-center text-xs opacity-50 px-4 leading-relaxed">
                {t('shop:checkout.terms')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
