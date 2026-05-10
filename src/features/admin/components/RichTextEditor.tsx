import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ProductMention } from './ProductMention';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
  Sparkles,
  Search
} from 'lucide-react';
import { useProducts } from '../../shop/hooks/useShopData';
import { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

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

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const { products } = useProducts({ category: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      ProductMention
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const insertProduct = (productId: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'productMention',
      attrs: { productId }
    }).run();
    setIsProductPickerOpen(false);
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-gray-50/50">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-100">
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
        <button
          type="button"
          onClick={() => setIsProductPickerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-farm-green hover:bg-farm-green/5 transition-colors"
        >
          <Sparkles className="w-4 h-4" /> Картка товару
        </button>

        <Modal
          isOpen={isProductPickerOpen}
          onClose={() => setIsProductPickerOpen(false)}
          title="Вставити товар у текст"
        >
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="text"
                placeholder="Пошук товару за назвою..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-farm-green/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => insertProduct(product.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-farm-green/10 transition-colors text-left group"
                >
                  <img src={product.images?.[0] || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900">{product.name}</p>
                    <p className="text-xs text-farm-wood opacity-50">{product.price} грн</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 bg-farm-green text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                    Вибрати
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center py-8 text-gray-400 italic">Товарів не знайдено</p>
              )}
            </div>
          </div>
        </Modal>
      </div>

      <EditorContent 
        editor={editor} 
        className="p-8 min-h-[400px] prose prose-stone max-w-none focus:outline-none bg-white font-serif" 
      />
    </div>
  );
}
