import { useState } from 'react';
import { useArticles } from '../../blog/hooks/useBlogData';
import { db } from '@/shared/lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS, de } from 'date-fns/locale';
import { useToast } from '@/shared/contexts/ToastContext';
import { PageLoader } from '@/shared/components/Loader';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

export default function AdminBlogPage() {
  const { t, i18n } = useTranslation('admin');
  const { articles, loading } = useArticles({ count: 100 });
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const dateLocales: Record<string, any> = { uk, en: enUS, de };
  const currentLocale = dateLocales[i18n.language] || uk;

  const filteredArticles = articles.filter(a => {
    const title = typeof a.title === 'string' ? a.title : (a.title?.[i18n.language] || a.title?.uk || '');
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'articles', id), { featured: !current });
      showToast({ message: t('blogAdmin.toasts.statusChanged'), type: 'success' });
    } catch (err) {
      showToast({ message: t('blogAdmin.toasts.updateError'), type: 'error' });
    }
  };

  const deleteArticle = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, 'articles', id));
      showToast({ message: t('blogAdmin.toasts.deleted'), type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      showToast({ message: t('blogAdmin.toasts.deleteError'), type: 'error' });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('blogAdmin.title')}</h1>
          <p className="text-gray-500">{t('blogAdmin.subtitle')}</p>
        </div>
        <Link to="/admin/blog/new">
          <Button icon={<Plus className="w-5 h-5" />}>{t('blogAdmin.addNew')}</Button>
        </Link>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('blogAdmin.searchPlaceholder')} 
              className="w-full bg-gray-50 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/20 border border-transparent focus:border-farm-green/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('blogAdmin.table.article')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('blogAdmin.table.tags')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('blogAdmin.table.date')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('blogAdmin.table.status')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:blogAdmin.table.featured')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('blogAdmin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredArticles.map(article => (
                <tr key={article.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6 max-w-sm">
                    <div className="flex items-center gap-4">
                      <img src={article.imageUrl || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate mb-1">
                          {typeof article.title === 'string' ? article.title : (article.title?.[i18n.language] || article.title?.uk || 'Untitled')}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                          {typeof article.excerpt === 'string' ? article.excerpt : (article.excerpt?.[i18n.language] || article.excerpt?.uk || '')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.slice(0, 2).map((t: string) => (
                        <span key={t} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
                       <Calendar className="w-3 h-3" />
                       {article.createdAt && format(article.createdAt.toDate(), 'dd.MM.yy', { locale: currentLocale })}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {article.published ? (
                      <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t('blogAdmin.status.published')}</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{t('blogAdmin.status.draft')}</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleFeatured(article.id, article.featured)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        article.featured ? "bg-amber-50 text-amber-500" : "text-gray-300 hover:text-amber-500"
                      )}
                    >
                      <Star className={cn("w-5 h-5", article.featured && "fill-current")} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/blog/${article.id}`} target="_blank">
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                      <Link to={`/admin/blog/${article.id}`}>
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => deleteArticle(article.id)}
                        className={cn(
                          "p-2 transition-all",
                          confirmDeleteId === article.id 
                            ? "bg-red-500 text-white rounded-xl px-4 animate-pulse" 
                            : "text-gray-400 hover:text-farm-berry"
                        )}
                      >
                        {confirmDeleteId === article.id ? (
                          <span className="text-[10px] font-bold uppercase whitespace-nowrap">{t('blogAdmin.confirm')}</span>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
