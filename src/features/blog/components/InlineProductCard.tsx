import { Link, useNavigate } from 'react-router-dom';
import { useProduct } from '../../shop/hooks/useShopData';
import { Button } from '@/shared/components/Button';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { formatPrice } from '@/shared/lib/format';
import { pickLocale } from '@/shared/lib/i18nContent';

interface InlineProductCardProps {
  productId: string;
}

export function InlineProductCard({ productId }: InlineProductCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(['shop', 'common']);
  const { language } = useLanguage();
  const { currency: currentCurrency } = useCurrency();
  const { product, loading } = useProduct(productId);
  const { addItem, cartCurrency } = useCart();
  const currency = cartCurrency || currentCurrency;
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  if (loading) {
    return (
      <div className="my-8 bg-farm-cream/30 border border-farm-wood/10 rounded-3xl p-6 flex items-center justify-center h-32 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-farm-green/30" />
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product, 1);
    const productName = pickLocale(product.name, language);
    showToast({ 
      message: t('shop:product.addedToCart', { name: productName }), 
      type: 'success',
      action: {
        label: t('shop:product.viewCart'),
        onClick: () => navigate('/cart')
      }
    });
    setTimeout(() => setAdding(false), 1500);
  };

  return (
    <div className="my-8 bg-farm-cream/30 border border-farm-wood/10 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 group transition-all hover:shadow-lg hover:bg-farm-cream/50">
      <div className="w-full sm:w-1/3 aspect-square rounded-3xl overflow-hidden shadow-md">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1558236714-d1ae4c311689?auto=format&fit=crop&q=80'} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          alt={pickLocale(product.name, language)} 
        />
      </div>
      
      <div className="flex-1 text-center sm:text-left">
        <h3 className="text-xl font-bold text-farm-green mb-2">{pickLocale(product.name, language)}</h3>
        <p className="text-2xl font-bold text-farm-berry mb-6">{formatPrice(product.price, currency, language)}</p>
        
        <div className="flex flex-col xs:flex-row gap-3">
          <Link to={`/shop/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl flex items-center justify-center gap-2">
              {t('shop:cart.toShop')} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            onClick={handleAddToCart}
            disabled={adding || !product.inStock}
            className="flex-1 rounded-2xl flex items-center justify-center gap-2"
          >
            {adding ? (
              <>✓ {t('shop:product.added')}</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> 
                {product.inStock ? t('shop:product.addToCart') : t('shop:product.outOfStock')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
