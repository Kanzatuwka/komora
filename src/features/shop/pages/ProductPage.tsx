import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useLinkedArticles } from '../hooks/useShopData';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { ChevronLeft, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id || '');
  const { articles, loading: articlesLoading } = useLinkedArticles(product?.linkedArticleIds || []);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (loading) return <PageLoader />;
  if (!product) return <div className="p-24 text-center">Товар не знайдено</div>;

  const handleAdd = () => {
    addItem(product, quantity);
    setIsAdded(true);
    showToast({ 
      message: `${product.name} додано до кошика`, 
      type: 'success',
      action: { label: 'До кошика', onClick: () => navigate('/cart') }
    });
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-farm-wood hover:text-farm-green transition-colors mb-12"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Назад</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square bg-white rounded-[3rem] overflow-hidden shadow-sm">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images?.[activeImage] || 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                      activeImage === i ? 'border-farm-green scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img || undefined} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white p-12 rounded-[3.5rem] shadow-sm">
            <div className="flex gap-2 mb-6">
              <span className="bg-farm-green/5 text-farm-green px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              {product.featured && (
                <span className="bg-farm-berry/5 text-farm-berry px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Популярне
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-farm-green mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-farm-green mb-8">{product.price} грн</p>
            
            <div className="prose prose-stone mb-12 text-farm-wood/80 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center pt-8 border-t border-farm-wood/10">
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-6 bg-farm-green/5 rounded-full p-2 w-full sm:w-auto px-6">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-farm-cream transition-colors shadow-sm"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-xl w-6 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-white hover:bg-farm-cream transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleAdd}
                    size="lg"
                    className="flex-1 w-full relative h-[64px]"
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
                          <Check className="w-6 h-6" /> Додано до кошика
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="add"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="w-6 h-6" /> До кошика
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </>
              ) : (
                <div className="w-full bg-farm-berry/10 text-farm-berry p-4 rounded-2xl text-center font-bold">
                  Тимчасово немає в наявності
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linked Articles */}
        <AnimatePresence>
          {!articlesLoading && articles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-24 pt-24 border-t border-farm-wood/10"
            >
              <h2 className="text-3xl font-bold text-farm-green mb-12">Рецепти з цим продуктом</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {articles.map(article => (
                  <Link 
                    key={article.id} 
                    to={`/blog/${article.id}`}
                    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={article.imageUrl || undefined} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        alt="" 
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-farm-green group-hover:text-farm-berry transition-colors">{article.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
