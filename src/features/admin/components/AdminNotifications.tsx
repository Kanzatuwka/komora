import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  UserPlus, 
  Info,
  Check,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'subscriber' | 'system';
  link?: string;
  read: boolean;
  createdAt: any;
}

export function AdminNotifications() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort locally to avoid index requirement
      const sorted = [...data].sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setNotifications(sorted);
      setError(null);
      setLoading(false);
    }, (err) => {
      console.error('Notifications fetch error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4" />;
      case 'subscriber': return <UserPlus className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'order': return 'bg-farm-green/10 text-farm-green';
      case 'subscriber': return 'bg-blue-50 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-2xl transition-all",
          isOpen ? "bg-farm-green/10 text-farm-green" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        )}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-farm-berry text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 leading-none">{t('notifications.title')}</h3>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">
                  {unreadCount > 0 ? `${unreadCount} ${t('notifications.new')}` : t('notifications.allRead')}
                </p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-farm-green hover:text-farm-green/80 uppercase tracking-tight flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> {t('notifications.markAllRead')}
                </button>
              )}
            </div>

            <div className="max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-300">
                  <Loader2 className="w-8 h-8 animate-spin text-farm-green/30" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">{t('notifications.loading')}</span>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                   <p className="text-xs font-bold text-farm-berry uppercase tracking-tight">{t('notifications.accessError')}</p>
                   <p className="text-[10px] text-gray-400 mt-1">{error}</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-4 transition-all group relative",
                        !n.read ? "bg-gray-50/50" : "opacity-60"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          getTypeStyles(n.type)
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-black text-gray-900 truncate">
                              {n.title}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                              {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('notifications.justNow')}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-gray-500 leading-relaxed truncate-2-lines">
                            {n.message}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            {!n.read && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="text-[10px] font-bold text-farm-green hover:underline uppercase"
                              >
                                {t('notifications.read')}
                              </button>
                            )}
                            {n.link && (
                              <Link 
                                to={n.link} 
                                onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                                className="text-[10px] font-bold text-blue-600 hover:underline uppercase flex items-center gap-1"
                              >
                                {t('notifications.view')} <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-farm-berry opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">{t('notifications.empty')}</p>
                  <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-tight">{t('notifications.emptyDescription')}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
              <Link 
                to="/admin/settings" 
                onClick={() => setIsOpen(false)}
                className="block text-center text-[10px] font-bold text-gray-400 hover:text-farm-green uppercase tracking-widest transition-colors"
              >
                {t('notifications.settings')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
