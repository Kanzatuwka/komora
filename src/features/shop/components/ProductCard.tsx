import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { Button } from '@/shared/components/Button';
import { Check, ShoppingCart, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setIsAdded(true);
    showToast({ 
      message: `${product.name} додано до кошика`, 
      type: 'success',
      action: { label: 'Переглянути', onClick: () => window.location.href = '/cart' }
    });
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="bg-white p-4 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <Link to={`/shop/${product.id}`} className="block relative aspect-square rounded-[2rem] overflow-hidden mb-6">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-farm-berry text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Немає в наявності</span>
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col px-2">
        <Link to={`/shop/${product.id}`}>
          <h3 className="text-xl font-bold text-farm-green mb-1 group-hover:text-farm-berry transition-colors">{product.name}</h3>
        </Link>
        <p className="text-farm-wood/50 text-sm mb-4 line-clamp-1">{product.category}</p>
        
        <div className="mt-auto flex items-center justify-between mb-6">
          <span className="text-2xl font-bold text-farm-green">{product.price} грн</span>
          
          {product.inStock && (
            <div className="flex items-center gap-3 bg-farm-green/5 rounded-full p-1">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-4 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <Button 
          onClick={handleAdd}
          disabled={!product.inStock}
          className="w-full relative overflow-hidden"
          variant={isAdded ? 'secondary' : 'primary'}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.span 
                key="added"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5" /> Додано
              </motion.span>
            ) : (
              <motion.span 
                key="add"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" /> До кошика
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
}
