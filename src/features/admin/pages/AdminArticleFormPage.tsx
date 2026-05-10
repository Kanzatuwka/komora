import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '@/shared/lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { ChevronLeft, Upload, Image as ImageIcon, Search } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';
import { RichTextEditor } from '../components/RichTextEditor';
import { useProducts } from '../../shop/hooks/useShopData';
import { useBlogCategories } from '../hooks/useAdminData';

export default function AdminArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    body: '',
    imageUrl: '',
    categoryId: '',
    tags: [] as string[],
    linkedProductIds: [] as string[],
    published: false,
    featured: false
  });

  const { products } = useProducts({ category: 'all' });
  const { categories } = useBlogCategories();

  useEffect(() => {
    if (isEdit) {
      getDoc(doc(db, 'articles', id)).then(snap => {
        if (snap.exists()) {
          setFormData({ ...snap.data() as any });
        }
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const storageRef = ref(storage, `blog/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      showToast({ message: 'Обкладинку завантажено', type: 'success' });
    } catch (err) {
      showToast({ message: 'Помилка завантаження', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      let articleId = id || '';

      if (isEdit && id) {
        batch.set(doc(db, 'articles', id), data, { merge: true });
      } else {
        const newArticleRef = doc(collection(db, 'articles'));
        articleId = newArticleRef.id;
        batch.set(newArticleRef, {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      // Bidirectional linking
      const oldDoc = isEdit && id ? await getDoc(doc(db, 'articles', id)) : null;
      const oldProductIds = oldDoc?.exists() ? (oldDoc.data().linkedProductIds || []) as string[] : [];
      const newProductIds = formData.linkedProductIds;

      const added = newProductIds.filter(x => !oldProductIds.includes(x));
      const removed = oldProductIds.filter(x => !newProductIds.includes(x));

      added.forEach(productId => {
        batch.update(doc(db, 'products', productId), {
          linkedArticleIds: arrayUnion(articleId)
        });
      });

      removed.forEach(productId => {
        batch.update(doc(db, 'products', productId), {
          linkedArticleIds: arrayRemove(articleId)
        });
      });

      await batch.commit();

      showToast({ message: isEdit ? 'Оновлено' : 'Створено', type: 'success' });
      navigate('/admin/blog');
    } catch (err) {
      showToast({ message: 'Помилка збереження', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/blog')}
          className="flex items-center gap-2 text-gray-500 hover:text-farm-green transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> До списку статей
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Редагування статті' : 'Нова стаття'}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Заголовок статті</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-4xl font-bold border-none focus:ring-0 placeholder:text-gray-100 p-0"
                placeholder="Введіть заголовок..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Короткий опис</label>
              <textarea
                rows={3}
                required
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-8 py-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white transition-all text-gray-600 leading-relaxed italic"
                placeholder="Короткий анонс статті..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Текст статті</label>
              <RichTextEditor 
                content={formData.body} 
                onChange={body => setFormData({ ...formData, body })} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">Обкладинка</p>
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-100 relative group">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl || undefined} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 gap-2 text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] font-bold">Немає фото</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="bg-white text-farm-green px-4 py-2 rounded-xl text-xs font-bold">Змінити</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-2">Категорія</p>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 text-sm font-bold"
                >
                  <option value="">Без категорії</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
                <span className="font-bold text-sm text-gray-900">Опублікувати</span>
                <input 
                  type="checkbox" 
                  checked={formData.published} 
                  onChange={e => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 accent-farm-green rounded-lg"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
                <span className="font-bold text-sm text-gray-900">Популярне</span>
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 accent-farm-green rounded-lg"
                />
              </label>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">Товари у рецепті</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {products.map(product => (
                  <label key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-farm-green/5">
                    <input 
                      type="checkbox"
                      checked={formData.linkedProductIds.includes(product.id)}
                      onChange={e => {
                        const ids = e.target.checked 
                          ? [...formData.linkedProductIds, product.id]
                          : formData.linkedProductIds.filter(id => id !== product.id);
                        setFormData({ ...formData, linkedProductIds: ids });
                      }}
                      className="accent-farm-green"
                    />
                    <span className="text-xs font-medium truncate">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-farm-green p-8 rounded-[2.5rem] shadow-xl text-white">
            <Button 
              type="submit" 
              className="w-full bg-white text-farm-green hover:bg-farm-cream border-none mb-4"
              disabled={saving}
            >
              {saving ? 'Зберігання...' : 'Зберегти статтю'}
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full text-white/50 hover:text-white"
              onClick={() => navigate('/admin/blog')}
            >
              Скасувати
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
