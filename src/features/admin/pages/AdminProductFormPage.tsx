import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '@/shared/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
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

import { ImageUploader } from '../components/ImageUploader';

const CATEGORIES = [
  { id: 'jam', name: 'Варення' },
  { id: 'sauce', name: 'Соуси' },
  { id: 'preserve', name: 'Консерви' },
];

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'jam',
    price: 0,
    description: '',
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
          setFormData({ ...snap.data() as any });
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
    setSaving(true);

    try {
      const data = {
        ...formData,
        price: Number(formData.price),
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

      // Bidirectional linking
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

      showToast({ message: isEdit ? 'Оновлено' : 'Створено', type: 'success' });
      navigate('/admin/products');
    } catch (err) {
      showToast({ message: 'Помилка збереження', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-farm-green transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> До списку товарів
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Редагування товару' : 'Новий товар'}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Назва товару</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all"
                placeholder="Введіть назву..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Категорія</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Ціна (грн)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-6 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-4">Опис</label>
              <textarea
                rows={6}
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 rounded-[2rem] bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all resize-none"
                placeholder="Детальний опис товару..."
              />
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-farm-green" /> Фотографії
            </h2>
            <ImageUploader 
              images={formData.images}
              onChange={images => setFormData({ ...formData, images })}
              folder="products"
            />
            <p className="text-xs text-gray-400 font-medium mt-6">Рекомендовано: квадратні зображення до 5MB. Перетягніть для зміни порядку.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Налаштування</h2>
            
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
              <div>
                <p className="font-bold text-sm text-gray-900">Є в наявності</p>
                <p className="text-[10px] text-gray-400">Показувати в магазині</p>
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
                <p className="font-bold text-sm text-gray-900">Популярне</p>
                <p className="text-[10px] text-gray-400">Виводити на головну</p>
              </div>
              <input 
                type="checkbox" 
                checked={formData.featured} 
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 accent-farm-green rounded-lg"
              />
            </label>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">Пов'язані статті</p>
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
                    <span className="text-xs font-medium truncate">{article.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-farm-green p-8 rounded-[2.5rem] shadow-xl text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-8">Дії</p>
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-white text-farm-green hover:bg-farm-cream border-none"
                disabled={saving}
              >
                {saving ? 'Зберігання...' : 'Зберегти зміни'}
              </Button>
              <Button 
                type="button"
                variant="ghost" 
                className="w-full text-white/50 hover:text-white"
                onClick={() => navigate('/admin/products')}
              >
                Скасувати
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
