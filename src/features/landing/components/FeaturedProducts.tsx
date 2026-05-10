import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useLandingData';
import { Button } from '@/shared/components/Button';
import { motion } from 'motion/react';

export function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-farm-wood/10 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold text-farm-green mb-4">Наші продукти</h2>
          <p className="text-farm-wood opacity-70">Найкраще з нашої комори, зроблене з любов'ю</p>
        </div>
        <Link to="/shop">
          <Button variant="outline" size="sm" className="hidden md:flex">Всі продукти</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <Link to={`/shop/${product.id}`} className="block">
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1558236714-d1ae4c311689?auto=format&fit=crop&q=80'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white/90 text-farm-berry text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Немає в наявності</span>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg text-farm-green group-hover:text-farm-berry transition-colors">{product.name}</h3>
              <p className="text-farm-wood font-medium">{product.price} грн</p>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 text-center md:hidden">
        <Link to="/shop">
          <Button variant="outline" className="w-full">Всі продукти</Button>
        </Link>
      </div>
    </section>
  );
}
