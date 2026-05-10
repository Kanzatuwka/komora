import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Package, 
  FileText, 
  ShoppingBag,
  Loader2,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: string;
  title: string;
  type: 'product' | 'article' | 'order';
  path: string;
  metadata?: string;
}

export function AdminSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (queryText.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = queryText.toLowerCase();
        const searchResults: SearchResult[] = [];

        // 1. Search Products
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(query(productsRef, limit(20)));
        productsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.name.toLowerCase().includes(q)) {
            searchResults.push({
              id: doc.id,
              title: data.name,
              type: 'product',
              path: `/admin/products/${doc.id}`,
              metadata: `${data.price} грн • ${data.category}`
            });
          }
        });

        // 2. Search Articles
        const articlesRef = collection(db, 'articles');
        const articlesSnap = await getDocs(query(articlesRef, limit(20)));
        articlesSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.title.toLowerCase().includes(q)) {
            searchResults.push({
              id: doc.id,
              title: data.title,
              type: 'article',
              path: `/admin/blog/${doc.id}`,
              metadata: 'Стаття / Рецепт'
            });
          }
        });

        // 3. Search Orders (by ID or Name)
        const ordersRef = collection(db, 'orders');
        const ordersSnap = await getDocs(query(ordersRef, limit(50)));
        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          const matchName = data.userName?.toLowerCase().includes(q);
          const matchId = doc.id.toLowerCase().includes(q);
          if (matchName || matchId) {
            searchResults.push({
              id: doc.id,
              title: `Замовлення #${doc.id.slice(-5)}`,
              type: 'order',
              path: `/admin/orders/${doc.id}`,
              metadata: `${data.userName} • ${data.total} грн`
            });
          }
        });

        setResults(searchResults.slice(0, 8));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryText]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQueryText('');
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
          isOpen ? "text-farm-green" : "text-gray-400 group-focus-within:text-farm-green"
        )} />
        <input 
          type="text"
          value={queryText}
          onChange={(e) => {
            setQueryText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Пошук (товари, статті, замовлення)..." 
          className={cn(
            "w-full bg-gray-100 rounded-full py-2.5 pl-12 pr-10 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-farm-green/20 focus:bg-white",
            isOpen && "shadow-lg bg-white"
          )}
        />
        {queryText && (
          <button 
            onClick={() => setQueryText('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (queryText.length >= 2 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-farm-green" />
                <span className="text-xs font-medium">Шукаємо...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2 max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Результати пошуку ({results.length})
                </div>
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.path)}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      result.type === 'product' && "bg-blue-50 text-blue-600",
                      result.type === 'article' && "bg-orange-50 text-orange-600",
                      result.type === 'order' && "bg-farm-green/10 text-farm-green",
                    )}>
                      {result.type === 'product' && <Package className="w-5 h-5" />}
                      {result.type === 'article' && <FileText className="w-5 h-5" />}
                      {result.type === 'order' && <ShoppingBag className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{result.title}</p>
                      {result.metadata && (
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{result.metadata}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400 font-medium">Нічого не знайдено</p>
                <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-tight">Спробуйте інший запит</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
