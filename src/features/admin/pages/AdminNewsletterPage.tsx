import { useState, useEffect } from 'react';
import { db } from '@/shared/lib/firebase';
import { sendBulkTransactional } from '@/shared/lib/brevo';
import { collection, getDocs, orderBy, query, limit, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { 
  Send, 
  Loader2, 
  History, 
  PenTool, 
  ExternalLink, 
  Users, 
  Mail,
  Calendar,
  Eye,
  FileText,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Modal } from '@/shared/components/Modal';
import { useProducts } from '../../shop/hooks/useShopData';
import { pickLocale } from '@/shared/lib/i18nContent';
import { cn } from '@/shared/lib/utils';

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const { products } = useProducts({ category: 'all' });
  
  // Localized state for the newsletter
  const [subjects, setSubjects] = useState<Record<string, string>>({ uk: '', en: '', de: '' });
  const [messages, setMessages] = useState<Record<string, string>>({ uk: '', en: '', de: '' });
  
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [newsletterHistory, setNewsletterHistory] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Subscriber segmentation
  const [segments, setSegments] = useState<Record<string, string[]>>({
    uk: [],
    en: [],
    de: []
  });
  const [activeSegmentLanguage, setActiveSegmentLanguage] = useState<'uk' | 'en' | 'de'>('uk');
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['uk', 'en', 'de']);

  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active articles
        const articlesSnap = await getDocs(query(
          collection(db, 'articles'), 
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        ));
        setArticles(articlesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch history
        const historySnap = await getDocs(query(
          collection(db, 'newsletterHistory'), 
          orderBy('sentAt', 'desc'),
          limit(10)
        ));
        setNewsletterHistory(historySnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch and segment subscribers
        const subsSnap = await getDocs(query(
          collection(db, 'subscribers'),
          where('status', '==', 'confirmed')
        ));
        
        const newSegments: Record<string, string[]> = { uk: [], en: [], de: [] };
        subsSnap.forEach(doc => {
          const data = doc.data();
          const lang = (data.language || 'uk').toLowerCase();
          if (newSegments[lang]) {
            newSegments[lang].push(data.email);
          } else {
            newSegments.uk.push(data.email);
          }
        });
        setSegments(newSegments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSubscriberCount = Object.values(segments).reduce((acc, current) => acc + current.length, 0);

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    const article = articles.find(a => a.id === articleId);
    if (article) {
      const newSubjects = { ...subjects };
      const newMessages = { ...messages };
      
      ['uk', 'en', 'de'].forEach(lang => {
        const title = pickLocale(article.title, lang as any);
        const excerpt = pickLocale(article.excerpt, lang as any);
        
        if (lang === 'uk') {
          newSubjects[lang] = `Наш новий рецепт: ${title} 🍓`;
        } else if (lang === 'en') {
          newSubjects[lang] = `Our new recipe: ${title} 🍓`;
        } else {
          newSubjects[lang] = `Unser neues Rezept: ${title} 🍓`;
        }
        newMessages[lang] = excerpt || '';
      });
      
      setSubjects(newSubjects);
      setMessages(newMessages);
    }
  };

  const generatePreviewHtml = (lang: string = activeSegmentLanguage) => {
    const article = articles.find(a => a.id === selectedArticleId);
    if (!article) return '';

    const title = pickLocale(article.title, lang as any);
    const excerpt = pickLocale(article.excerpt, lang as any);
    const msg = messages[lang] || messages.uk;

    const linkedProducts = article.linkedProductIds 
      ? products.filter(p => article.linkedProductIds.includes(p.id))
      : [];

    const labels: Record<string, any> = {
      uk: { try: 'Спробуйте продукти з рецепту:', order: 'Замовити', unsub: 'Ви отримали цей лист, оскільки підписалися на новини Комори.', read: 'Читати рецепт' },
      en: { try: 'Try these products from the recipe:', order: 'Order Now', unsub: 'You received this email because you subscribed to Komora newsletter.', read: 'Read Recipe' },
      de: { try: 'Probieren Sie diese Produkte aus dem Rezept:', order: 'Jetzt bestellen', unsub: 'Sie haben diese E-Mail erhalten, weil Sie den Komora-Newsletter abonniert haben.', read: 'Rezept lesen' }
    };
    const l = labels[lang] || labels.uk;

    const productsHtml = linkedProducts.length > 0 ? `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
        <h3 style="color: #5a6f3f; margin-bottom: 20px;">${l.try}</h3>
        <div style="display: grid; grid-template-cols: 1fr; gap: 20px;">
          ${linkedProducts.map(p => `
            <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 15px; border-radius: 20px;">
              <img src="${p.images?.[0]}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;" />
              <div>
                <p style="margin: 0; font-weight: bold; color: #333;">${pickLocale(p.name, lang as any)}</p>
                <p style="margin: 0; font-size: 12px; color: #5a6f3f;">${p.raw?.price?.UAH || 0} грн</p>
                <a href="${window.location.origin}/shop/${p.id}" style="font-size: 10px; color: #8b6f47; text-decoration: underline;">${l.order}</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div style="font-family: serif; max-width: 600px; margin: 0 auto; background: #fdfaf3; padding: 40px; border-radius: 40px;">
        <h1 style="color: #5a6f3f; text-align: center; margin-bottom: 30px;">Комора</h1>
        <p style="color: #8b6f47; font-style: italic; margin-bottom: 30px; line-height: 1.6;">${msg}</p>
        <div style="width: 100%; height: 300px; border-radius: 30px; overflow: hidden; margin-bottom: 30px;">
          <img src="${article.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <h2 style="color: #5a6f3f; font-size: 24px; margin-bottom: 15px;">${title}</h2>
        <p style="color: #444; line-height: 1.6; margin-bottom: 30px;">${excerpt}</p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${window.location.origin}/blog/${article.id}" style="background: #5a6f3f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">${l.read}</a>
        </div>
        ${productsHtml}
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #aaa;">
          <p>${l.unsub}</p>
        </div>
      </div>
    `;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetEmailsCount = selectedSegments.reduce((acc, lang) => acc + segments[lang].length, 0);

    if (targetEmailsCount === 0) {
      showToast({ message: 'Немає підписників у вибраних сегментах', type: 'error' });
      return;
    }

    if (sending) return;
    
    if (!showConfirmSend) {
      setShowConfirmSend(true);
      setTimeout(() => setShowConfirmSend(false), 5000);
      return;
    }

    setShowConfirmSend(false);
    setSending(true);
    showToast({ message: 'Запуск сегментованої розсилки...', type: 'info' });
    
    try {
      const results: any[] = [];
      const historyPreviews: Record<string, string> = {};

      for (const lang of selectedSegments) {
        const emails = segments[lang];
        if (emails.length === 0) continue;

        const subject = subjects[lang] || subjects.uk;
        const htmlContent = generatePreviewHtml(lang);
        historyPreviews[lang] = htmlContent;

        console.log(`Sending ${lang} version to ${emails.length} subscribers...`);
        const res = await sendBulkTransactional({
          to: emails,
          subject,
          params: { htmlContent } // We use a custom template approach or just raw HTML if supported by brevo client update
          // Actually, my updated brevo.ts sendCampaign is better for "campaigns" 
          // but doesn't support segmented emails list in one listId.
          // So I used sendBulkTransactional which I added to brevo.ts
        }).catch(err => ({ error: err.message }));
        
        results.push({ lang, count: emails.length, result: res });
      }

      console.log('Recording to history...');
      const historyItem = {
        subjects,
        articleId: selectedArticleId || null,
        articleTitle: articles.find(a => a.id === selectedArticleId)?.title?.uk || null,
        recipientsCount: targetEmailsCount,
        results,
        sentAt: serverTimestamp(),
        previewHtml: generatePreviewHtml('uk'), // Store UK for history preview
        segmentedPreviews: historyPreviews
      };
      
      const docRef = await addDoc(collection(db, 'newsletterHistory'), historyItem);
      
      showToast({ message: `Розсилку успішно відправлено 3-ма мовами! Разом: ${targetEmailsCount}`, type: 'success' });
      
      setSubjects({ uk: '', en: '', de: '' });
      setMessages({ uk: '', en: '', de: '' });
      setSelectedArticleId('');
      
      setTimeout(() => {
        setActiveTab('history');
        setNewsletterHistory(prev => [{ 
          id: docRef.id,
          ...historyItem, 
          sentAt: { toDate: () => new Date() } 
        } as any, ...prev]);
      }, 500);
    } catch (err) {
      console.error(err);
      showToast({ message: 'Помилка при розсилці', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-farm-green" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Розсилка <span className="text-farm-green">i18n</span></h1>
          <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-1.5 font-bold text-gray-400 uppercase tracking-widest">
               <Users className="w-4 h-4 text-farm-green" /> {totalSubscriberCount} підписників
             </div>
             <div className="h-4 w-px bg-gray-200 mx-2" />
             <div className="flex gap-3">
               {['uk', 'en', 'de'].map(lang => (
                 <span key={lang} className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                   {lang.toUpperCase()}: {segments[lang].length}
                 </span>
               ))}
             </div>
          </div>
        </div>

        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab('compose')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'compose' ? 'bg-white text-farm-green shadow-sm' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <PenTool className="w-4 h-4" /> Створити
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'history' ? 'bg-white text-farm-green shadow-sm' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <History className="w-4 h-4" /> Історія
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
              {/* Language Version Selector */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex gap-2">
                  {['uk', 'en', 'de'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveSegmentLanguage(lang as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-bold text-xs transition-all uppercase tracking-widest",
                        activeSegmentLanguage === lang 
                          ? "bg-farm-green text-white shadow-md shadow-farm-green/20" 
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Сегменти для відправки:</span>
                  <div className="flex gap-2">
                    {['uk', 'en', 'de'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedSegments(prev => 
                          prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                        )}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                          selectedSegments.includes(lang)
                            ? "bg-farm-berry text-white border-farm-berry"
                            : "bg-white text-gray-300 border-gray-300"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase">{lang}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">
                    Тема листа ({activeSegmentLanguage.toUpperCase()})
                  </label>
                  <input 
                    type="text"
                    value={subjects[activeSegmentLanguage]}
                    onChange={e => setSubjects({ ...subjects, [activeSegmentLanguage]: e.target.value })}
                    placeholder="Тема для вибраної мови..."
                    className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-farm-green/10 outline-none transition-all font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">
                    Вступне слово ({activeSegmentLanguage.toUpperCase()})
                  </label>
                  <textarea 
                    rows={4}
                    value={messages[activeSegmentLanguage]}
                    onChange={e => setMessages({ ...messages, [activeSegmentLanguage]: e.target.value })}
                    placeholder="Текст вступу для цієї мови..."
                    className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2.5rem] focus:ring-4 focus:ring-farm-green/10 outline-none transition-all resize-none italic leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!selectedArticleId}
                  className="flex items-center gap-2 text-farm-berry font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  <Eye className="w-5 h-5" /> Попередня версія ({activeSegmentLanguage.toUpperCase()})
                </button>
                <Button 
                  onClick={handleSend} 
                  isLoading={sending} 
                  size="lg" 
                  className={cn(
                    "px-12 flex items-center gap-2 transition-all",
                    showConfirmSend && "bg-farm-berry hover:bg-farm-berry/90 animate-pulse"
                  )}
                  disabled={!subjects.uk || selectedSegments.length === 0}
                >
                  {showConfirmSend ? (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Надіслати {selectedSegments.length} сегментам</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Запустити i18n розсилку</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-farm-green mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Динамічний рецепт
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Будуть використані переклади з блогу</p>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleSelect(article.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group text-left",
                      selectedArticleId === article.id 
                        ? 'border-farm-green bg-farm-green/5' 
                        : 'border-transparent bg-gray-50 hover:bg-white hover:border-farm-green/20'
                    )}
                  >
                    <img src={article.imageUrl || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-xs truncate",
                        selectedArticleId === article.id ? 'text-farm-green' : 'text-gray-700'
                      )}>
                        {pickLocale(article.title, activeSegmentLanguage)}
                      </p>
                      <div className="flex gap-1 mt-1">
                         {['uk', 'en', 'de'].map(l => (
                           <span key={l} className={cn(
                             "text-[8px] font-black uppercase px-1 rounded",
                             article.title?.[l] ? "text-green-600 bg-green-50" : "text-gray-300 bg-gray-50"
                           )}>{l}</span>
                         ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {newsletterHistory.map(item => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-farm-cream rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-farm-berry" />
                </div>
                <div className="flex-1 truncate">
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.subject || item.subjects?.uk}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4" />
                      {item.sentAt?.toDate ? format(item.sentAt.toDate(), 'd MMMM HH:mm', { locale: uk }) : 'Нещодавно'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-4 h-4" /> {item.recipientsCount}
                    </span>
                    <div className="flex gap-1 ml-2">
                       {item.results?.map((r: any) => (
                         <span key={r.lang} className="text-[10px] font-bold text-farm-green bg-farm-green/5 px-2 py-0.5 rounded capitalize">
                           {r.lang} ({r.count})
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const win = window.open('', '_blank');
                  win?.document.write(item.previewHtml);
                  win?.document.close();
                }}
                className="p-4 bg-gray-50 text-gray-400 hover:bg-farm-green hover:text-white rounded-2xl transition-all"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          ))}
          {newsletterHistory.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-400 italic">Історія розсилок поки порожня</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title={`Попередній перегляд (${activeSegmentLanguage.toUpperCase()})`}
      >
        <div className="bg-gray-100 p-8 rounded-[2.5rem] h-[70vh]">
          <iframe 
            srcDoc={generatePreviewHtml()}
            title="Newsletter Preview"
            className="w-full h-full bg-white rounded-[3rem] shadow-sm border-none"
          />
        </div>
        <div className="mt-8">
          <Button onClick={() => setIsPreviewOpen(false)} className="w-full">Закрити</Button>
        </div>
      </Modal>
    </div>
  );
}
