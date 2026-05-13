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
import { uk, enUS, de } from 'date-fns/locale';
import { Modal } from '@/shared/components/Modal';
import { useProducts } from '../../shop/hooks/useShopData';
import { pickLocale } from '@/shared/lib/i18nContent';
import { cn } from '@/shared/lib/utils';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const dateLocales: Record<string, any> = { uk, en: enUS, de };

export default function AdminNewsletterPage() {
  const { t, i18n } = useTranslation('admin');
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
        
        newSubjects[lang] = t('newsletter.composer.subjectTemplate', { title, lng: lang });
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

    const l = {
      try: t('newsletter.email.tryProducts', { lng: lang }),
      order: t('newsletter.email.orderNow', { lng: lang }),
      unsub: t('newsletter.email.unsubscribeNote', { lng: lang }),
      read: t('newsletter.email.readRecipe', { lng: lang })
    };

    const productsHtml = linkedProducts.length > 0 ? `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
        <h3 style="color: #5a6f3f; margin-bottom: 20px;">${l.try}</h3>
        <div style="display: grid; grid-template-cols: 1fr; gap: 20px;">
          ${linkedProducts.map(p => {
            const localizedName = pickLocale(p.raw?.name, lang as any);
            let priceText = '';
            if (lang === 'en') priceText = `$${p.raw?.price?.USD || 0}`;
            else if (lang === 'de') priceText = `${p.raw?.price?.EUR || 0} €`;
            else priceText = `${p.raw?.price?.UAH || 0} грн`;

            return `
            <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 15px; border-radius: 20px;">
              <img src="${p.images?.[0]}" style="width: 60px; height: 60px; border-radius: 10px; object-fit: cover;" />
              <div>
                <p style="margin: 0; font-weight: bold; color: #333;">${localizedName}</p>
                <p style="margin: 0; font-size: 12px; color: #5a6f3f;">${priceText}</p>
                <a href="${window.location.origin}/shop/${p.id}" style="font-size: 10px; color: #8b6f47; text-decoration: underline;">${l.order}</a>
              </div>
            </div>
            `;
          }).join('')}
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
      showToast({ message: t('newsletter.toasts.noSubscribers'), type: 'error' });
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
    showToast({ message: t('newsletter.toasts.sending'), type: 'info' });
    
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
          htmlContent
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
      
      showToast({ message: t('newsletter.toasts.sent', { count: targetEmailsCount }), type: 'success' });
      
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
      showToast({ message: t('newsletter.toasts.error'), type: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-farm-green" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('newsletter.title')}</h1>
          <div className="flex items-center gap-3 text-sm">
             <div className="flex items-center gap-2 font-bold text-gray-500 uppercase tracking-widest">
                <Users className="w-4 h-4 text-farm-green" /> {t('newsletter.stats.recipients', { count: totalSubscriberCount })}
             </div>
             <div className="flex gap-2">
                {['uk', 'en', 'de'].map(lang => (
                  <span key={lang} className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 uppercase">
                    {lang}: {segments[lang].length}
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
            <PenTool className="w-4 h-4" /> {t('newsletter.tabs.compose')}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'history' ? 'bg-white text-farm-green shadow-sm' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <History className="w-4 h-4" /> {t('newsletter.tabs.history')}
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
              {/* Language Version Selector */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex gap-2">
                  {['uk', 'en', 'de'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setActiveSegmentLanguage(lang as any)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-bold text-xs transition-all uppercase tracking-widest border-2",
                        activeSegmentLanguage === lang 
                          ? "bg-farm-green text-white border-farm-green shadow-sm" 
                          : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('newsletter.composer.segmentsLabel')}</span>
                  <div className="flex gap-1.5">
                    {['uk', 'en', 'de'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedSegments(prev => 
                          prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                        )}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all border-2 font-black text-[9px] uppercase",
                          selectedSegments.includes(lang)
                            ? "bg-farm-berry text-white border-farm-berry"
                            : "bg-white text-gray-300 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                    {t('newsletter.composer.subjectLabel')} ({activeSegmentLanguage.toUpperCase()})
                  </label>
                  <input 
                    type="text"
                    value={subjects[activeSegmentLanguage]}
                    onChange={e => setSubjects({ ...subjects, [activeSegmentLanguage]: e.target.value })}
                    placeholder={t('newsletter.composer.subjectPlaceholder')}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-farm-green/30 focus:ring-0 outline-none transition-all font-bold text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                    {t('newsletter.composer.introLabel')} ({activeSegmentLanguage.toUpperCase()})
                  </label>
                  <textarea 
                    rows={5}
                    value={messages[activeSegmentLanguage]}
                    onChange={e => setMessages({ ...messages, [activeSegmentLanguage]: e.target.value })}
                    placeholder={t('newsletter.composer.introPlaceholder')}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-farm-green/30 focus:ring-0 outline-none transition-all resize-none italic leading-relaxed text-gray-600"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!selectedArticleId}
                  className="flex items-center gap-2 text-farm-berry font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" /> {t('newsletter.composer.previewButton')}
                </button>
                <Button 
                  onClick={handleSend} 
                  isLoading={sending} 
                  size="lg" 
                  className={cn(
                    "px-10 rounded-2xl flex items-center gap-2 transition-all font-bold",
                    showConfirmSend && "bg-red-600 hover:bg-red-700 animate-pulse"
                  )}
                  disabled={!subjects.uk || selectedSegments.length === 0}
                >
                  <Send className="w-5 h-5" />
                  <span>
                    {showConfirmSend 
                      ? t('newsletter.composer.confirmSendButton', { count: selectedSegments.length })
                      : t('newsletter.composer.sendButton')
                    }
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-farm-green" /> {t('newsletter.composer.dynamicArticleTitle')}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 border-b border-gray-50 pb-4">
                {t('newsletter.composer.dynamicArticleSubtitle')}
              </p>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleSelect(article.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group text-left",
                      selectedArticleId === article.id 
                        ? 'border-farm-green bg-farm-green/5' 
                        : 'border-white bg-gray-50 hover:bg-white hover:border-gray-200'
                    )}
                  >
                    <img src={article.imageUrl || undefined} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold text-sm truncate mb-1",
                        selectedArticleId === article.id ? 'text-farm-green' : 'text-gray-900'
                      )}>
                        {pickLocale(article.title, activeSegmentLanguage)}
                      </p>
                      <div className="flex gap-1.5">
                         {['uk', 'en', 'de'].map(l => (
                           <span key={l} className={cn(
                             "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                             article.title?.[l] ? "text-green-600 bg-green-50" : "text-gray-300 bg-gray-100"
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
                      {item.sentAt?.toDate ? format(item.sentAt.toDate(), 'd MMMM HH:mm', { locale: dateLocales[i18n.language] || uk }) : t('newsletter.history.recent')}
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
              <p className="text-gray-400 italic">{t('newsletter.history.empty')}</p>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title={`${t('newsletter.composer.previewTitle')} (${activeSegmentLanguage.toUpperCase()})`}
      >
        <div className="bg-gray-50 p-4 sm:p-8 rounded-[2rem] h-[75vh] border border-gray-100 overflow-hidden">
          <iframe 
            srcDoc={generatePreviewHtml()}
            title="Newsletter Preview"
            className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIsPreviewOpen(false)} size="lg" className="px-12 rounded-xl">
            {t('newsletter.composer.closePreview')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
