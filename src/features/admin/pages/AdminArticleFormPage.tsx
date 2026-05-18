import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '@/shared/lib/firebase';
import { doc, getDoc, collection, serverTimestamp, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Upload, 
  Image as ImageIcon, 
  Search,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/shared/contexts/ToastContext';
import { Modal } from '@/shared/components/Modal';
import { useProducts } from '../../shop/hooks/useShopData';
import { useBlogCategories } from '../hooks/useAdminData';
import { SUPPORTED_LANGUAGES, Language } from '@/i18n/config';
import { LocalizedField } from '../components/LocalizedField';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { pickLocale } from '@/shared/lib/i18nContent';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ProductMention } from '../components/ProductMention';
import { cn } from '@/shared/lib/utils';

function EditorToolbar({ editor, onInsertProduct, onUploadImage, t }: { editor: any, onInsertProduct: () => void, onUploadImage: () => void, t: any }) {
  if (!editor) return null;

  const MenuButton = ({ onClick, isActive, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg transition-colors hover:bg-gray-100",
        isActive ? "bg-farm-green text-white hover:bg-farm-green" : "text-gray-500"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-100 mb-2 rounded-t-2xl">
      <MenuButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="w-4 h-4" />
      </MenuButton>
      <MenuButton 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="w-4 h-4" />
      </MenuButton>
      <div className="w-px h-6 bg-gray-100 mx-1" />
      <MenuButton 
        onClick={() => editor.chain().focus().toggleBold().run()} 
        isActive={editor.isActive('bold')}
      >
        <Bold className="w-4 h-4" />
      </MenuButton>
      <MenuButton 
        onClick={() => editor.chain().focus().toggleItalic().run()} 
        isActive={editor.isActive('italic')}
      >
        <Italic className="w-4 h-4" />
      </MenuButton>
      <MenuButton 
        onClick={() => editor.chain().focus().toggleUnderline().run()} 
        isActive={editor.isActive('underline')}
      >
        <UnderlineIcon className="w-4 h-4" />
      </MenuButton>
      <div className="w-px h-6 bg-gray-100 mx-1" />
      <MenuButton 
        onClick={() => editor.chain().focus().toggleBulletList().run()} 
        isActive={editor.isActive('bulletList')}
      >
        <List className="w-4 h-4" />
      </MenuButton>
      <MenuButton 
        onClick={() => editor.chain().focus().toggleOrderedList().run()} 
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </MenuButton>
      <MenuButton 
        onClick={() => editor.chain().focus().toggleBlockquote().run()} 
        isActive={editor.isActive('blockquote')}
      >
        <Quote className="w-4 h-4" />
      </MenuButton>
      <div className="w-px h-6 bg-gray-100 mx-1" />
      <MenuButton onClick={onUploadImage}>
        <ImageIcon className="w-4 h-4" />
      </MenuButton>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onInsertProduct}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-farm-green hover:bg-farm-green/5 transition-colors"
      >
        <Sparkles className="w-4 h-4" /> {t('admin:articleForm.insertProduct')}
      </button>
    </div>
  );
}

export default function AdminArticleFormPage() {
  const { t, i18n } = useTranslation(['admin', 'shop']);
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedSearchTerm, setLinkedSearchTerm] = useState('');
  const [bodyActiveTab, setBodyActiveTab] = useState<Language>('uk');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isLinkedPickerOpen, setIsLinkedPickerOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: { uk: '', en: '', de: '' },
    excerpt: { uk: '', en: '', de: '' },
    body: { uk: '', en: '', de: '' },
    imageUrl: '',
    categoryId: '',
    tags: [] as string[],
    linkedProductIds: [] as string[],
    published: false,
    featured: false
  });

  const editorUk = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), Image, ProductMention],
    content: formData.body.uk,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, body: { ...prev.body, uk: editor.getHTML() } }));
    },
  });

  const editorEn = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), Image, ProductMention],
    content: formData.body.en,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, body: { ...prev.body, en: editor.getHTML() } }));
    },
  });

  const editorDe = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false }), Image, ProductMention],
    content: formData.body.de,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, body: { ...prev.body, de: editor.getHTML() } }));
    },
  });

  const editors: Record<Language, any> = {
    uk: editorUk,
    en: editorEn,
    de: editorDe
  };

  const activeEditor = editors[bodyActiveTab];

  const { products } = useProducts({ category: 'all' });
  const { categories } = useBlogCategories();

  const linkedProducts = useMemo(() => {
    return products.filter(p => formData.linkedProductIds.includes(p.id));
  }, [products, formData.linkedProductIds]);

  const unlinkedProducts = useMemo(() => {
    return products.filter(p => !formData.linkedProductIds.includes(p.id));
  }, [products, formData.linkedProductIds]);

  useEffect(() => {
    if (isEdit) {
      getDoc(doc(db, 'articles', id)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          const normalized = {
            ...data,
            title: typeof data.title === 'string'
              ? { uk: data.title, en: '', de: '' }
              : data.title || { uk: '', en: '', de: '' },
            excerpt: typeof data.excerpt === 'string'
              ? { uk: data.excerpt, en: '', de: '' }
              : data.excerpt || { uk: '', en: '', de: '' },
            body: typeof data.body === 'string'
              ? { uk: data.body, en: '', de: '' }
              : data.body || { uk: '', en: '', de: '' },
          } as any;
          setFormData(normalized);
          
          // Set editor contents
          setTimeout(() => {
            if (editorUk) editorUk.commands.setContent(normalized.body.uk || '');
            if (editorEn) editorEn.commands.setContent(normalized.body.en || '');
            if (editorDe) editorDe.commands.setContent(normalized.body.de || '');
          }, 0);
        }
        setLoading(false);
      });
    }
  }, [id, isEdit, editorUk, editorEn, editorDe]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const storageRef = ref(storage, `blog/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      showToast({ message: t('admin:articleForm.toasts.coverUploaded'), type: 'success' });
    } catch (err) {
      showToast({ message: t('admin:articleForm.toasts.uploadError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file || !activeEditor) return;

      setSaving(true);
      try {
        const storageRef = ref(storage, `blog-content/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        activeEditor.chain().focus().setImage({ src: url }).run();
        showToast({ message: t('admin:articleForm.toasts.coverUploaded', { defaultValue: 'Зображення вставлено' }), type: 'success' });
      } catch (err) {
        showToast({ message: t('admin:articleForm.toasts.uploadError'), type: 'error' });
      } finally {
        setSaving(false);
      }
    };
    input.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.uk?.trim() || !formData.excerpt.uk?.trim() || !formData.body.uk?.trim() || formData.body.uk === '<p></p>') {
      showToast({ message: t('admin:articleForm.toasts.requiredFields'), type: 'error' });
      return;
    }

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

      showToast({ message: isEdit ? t('admin:productForm.toasts.saved') : t('admin:productForm.toasts.saved'), type: 'success' });
      navigate('/admin/blog');
    } catch (err) {
      showToast({ message: t('admin:productForm.toasts.saveError'), type: 'error' });
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
          <ChevronLeft className="w-5 h-5" /> {t('admin:articleForm.backToList')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('admin:articleForm.editTitle') : t('admin:articleForm.newTitle')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
            <LocalizedField
              label={t('admin:articleForm.titleLabel')}
              value={formData.title}
              onChange={(v) => setFormData({ ...formData, title: v as any })}
              required
            />

            <LocalizedField
              label={t('admin:articleForm.excerptLabel')}
              type="textarea"
              value={formData.excerpt}
              onChange={(v) => setFormData({ ...formData, excerpt: v as any })}
              required
            />

            <div>
              <label className="block mb-2 font-medium">{t('admin:articleForm.bodyLabel')} <span className="text-red-500">*</span></label>
              
              <div className="flex gap-1 mb-4 border-b border-gray-100">
                {SUPPORTED_LANGUAGES.map((lng) => {
                  const bodyContent = formData.body[lng as Language] || '';
                  const filled = bodyContent.trim().length > 0 && bodyContent !== '<p></p>';
                  return (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setBodyActiveTab(lng as Language)}
                      className={`px-4 py-2 text-xs font-bold uppercase transition-all border-b-2 ${
                        bodyActiveTab === lng 
                          ? 'border-farm-green text-farm-green' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {lng} {filled ? '●' : '○'}
                    </button>
                  );
                })}
              </div>

              <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/50">
                <EditorToolbar 
                  editor={activeEditor} 
                  onInsertProduct={() => setIsProductPickerOpen(true)}
                  onUploadImage={handleEditorImageUpload}
                  t={t}
                />

                <div className={cn("bg-white", bodyActiveTab === 'uk' ? "block" : "hidden")}>
                  <EditorContent editor={editorUk} className="p-8 min-h-[400px] prose prose-stone max-w-none focus:outline-none font-serif" />
                </div>
                <div className={cn("bg-white", bodyActiveTab === 'en' ? "block" : "hidden")}>
                  <EditorContent editor={editorEn} className="p-8 min-h-[400px] prose prose-stone max-w-none focus:outline-none font-serif" />
                </div>
                <div className={cn("bg-white", bodyActiveTab === 'de' ? "block" : "hidden")}>
                  <EditorContent editor={editorDe} className="p-8 min-h-[400px] prose prose-stone max-w-none focus:outline-none font-serif" />
                </div>
              </div>
            </div>

            <Modal
              isOpen={isProductPickerOpen}
              onClose={() => setIsProductPickerOpen(false)}
              title={t('admin:articleForm.insertProductModal')}
            >
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder={t('admin:articleForm.productSearchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-farm-green/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {(products || []).filter(p => {
                    const searchQ = searchTerm.toLowerCase();
                    return SUPPORTED_LANGUAGES.some(lng => 
                      pickLocale(p.name, lng).toLowerCase().includes(searchQ)
                    );
                  }).map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        if (activeEditor) {
                          activeEditor.chain().focus().insertContent({
                            type: 'productMention',
                            attrs: { productId: product.id }
                          }).run();
                        }
                        setIsProductPickerOpen(false);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-farm-green/10 transition-colors text-left group"
                    >
                      <img src={product.images?.[0] || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">
                          {pickLocale(product.name, language)}
                        </p>
                        <p className="text-xs text-farm-wood opacity-50">
                          {typeof product.price === 'number' ? product.price : (product.price?.[i18n.language === 'uk' ? 'UAH' : i18n.language === 'en' ? 'USD' : 'EUR'] || product.price?.UAH || 0)} {i18n.language === 'uk' ? '₴' : i18n.language === 'en' ? '$' : '€'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 bg-farm-green text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                        {t('admin:articleForm.select')}
                      </div>
                    </button>
                  ))}
                  {products.length === 0 && (
                     <p className="text-center py-8 text-gray-400">{t('admin:articleForm.noProductsFound')}</p>
                  )}
                </div>
              </div>
            </Modal>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 ml-2">{t('admin:articleForm.coverHeader')}</p>
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-100 relative group">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl || undefined} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 gap-2 text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px] font-bold">{t('admin:articleForm.noPhoto')}</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="bg-white text-farm-green px-4 py-2 rounded-xl text-xs font-bold">{t('admin:articleForm.changeCover')}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 ml-2">{t('admin:articleForm.categoryLabel')}</p>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-farm-green/20 text-sm font-bold"
                >
                  <option value="">{t('admin:articleForm.noCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{pickLocale(cat.name, language)}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
                <span className="font-bold text-sm text-gray-900">{t('admin:articleForm.publish', { defaultValue: 'Опублікувати' })}</span>
                <input 
                  type="checkbox" 
                  checked={formData.published} 
                  onChange={e => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 accent-farm-green rounded-lg"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-farm-green/5 transition-colors">
                <span className="font-bold text-sm text-gray-900">{t('admin:articleForm.featured')}</span>
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 accent-farm-green rounded-lg"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4 ml-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('admin:articleForm.linkedProducts')}</p>
                <button 
                  type="button"
                  onClick={() => setIsLinkedPickerOpen(true)}
                  className="p-1.5 hover:bg-farm-green/10 rounded-lg transition-colors text-farm-green"
                  title={t('admin:articleForm.addLinkedProduct')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {linkedProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group border border-transparent hover:border-farm-green/20 transition-all">
                    <img src={product.images?.[0] || undefined} className="w-8 h-8 rounded-lg object-cover bg-white" alt="" />
                    <span 
                      className="text-[10px] font-bold text-gray-700 line-clamp-2 flex-1 leading-tight break-words hyphens-auto"
                      title={pickLocale(product.name, language)}
                      lang={language}
                    >
                      {pickLocale(product.name, language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        linkedProductIds: prev.linkedProductIds.filter(id => id !== product.id) 
                      }))}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {linkedProducts.length === 0 && (
                  <div className="text-center py-6 px-4 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {t('admin:articleForm.noLinkedProducts')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Product Selection Modal */}
            <Modal
              isOpen={isLinkedPickerOpen}
              onClose={() => setIsLinkedPickerOpen(false)}
              title={t('admin:articleForm.addLinkedProduct')}
            >
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder={t('admin:articleForm.productSearchPlaceholder')}
                    value={linkedSearchTerm}
                    onChange={e => setLinkedSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-farm-green/20 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                  {unlinkedProducts.filter(p => {
                    const searchQ = linkedSearchTerm.toLowerCase();
                    return SUPPORTED_LANGUAGES.some(lng => 
                      pickLocale(p.name, lng).toLowerCase().includes(searchQ)
                    );
                  }).map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          linkedProductIds: [...prev.linkedProductIds, product.id]
                        }));
                        setIsLinkedPickerOpen(false);
                        setLinkedSearchTerm('');
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-farm-green hover:text-white transition-all text-left group"
                    >
                      <img src={product.images?.[0] || undefined} className="w-12 h-12 rounded-xl object-cover bg-white" alt="" />
                      <div className="flex-1 pr-2">
                        <p 
                          className="font-bold text-sm line-clamp-2 leading-snug break-words hyphens-auto"
                          title={pickLocale(product.name, language)}
                          lang={language}
                        >
                          {pickLocale(product.name, language)}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-0.5">
                          {typeof product.price === 'number' ? product.price : (product.price?.[i18n.language === 'uk' ? 'UAH' : i18n.language === 'en' ? 'USD' : 'EUR'] || product.price?.UAH || 0)} {i18n.language === 'uk' ? '₴' : i18n.language === 'en' ? '$' : '€'}
                        </p>
                      </div>
                      <Plus className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {unlinkedProducts.length === 0 && (
                    <p className="text-center py-8 text-gray-400 font-medium">{t('admin:articleForm.noMoreProducts')}</p>
                  )}
                </div>
              </div>
            </Modal>
          </div>

          <div className="bg-farm-green p-8 rounded-[2.5rem] shadow-xl text-white">
            <Button 
              type="submit" 
              className="w-full bg-white text-farm-green hover:bg-farm-cream border-none mb-4"
              disabled={saving}
            >
              {saving ? t('admin:articleForm.saving') : t('admin:articleForm.save')}
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              className="w-full text-white/50 hover:text-white"
              onClick={() => navigate('/admin/blog')}
            >
              {t('admin:articleForm.cancel')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
