import { useState } from 'react';
import { useProducts } from '../../shop/hooks/useShopData';
import { db } from '@/shared/lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Star,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useToast } from '@/shared/contexts/ToastContext';
import { PageLoader } from '@/shared/components/Loader';
import { cn } from '@/shared/lib/utils';

export default function AdminProductsPage() {
  const { t, i18n } = useTranslation(['admin', 'shop']);
  const [filters, setFilters] = useState({ category: 'all', sortBy: 'newest' as const });
  const { products, loading } = useProducts(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const name = typeof p.name === 'string' ? p.name : (p.name?.[i18n.language] || p.name?.uk || '');
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'products', id), { featured: !current });
      showToast({ message: t('admin:products.toasts.featuredToggled'), type: 'success' });
    } catch (err) {
      showToast({ message: t('admin:products.toasts.genericError'), type: 'error' });
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', id));
      showToast({ message: t('admin:products.toasts.deleted'), type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      showToast({ message: t('admin:products.toasts.deleteError'), type: 'error' });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin:products.title')}</h1>
          <p className="text-gray-500">{t('admin:products.subtitle')}</p>
        </div>
        <Link to="/admin/products/new">
          <Button icon={<Plus className="w-5 h-5" />}>{t('admin:products.addNew')}</Button>
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
              placeholder={t('admin:products.searchPlaceholder')} 
              className="w-full bg-gray-50 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/20 border border-transparent focus:border-farm-green/20"
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="bg-gray-50 px-6 py-3 rounded-full text-sm font-bold border border-transparent focus:border-farm-green/20 focus:outline-none"
            >
              <option value="all">{t('shop:categories.all')}</option>
              <option value="jam">{t('shop:categories.jam')}</option>
              <option value="sauce">{t('shop:categories.sauce')}</option>
              <option value="preserve">{t('shop:categories.preserve')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:products.table.product')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:products.table.category')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:products.table.price')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:products.table.stock')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin:products.table.featured')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('admin:products.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={product.images?.[0] || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div>
                        <p className="font-bold text-gray-900 leading-none mb-1">
                          {typeof product.name === 'string' ? product.name : (product.name?.[i18n.language] || product.name?.uk || 'Noname')}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: {product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold capitalize">
                      {t('shop:categories.' + product.category)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">
                      {typeof product.price === 'number' ? product.price : (product.price?.[i18n.language === 'uk' ? 'UAH' : i18n.language === 'en' ? 'USD' : 'EUR'] || product.price?.UAH || 0)} {i18n.language === 'uk' ? '₴' : i18n.language === 'en' ? '$' : '€'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {product.inStock ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> {t('admin:products.stock.available')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold font-italic">
                        <XCircle className="w-4 h-4" /> {t('admin:products.stock.unavailable')}
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleFeatured(product.id, product.featured)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        product.featured ? "bg-amber-50 text-amber-500" : "text-gray-300 hover:text-amber-500"
                      )}
                    >
                      <Star className={cn("w-5 h-5", product.featured && "fill-current")} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/shop/${product.id}`} target="_blank">
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                      <Link to={`/admin/products/${product.id}`}>
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className={cn(
                          "p-2 transition-all",
                          confirmDeleteId === product.id 
                            ? "bg-red-500 text-white rounded-xl px-4 animate-pulse" 
                            : "text-gray-400 hover:text-farm-berry"
                        )}
                      >
                        {confirmDeleteId === product.id ? (
                          <span className="text-[10px] font-bold uppercase whitespace-nowrap">{t('admin:blogAdmin.confirm')}</span>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">
                    {t('admin:search.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
