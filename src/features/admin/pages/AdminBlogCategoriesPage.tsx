import { useState } from 'react';
import { db } from '@/shared/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useBlogCategories } from '../hooks/useAdminData';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { Plus, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';
import { motion, Reorder } from 'motion/react';
import { LocalizedField } from '@/features/admin/components/LocalizedField';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { pickLocale } from '@/shared/lib/i18nContent';

export default function AdminBlogCategoriesPage() {
  const { categories, loading } = useBlogCategories();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [newCategoryName, setNewCategoryName] = useState({ uk: '', en: '', de: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState({ uk: '', en: '', de: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.uk?.trim()) {
      showToast({ message: 'Назва (UA) обовʼязкова', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const slug = newCategoryName.uk
        .toLowerCase()
        .replace(/[^\w\sа-яієґ]/gi, '')
        .trim()
        .replace(/\s+/g, '-');

      await addDoc(collection(db, 'blogCategories'), {
        name: newCategoryName,
        slug,
        order: categories.length,
        createdAt: serverTimestamp()
      });
      setNewCategoryName({ uk: '', en: '', de: '' });
      showToast({ message: 'Категорію додано', type: 'success' });
    } catch (err) {
      showToast({ message: 'Помилка при додаванні', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingValue.uk?.trim()) {
      showToast({ message: 'Назва (UA) обовʼязкова', type: 'error' });
      return;
    }

    try {
      await updateDoc(doc(db, 'blogCategories', id), {
        name: editingValue
      });
      setEditingId(null);
      showToast({ message: 'Оновлено', type: 'success' });
    } catch (err) {
      showToast({ message: 'Помилка оновлення', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, 'blogCategories', id));
      showToast({ message: 'Видалено', type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      showToast({ message: 'Помилка видалення', type: 'error' });
    }
  };

  const handleReorder = async (newItems: any[]) => {
    // In a real app we would update all orders in Firestore
    // For simplicity here, we just use UI reordering but should sync to DB
    // Actually, let's sync to DB for better UX
    // To avoid too many writes, we could debounce or only update on end
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Категорії блогу</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <form onSubmit={handleCreate} className="space-y-4 mb-8">
          <LocalizedField
            label="Назва нової категорії"
            value={newCategoryName}
            onChange={(v) => setNewCategoryName(v as any)}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="rounded-2xl">
              <Plus className="w-5 h-5 mr-2" />
              Додати категорію
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Категорій ще не створено
            </div>
          ) : (
            categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-farm-green/10 hover:bg-white transition-all group"
              >
                <div className="text-gray-300">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  {editingId === category.id ? (
                    <div className="py-2">
                      <LocalizedField
                        label=""
                        value={editingValue}
                        onChange={(v) => setEditingValue(v as any)}
                      />
                    </div>
                  ) : (
                    <p className="font-bold text-gray-700">{pickLocale(category.name, language)}</p>
                  )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(category.id)}
                        className="p-2 text-farm-green hover:bg-farm-green/10 rounded-xl"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingValue(
                            typeof category.name === 'string'
                              ? { uk: category.name, en: '', de: '' }
                              : category.name || { uk: '', en: '', de: '' }
                          );
                        }}
                        className="p-2 text-gray-400 hover:text-farm-green hover:bg-farm-green/10 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`p-2 transition-all ${
                          confirmDeleteId === category.id 
                            ? "bg-red-500 text-white rounded-xl px-4 animate-pulse flex items-center gap-2" 
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                        }`}
                      >
                        {confirmDeleteId === category.id ? (
                          <span className="text-[10px] font-bold uppercase whitespace-nowrap">Підтвердити</span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
