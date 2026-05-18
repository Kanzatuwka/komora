import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategoryTags } from '../hooks/useShopData';
import { ProductCard } from '../components/ProductCard';
import { Navbar } from '@/shared/components/Navbar';
import { EmptyState } from '@/shared/components/EmptyState';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Footer } from '@/shared/components/Footer';
import { useTranslation } from 'react-i18next';

export default function ShopPage() {
  const { t } = useTranslation('shop');
  const [searchParams, setSearchParams] = useSearchParams();
  
  const CATEGORIES = [
    { id: 'all', name: t('categories.all') },
    { id: 'jam', name: t('categories.jam') },
    { id: 'sauce', name: t('categories.sauce') },
    { id: 'preserve', name: t('categories.preserve') },
  ];
  const category = searchParams.get('category') || 'all';
  const tag = searchParams.get('tag') || '';
  const sortBy = (searchParams.get('sort') as any) || 'newest';

  const { products, loading } = useProducts({ category, tag, sortBy });
  const allTags = useCategoryTags(category);

  const updateFilters = (updates: any) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value as string);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-24">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-farm-green mb-4">{t('title')}</h1>
            <p className="text-farm-wood opacity-70">{t('subtitle')}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white rounded-full p-1 border border-farm-wood/10 shadow-sm flex">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.id, tag: '' })}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    category === cat.id 
                      ? 'bg-farm-green text-white shadow-md' 
                      : 'text-farm-wood hover:bg-black/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <select 
              value={sortBy}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-white px-6 py-3 rounded-full border border-farm-wood/10 text-sm font-bold shadow-sm focus:outline-none focus:border-farm-green"
            >
              <option value="newest">{t('sort.newest')}</option>
              <option value="price-asc">{t('sort.priceAsc')}</option>
              <option value="price-desc">{t('sort.priceDesc')}</option>
            </select>
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
            <div className="flex items-center gap-2 text-farm-wood opacity-50 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">{t('filters.tags')}:</span>
            </div>
            <button
              onClick={() => updateFilters({ tag: '' })}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !tag ? 'bg-farm-wood text-white' : 'bg-white text-farm-wood border border-farm-wood/10'
              }`}
            >
              {t('filters.all')}
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => updateFilters({ tag: t })}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  tag === t ? 'bg-farm-wood text-white' : 'bg-white text-farm-wood border border-farm-wood/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-farm-wood/10 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState 
                title={t('empty.title')} 
                description={t('empty.description')}
                icon={<PackageX className="w-16 h-16 text-farm-wood/20" />}
                action={{ label: t('empty.action'), onClick: () => setSearchParams(new URLSearchParams()) }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
