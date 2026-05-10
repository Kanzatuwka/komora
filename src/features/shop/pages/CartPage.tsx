import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/shared/contexts/CartContext';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Minus, Plus, Trash2, ShoppingBasket, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-farm-cream/30">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-32 pb-24 flex items-center justify-center">
          <EmptyState 
            title="Ваш кошик порожній"
            description="Схоже, ви ще нічого не додали. Завітайте до нашого магазину, щоб знайти щось смачненьке."
            icon={<ShoppingBasket className="w-16 h-16 text-farm-wood/20" />}
            action={{ label: 'До магазину', onClick: () => navigate('/shop') }}
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
            <h1 className="text-4xl font-bold text-farm-green mb-2">Кошик</h1>
            <p className="text-farm-wood opacity-70">{count} товарів у вашому списку</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-farm-green font-bold hover:underline">
            <ChevronLeft className="w-5 h-5" /> Продовжити покупки
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
                    <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1">
                    <Link to={`/shop/${item.productId}`}>
                      <h3 className="font-bold text-lg text-farm-green hover:text-farm-berry transition-colors">{item.name}</h3>
                    </Link>
                    <p className="text-farm-wood font-bold mt-1">{item.price} грн</p>
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
                    <span className="font-bold text-lg text-farm-green">{item.price * item.quantity} грн</span>
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
              <h2 className="text-2xl font-bold mb-8">Підсумок</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between opacity-80">
                  <span>Товари ({count})</span>
                  <span>{total} грн</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Доставка</span>
                  <span className="text-xs uppercase tracking-widest font-bold">Рахується далі</span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-lg opacity-80">Всього до сплати</span>
                  <span className="text-4xl font-bold">{total} грн</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full bg-white text-farm-green hover:bg-farm-cream py-6 h-auto text-xl font-bold rounded-full group">
                  Оформити <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <p className="mt-8 text-center text-xs opacity-50 px-4 leading-relaxed">
                Натискаючи на кнопку, ви погоджуєтесь з умовами обслуговування Комори.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
