import { useSearchParams, Link } from 'react-router-dom';
import { useArticles, useBlogCategories } from '../hooks/useBlogData';
import { Navbar } from '@/shared/components/Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { formatDate } from '@/shared/lib/format';
import { pickLocale } from '@/shared/lib/i18nContent';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation(['blog', 'common']);
  const { language } = useLanguage();
  const activeCategoryId = searchParams.get('category') || 'all';
  const { categories, loading: categoriesLoading } = useBlogCategories();
  const { articles, loading: articlesLoading } = useArticles({ categoryId: activeCategoryId });

  const setCategory = (id: string) => {
    if (id === 'all') searchParams.delete('category');
    else searchParams.set('category', id);
    setSearchParams(searchParams);
  };

  const allCategories = [{ id: 'all', name: t('blog:filter.all') }, ...categories.map(c => ({ ...c, name: pickLocale(c.name, language) }))];

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-farm-green mb-4">{t('blog:title')}</h1>
            <p className="text-farm-wood opacity-70">{t('blog:subtitle')}</p>
          </div>

          <div className="flex gap-2 bg-white rounded-full p-1 border border-farm-wood/10 shadow-sm overflow-x-auto no-scrollbar">
            {categoriesLoading ? (
              <div className="w-64 h-10 bg-farm-wood/10 animate-pulse rounded-full" />
            ) : (
              allCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeCategoryId === cat.id 
                      ? 'bg-farm-green text-white shadow-md' 
                      : 'text-farm-wood hover:bg-black/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {articlesLoading ? (
            <div key="loading" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] bg-farm-wood/10 animate-pulse rounded-[2.5rem]" />
              ))}
            </div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                    <Link to={`/blog/${article.id}`} className="block h-56 overflow-hidden">
                    <img 
                      src={article.imageUrl || 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&q=80'} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-4">
                      {article.categoryId && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 bg-farm-green rounded-md">
                          {categories.find(c => c.id === article.categoryId) ? pickLocale(categories.find(c => c.id === article.categoryId)?.name, language) : t('common:blog')}
                        </span>
                      )}
                      {article.tags?.slice(0, 1).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-farm-green/50 px-2 py-1 bg-farm-green/5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-farm-green mb-4 line-clamp-2 group-hover:text-farm-berry transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-farm-wood opacity-70 text-sm line-clamp-3 mb-6 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-farm-wood/10">
                      <span className="text-xs text-farm-wood/50">
                        {article.createdAt && formatDate(article.createdAt, language)}
                      </span>
                      <Link to={`/blog/${article.id}`} className="text-sm font-bold text-farm-green overflow-hidden relative group/btn">
                        {t('blog:card.readMore')}
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green transition-all group-hover/btn:w-full" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
