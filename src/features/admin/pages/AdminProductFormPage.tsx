import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '@/shared/lib/firebase';
import { doc, getDoc, setDoc, collection, serverTimestamp, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Upload, 
  X, 
  Plus, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';
import { cn } from '@/shared/lib/utils';
import { useArticles } from '../../blog/hooks/useBlogData';
import { LocalizedField } from '../components/LocalizedField';
import { ImageUploader } from '../components/ImageUploader';

export default function AdminProductFormPage() {
  const { t, i18n } = useTranslation(['admin', 'shop']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const CATEGORIES = [
    { id: 'jam', name: t('shop:categories.jam') },
    { id: 'sauce', name: t('shop:categories.sauce') },
    { id: 'preserve', name: t('shop:categories.preserve') },
  ];

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: { uk: '', en: '', de: '' } as Record<string, string>,
    category: 'jam',
    price: { UAH: 0, EUR: 0, USD: 0 } as Record<string, number>,
    description: { uk: '', en: '', de: '' } as Record<string, string>,
    images: [] as string[],
    inStock: true,
    featured: false,
    tags: [] as string[],
    linkedArticleIds: [] as string[]
  });

  const { articles } = useArticles({ count: 100 });

  useEffect(() => {
    if (isEdit) {
      getDoc(doc(db, 'products', id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          const normalized = {
            ...data,
            name: typeof data.name === 'string'
              ? { uk: data.name, en: '', de: '' }
              : data.name || { uk: '', en: '', de: '' },
            description: typeof data.description === 'string'
              ? { uk: data.description, en: '', de: '' }
              : data.description || { uk: '', en: '', de: '' },
            price: typeof data.price === 'number'
              ? { UAH: data.price, EUR: 0, USD: 0 }
              : data.price || { UAH: 0, EUR: 0, USD: 0 },
          } as any;
          setFormData(normalized);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.uk?.trim() || !formData.description.uk?.trim() || (formData.price.UAH || 0) <= 0) {
      showToast({ message: t('admin:productForm.toasts.requiredFields'), type: 'error' });
      return;
    }

    setSaving(true);

    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      let productId = id || '';

      if (isEdit && id) {
        batch.set(doc(db, 'products', id), data, { merge: true });
      } else {
        const newProductRef = doc(collection(db, 'products'));
        productId = newProductRef.id;
        batch.set(newProductRef, {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      // Bidirectional linking logic (unchanged essentially, just uses raw data from snap)
      const oldDoc = isEdit && id ? await getDoc(doc(db, 'products', id)) : null;
      const oldArticleIds = oldDoc?.exists() ? (oldDoc.data().linkedArticleIds || []) as string[] : [];
      const newArticleIds = formData.linkedArticleIds;

      const added = newArticleIds.filter(x => !oldArticleIds.includes(x));
      const removed = oldArticleIds.filter(x => !newArticleIds.includes(x));

      added.forEach(articleId => {
        batch.update(doc(db, 'articles', articleId), {
          linkedProductIds: arrayUnion(productId)
        });
      });

      removed.forEach(articleId => {
        batch.update(doc(db, 'articles', articleId), {
          linkedProductIds: arrayRemove(productId)
        });
      });

      await batch.commit();

      showToast({ message: t('admin:productForm.toasts.saved'), type: 'success' });
      navigate('/admin/products');
    } catch (err) {
      showToast({ message: t('admin:productForm.toasts.saveError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-farm-green transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> {t('admin:productForm.backToList')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('admin:productForm.editTitle') : t('admin:productForm.newTitle')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
            <LocalizedField
              label={t('admin:productForm.nameLabel')}
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              required
            />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">{t('admin:productForm.categoryLabel')}</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all outline-none"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">{t('admin:productForm.priceLabel')} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">UAH</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price.UAH}
                    onChange={(e) => setFormData({ ...formData, price: { ...formData.price, UAH: parseFloat(e.target.value) || 0 } })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">EUR</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price.EUR}
                    onChange={(e) => setFormData({ ...formData, price: { ...formData.price, EUR: parseFloat(e.target.value) || 0 } })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">USD</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price.USD}
                    onChange={(e) => setFormData({ ...formData, price: { ...formData.price, USD: parseFloat(e.target.value) || 0 } })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
            </div>

            <LocalizedField
              label={t('admin:productForm.descriptionLabel')}
              type="textarea"
              value={formData.description}
              onChange={(v) => setFormData({ ...formData, description: v })}
              required
            />
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-farm-green" /> {t('admin:articleForm.coverHeader')}
            </h2>
            <ImageUploader 
              images={formData.images}
              onChange={images => setFormData({ ...formData, images })}
              folder="products"
            />
            <p className="text-xs text-gray-400 font-medium mt-6">{t('admin:productForm.toasts.imageRecommendation')}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">{t('admin:productForm.settings')}</h2>
            
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
              <div>
                <p className="font-bold text-sm text-gray-900">{t('admin:productForm.inStock')}</p>
                <p className="text-[10px] text-gray-400">{t('admin:productForm.inStockHelp')}</p>
              </div>
              <input 
                type="checkbox" 
                checked={formData.inStock} 
                onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 accent-farm-green rounded-lg"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
              <div>
                <p className="font-bold text-sm text-gray-900">{t('admin:productForm.featured')}</p>
                <p className="text-[10px] text-gray-400">{t('admin:productForm.featuredHelp')}</p>
              </div>
              <input 
                type="checkbox" 
                checked={formData.featured} 
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 accent-farm-green rounded-lg"
              />
            </label>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">{t('admin:productForm.linkedArticles')}</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {articles.map(article => (
                  <label key={article.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-farm-green/5">
                    <input 
                      type="checkbox"
                      checked={formData.linkedArticleIds.includes(article.id)}
                      onChange={e => {
                        const ids = e.target.checked 
                          ? [...formData.linkedArticleIds, article.id]
                          : formData.linkedArticleIds.filter(id => id !== article.id);
                        setFormData({ ...formData, linkedArticleIds: ids });
                      }}
                      className="accent-farm-green"
                    />
                    <span className="text-xs font-medium truncate">
                      {typeof article.title === 'string' ? article.title : (article.title?.[i18n.language] || article.title?.uk || 'Untitled')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-farm-green p-8 rounded-[2.5rem] shadow-xl text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-8">{t('admin:orders.table.actions')}</p>
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-white text-farm-green hover:bg-farm-cream border-none"
                disabled={saving}
              >
                {saving ? t('admin:productForm.saving') : t('admin:productForm.save')}
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full text-white/50 hover:text-white"
                onClick={() => navigate('/admin/products')}
              >
                {t('admin:productForm.cancel')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
