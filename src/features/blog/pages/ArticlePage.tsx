import { useParams, Link } from 'react-router-dom';
import { useArticle, useLinkedProducts, useBlogCategories } from '../hooks/useBlogData';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { ChevronLeft, Calendar, Tag, Share2, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import { ArticleBody } from '../components/ArticleBody';
import { motion } from 'motion/react';

export default function ArticlePage() {
  const { id } = useParams();
  const { article, loading } = useArticle(id || '');
  const { categories, loading: categoriesLoading } = useBlogCategories();
  const { products, loading: productsLoading } = useLinkedProducts(article?.linkedProductIds || []);

  if (loading || categoriesLoading) return <PageLoader />;
  if (!article) return <div className="p-24 text-center">Статтю не знайдено</div>;

  const sanitizedBody = DOMPurify.sanitize(article.body);
  const category = categories.find(c => c.id === article.categoryId);

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
        <Link to="/blog" className="flex items-center gap-2 text-farm-wood hover:text-farm-green transition-colors mb-12">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">До всіх статей</span>
        </Link>

        <article>
          <div className="mb-12">
            <div className="flex flex-wrap gap-4 items-center mb-6">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-farm-wood/50">
                <Calendar className="w-4 h-4" />
                {article.createdAt && format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: uk })}
              </span>
              {category && (
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-farm-green text-white px-3 py-1 rounded-full">
                  <Folder className="w-3 h-3" />
                  {category.name}
                </span>
              )}
              <div className="flex gap-2">
                {article.tags?.map((t: string) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-farm-green/5 text-farm-green px-2 py-1 rounded">
                    <Tag className="w-3 h-3" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-farm-green leading-tight mb-8">
              {article.title}
            </h1>
            <p className="text-xl text-farm-wood opacity-70 leading-relaxed italic border-l-4 border-farm-berry pl-6">
              {article.excerpt}
            </p>
          </div>

          <div className="aspect-video w-full rounded-[3rem] overflow-hidden mb-16 shadow-xl relative">
            <img 
              src={article.imageUrl || 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&q=80'} 
              className="w-full h-full object-cover" 
              alt="" 
            />
          </div>

          {/* Article Content */}
          <ArticleBody content={article.body} />

          {/* Linked Products */}
          {!productsLoading && products.length > 0 && (
            <section className="bg-farm-green p-12 rounded-[3.5rem] text-white">
              <h2 className="text-2xl font-bold mb-8">Спробуйте інгредієнти з нашої комори</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <Link 
                    key={product.id} 
                    to={`/shop/${product.id}`}
                    className="flex bg-white/10 hover:bg-white/20 p-4 rounded-3xl transition-all group"
                  >
                    <img src={product.images?.[0] || undefined} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-lg group-hover:text-farm-cream transition-colors">{product.name}</p>
                      <p className="text-farm-cream/60 text-sm">{product.price} грн</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Share */}
          <div className="mt-24 pt-12 border-t border-farm-wood/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-farm-wood">Поділитися:</span>
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-farm-cream transition-colors">
                <Share2 className="w-5 h-5 text-farm-green" />
              </button>
            </div>
            <Link to="/blog">
              <Button variant="outline">Усі статті</Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
