import { useState, useEffect } from 'react';
import { db } from '@/shared/lib/firebase';
import { sendCampaign } from '@/shared/lib/brevo';
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
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Modal } from '@/shared/components/Modal';

import { useProducts } from '../../shop/hooks/useShopData';

export default function AdminNewsletterPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const { products } = useProducts({ category: 'all' });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [newsletterHistory, setNewsletterHistory] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
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

        // Fetch subscriber count
        const subsSnap = await getDocs(query(
          collection(db, 'subscribers'),
          where('status', '==', 'confirmed')
        ));
        setSubscriberCount(subsSnap.size);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleArticleSelect = (articleId: string) => {
    setSelectedArticleId(articleId);
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setSubject(`Наш новий рецепт: ${article.title} 🍓`);
      setMessage(article.excerpt || '');
    }
  };

  const generatePreviewHtml = () => {
    const article = articles.find(a => a.id === selectedArticleId);
    if (!article) return '';

    const linkedProducts = article.linkedProductIds 
      ? products.filter(p => article.linkedProductIds.includes(p.id))
      : [];

    const productsHtml = linkedProducts.length > 0 ? `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
        <h3 style="color: #5a6f3f; margin-bottom: 20px;">Спробуйте продукти з рецепту:</h3>
        <div style="display: grid; grid-template-cols: 1fr; gap: 20px;">
          ${linkedProducts.map(p => `
            <div style="display: flex; align-items: center; gap: 15px; background: white; padding: 15px; border-radius: 20px;">
              <img src="${p.images?.[0]}" style="width: 60px; height: 60px; border-radius: 10px; object-cover: center;" />
              <div>
                <p style="margin: 0; font-weight: bold; color: #333;">${p.name}</p>
                <p style="margin: 0; font-size: 12px; color: #5a6f3f;">${p.price} грн</p>
                <a href="${window.location.origin}/shop/${p.id}" style="font-size: 10px; color: #8b6f47; text-decoration: underline;">Замовити</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    return `
      <div style="font-family: serif; max-width: 600px; margin: 0 auto; background: #fdfaf3; padding: 40px; border-radius: 40px;">
        <h1 style="color: #5a6f3f; text-align: center; margin-bottom: 30px;">Комора</h1>
        <p style="color: #8b6f47; font-style: italic; margin-bottom: 30px; line-height: 1.6;">${message}</p>
        <div style="width: 100%; height: 300px; border-radius: 30px; overflow: hidden; margin-bottom: 30px;">
          <img src="${article.imageUrl}" style="width: 100%; height: 100%; object-cover: center;" />
        </div>
        <h2 style="color: #5a6f3f; font-size: 24px; margin-bottom: 15px;">${article.title}</h2>
        <p style="color: #444; line-height: 1.6; margin-bottom: 30px;">${article.excerpt}</p>
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${window.location.origin}/blog/${article.id}" style="background: #5a6f3f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 20px; font-weight: bold; display: inline-block;">Читати рецепт</a>
        </div>
        ${productsHtml}
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #aaa;">
          <p>Ви отримали цей лист, оскільки підписалися на новини Комори.</p>
        </div>
      </div>
    `;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || (!message && !selectedArticleId)) {
      showToast({ message: 'Заповніть тему та оберіть статтю або введіть текст', type: 'error' });
      return;
    }

    if (subscriberCount === 0) {
      showToast({ message: 'Немає підтверджених підписників', type: 'error' });
      return;
    }

    if (sending) return;
    
    if (!showConfirmSend) {
      setShowConfirmSend(true);
      setTimeout(() => setShowConfirmSend(false), 5000); // 5 sec timeout
      return;
    }

    setShowConfirmSend(false);
    setSending(true);
    showToast({ message: 'Починаємо розсилку...', type: 'info' });
    
    try {
      console.log('Generating preview HTML...');
      const htmlContent = generatePreviewHtml() || `<div style="font-family: sans-serif; padding: 40px;"><h1>${subject}</h1><p>${message}</p></div>`;
      
      console.log('Sending via Brevo API...');
      const campaignResult = await sendCampaign({ 
        subject, 
        htmlContent, 
        listId: Number(import.meta.env.VITE_BREVO_LIST_ID) 
      }).catch(err => {
        console.error('Brevo API Error:', err);
        // We still proceed to record history even if Brevo fails, 
        // because we want to know what was attempted.
        return { error: err.message };
      });

      console.log('Recording to history...');
      const historyItem = {
        subject,
        articleId: selectedArticleId || null,
        articleTitle: articles.find(a => a.id === selectedArticleId)?.title || null,
        recipientsCount: subscriberCount,
        sentAt: serverTimestamp(),
        previewHtml: htmlContent,
        apiResult: campaignResult
      };
      
      const docRef = await addDoc(collection(db, 'newsletterHistory'), historyItem);
      console.log('History recorded with ID:', docRef.id);
      
      showToast({ message: `Розсилку оброблено для ${subscriberCount} підписників!`, type: 'success' });
      setSubject('');
      setMessage('');
      setSelectedArticleId('');
      
      // Short delay before switching to let user see success
      setTimeout(() => {
        setActiveTab('history');
        // Update local history
        setNewsletterHistory(prev => [{ 
          id: docRef.id,
          ...historyItem, 
          sentAt: { toDate: () => new Date() } 
        } as any, ...prev]);
      }, 500);
    } catch (err) {
      console.error('Final handleSend error:', err);
      showToast({ 
        message: 'Сталася помилка. Перевірте консоль для деталей.', 
        type: 'error' 
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-farm-green" /></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Розсилка</h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Users className="w-4 h-4" /> {subscriberCount} активних підписників
          </p>
        </div>

        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'compose' ? 'bg-white text-farm-green shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <PenTool className="w-4 h-4" /> Створити
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-farm-green shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <History className="w-4 h-4" /> Історія
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Тема листа</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Напр.: Наш секрет ідеального варення ✨"
                  className="w-full px-8 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-farm-green/10 outline-none transition-all font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-4">Вступне слово</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Вітання до підписників від ферми..."
                  className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2.5rem] focus:ring-4 focus:ring-farm-green/10 outline-none transition-all resize-none italic leading-relaxed"
                />
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!selectedArticleId}
                  className="flex items-center gap-2 text-farm-berry font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  <Eye className="w-5 h-5" /> Переглянути в листі
                </button>
                <Button 
                  onClick={handleSend} 
                  isLoading={sending} 
                  size="lg" 
                  className={`px-12 flex items-center gap-2 transition-all ${showConfirmSend ? 'bg-farm-berry hover:bg-farm-berry/90 animate-pulse' : ''}`}
                  disabled={!subject || (!message && !selectedArticleId)}
                >
                  {showConfirmSend ? (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Підтвердити відправку</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Надіслати всім</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-farm-green mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Вибрати рецепт
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {articles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleSelect(article.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group text-left ${
                      selectedArticleId === article.id 
                        ? 'border-farm-green bg-farm-green/5' 
                        : 'border-transparent bg-gray-50 hover:bg-white hover:border-farm-green/20'
                    }`}
                  >
                    <img src={article.imageUrl || undefined} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-xs truncate ${selectedArticleId === article.id ? 'text-farm-green' : 'text-gray-700'}`}>
                        {article.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                        {article.createdAt && format(article.createdAt.toDate(), 'd MMM yyyy', { locale: uk })}
                      </p>
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
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4" />
                      {item.sentAt?.toDate ? format(item.sentAt.toDate(), 'd MMMM HH:mm', { locale: uk }) : 'Нещодавно'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-4 h-4" /> {item.recipientsCount}
                    </span>
                    {item.articleTitle && (
                      <span className="flex items-center gap-1.5 font-medium text-farm-green bg-farm-green/5 px-2 py-0.5 rounded">
                        <FileText className="w-3 h-3" /> {item.articleTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedArticleId(item.articleId); // For preview HTML gen if needed from article
                  // Or just use item.previewHtml if we want to show exact sent content
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
        title="Попередній перегляд листа"
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
