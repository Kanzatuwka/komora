import { Link } from 'react-router-dom';
import { useFeaturedArticles } from '../hooks/useLandingData';
import { Button } from '@/shared/components/Button';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export function FeaturedArticles() {
  const { articles, loading } = useFeaturedArticles();

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-video bg-farm-wood/10 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-24 bg-farm-green/5 -mx-4 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-farm-green mb-4">Рецепти та новини</h2>
            <p className="text-farm-wood opacity-70">Цікаві історії та смачні ідеї від нашої сім'ї</p>
          </div>
          <Link to="/blog">
            <Button variant="outline" size="sm" className="hidden md:flex">Більше у блозі</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <Link to={`/blog/${article.id}`} className="block overflow-hidden h-64">
                <img 
                  src={article.imageUrl || 'https://images.unsplash.com/photo-1486328229947-3d120c0211a1?auto=format&fit=crop&q=80'} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex gap-2 mb-4">
                  {article.tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-farm-green/50 px-2 py-1 bg-farm-green/5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-farm-green mb-4 line-clamp-2 group-hover:text-farm-berry transition-colors">
                  {article.title}
                </h3>
                <p className="text-farm-wood opacity-70 text-sm line-clamp-3 mb-6 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-farm-wood/10">
                  <span className="text-xs text-farm-wood/50">
                    {article.createdAt && format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: uk })}
                  </span>
                  <Link to={`/blog/${article.id}`} className="text-sm font-bold text-farm-green overflow-hidden relative group/btn">
                    Читати далі
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-farm-green transition-all group-hover/btn:w-full" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Link to="/blog">
            <Button variant="outline" className="w-full">Більше у блозі</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
