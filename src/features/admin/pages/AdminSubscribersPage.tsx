import { useState, useEffect } from 'react';
import { db, auth, OperationType, handleFirestoreError } from '@/shared/lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { PageLoader } from '@/shared/components/Loader';
import { Users, Mail, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useToast } from '@/shared/contexts/ToastContext';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSubscribers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error('Subscribers snapshot error:', error);
      handleFirestoreError(error, OperationType.LIST, 'subscribers');
    });
    return unsub;
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteSubscriber = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    
    console.log('Attempting to delete subscriber with ID:', id);
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      showToast({ message: 'Підписника видалено', type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Delete subscriber failed:', err);
      showToast({ 
        message: 'Помилка при видаленні. Можливо, недостатньо прав.', 
        type: 'error' 
      });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Підписники</h1>
        <p className="text-gray-500">База контактів для розсилки новин</p>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Статус</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Дата підписки</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-farm-green/10 rounded-full flex items-center justify-center text-farm-green">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {sub.status === 'confirmed' ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Підтверджено
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase">
                        <Clock className="w-3.5 h-3.5" /> Очікує
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs text-gray-500">
                      {sub.subscribedAt && format(sub.subscribedAt.toDate(), 'dd.MM.yyyy HH:mm', { locale: uk })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => deleteSubscriber(sub.id)}
                      className={`p-2 transition-all duration-200 ${
                        confirmDeleteId === sub.id 
                          ? 'text-white bg-red-500 rounded-xl px-4 animate-pulse' 
                          : 'text-gray-400 hover:text-farm-berry'
                      }`}
                    >
                      {confirmDeleteId === sub.id ? (
                        <span className="text-[10px] font-bold uppercase whitespace-nowrap">Підтвердити</span>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                    Список порожній
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
