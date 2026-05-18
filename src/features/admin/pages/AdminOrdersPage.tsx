import { useState } from 'react';
import { useAdminOrders, useAdminStats } from '../hooks/useAdminData';
import { db } from '@/shared/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Package, 
  Plus,
  ChevronDown,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS, de } from 'date-fns/locale';
import { useToast } from '@/shared/contexts/ToastContext';
import { PageLoader } from '@/shared/components/Loader';
import { cn } from '@/shared/lib/utils';
import { sendTransactional, getTemplateId } from '@/shared/lib/brevo';
import { formatPrice } from '@/shared/lib/format';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { motion, AnimatePresence } from 'motion/react';
import i18n from '@/i18n/config.ts';
import { useTranslation } from 'react-i18next';

export default function AdminOrdersPage() {
  const { t } = useTranslation('admin');
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const { orders, loading } = useAdminOrders();
  const { stats } = useAdminStats();
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const STATUSES = [
    { id: 'all', label: t('orders.filters.all') },
    { id: 'new', label: t('orders.filters.new') },
    { id: 'confirmed', label: t('orders.filters.confirmed') },
    { id: 'in_transit', label: t('orders.filters.in_transit') },
    { id: 'delivered', label: t('orders.filters.delivered') },
    { id: 'cancelled', label: t('orders.filters.cancelled') },
  ];

  const dateLocales: Record<string, any> = { uk, en: enUS, de };
  const currentLocale = dateLocales[i18n.language] || uk;

  const filteredOrders = orders.filter(o => 
    (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.userName.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || o.status === statusFilter)
  );

  const setStatus = (status: string) => {
    if (status === 'all') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('status');
      setSearchParams(newParams);
    } else {
      searchParams.set('status', status);
      setSearchParams(searchParams);
    }
  };

  const updateStatus = async (order: any, newStatus: string, reason?: string) => {
    if (newStatus === 'cancelled' && !reason) {
      setCancellingOrder(order);
      setCancelReason('');
      return;
    }

    try {
      const updates: any = { 
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'cancelled') {
        updates.cancelReason = reason;
      }

      await updateDoc(doc(db, 'orders', order.id), updates);

      // Send status update email using order language
      const lang = order.userLanguage || 'uk';
      let templateKey: string | null = null;
      switch (newStatus) {
        case 'confirmed': templateKey = 'ORDER_CONFIRMED'; break;
        case 'in_transit': templateKey = 'ORDER_IN_TRANSIT'; break;
        case 'delivered': templateKey = 'ORDER_DELIVERED'; break;
        case 'cancelled': templateKey = 'ORDER_CANCELLED'; break;
      }

      if (templateKey && order.userEmail) {
        const templateId = getTemplateId(templateKey as any, lang);
        if (templateId) {
          await sendTransactional({
            to: order.userEmail,
            templateId,
            params: {
              customerName: order.userName,
              orderNumber: order.id.slice(0, 8).toUpperCase(),
              total: formatPrice(order.total, order.currency || 'UAH', lang),
              statusMessage: i18n.t(`admin:orderStatus.${newStatus}Message`, { lng: lang }),
              cancelReason: newStatus === 'cancelled' ? (typeof reason !== 'undefined' ? reason : cancelReason) : ''
              //cancelReason: newStatus === 'cancelled' ? reason : ''
            }
          });
        }
      }

      showToast({ message: t('orders.toasts.statusChanged', { status: getStatusLabel(newStatus) }), type: 'success' });
      setCancellingOrder(null);
    } catch (err) {
      showToast({ message: t('orders.toasts.updateError'), type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-amber-100 text-amber-700';
      case 'in_transit': return 'bg-farm-berry/10 text-farm-berry';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`orders.filters.${status}`, { defaultValue: status });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orders.title')}</h1>
          <p className="text-gray-500">{t('orders.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('orders.searchPlaceholder')} 
              className="w-full bg-gray-50 rounded-full py-4 pl-14 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green/20 border border-transparent focus:border-farm-green/20"
            />
          </div>
          <div className="flex bg-gray-50 p-1 rounded-full overflow-x-auto no-scrollbar">
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={cn(
                  "px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  statusFilter === s.id 
                    ? "bg-white text-farm-green shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {s.label}
                {s.id === 'new' && stats.newOrders > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                    {stats.newOrders}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto min-h-[450px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders.table.number')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders.table.client')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders.table.date')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders.table.total')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">{t('orders.table.status')}</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{t('orders.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-gray-900 leading-none mb-1">{order.userName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order.userPhone}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs text-gray-500 font-medium">
                      {order.createdAt && format(order.createdAt.toDate(), 'dd.MM.yy, HH:mm', { locale: currentLocale })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-farm-green">{formatPrice(order.total, order.currency || 'UAH', i18n.language)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider", getStatusColor(order.status))}>
                         {getStatusLabel(order.status)}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <div className="relative group/menu z-20">
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        <div className={cn(
                          "absolute right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 p-2",
                          (filteredOrders.length > 4 && filteredOrders.indexOf(order) > filteredOrders.length - 4) ? "bottom-full mb-2" : "top-full mt-2"
                        )}>
                          {['new', 'confirmed', 'in_transit', 'delivered', 'cancelled'].map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order, s)}
                              className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors capitalize"
                            >
                              {getStatusLabel(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Link to={`/admin/orders/${order.id}`}>
                        <button className="p-2 text-gray-400 hover:text-farm-green transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {cancellingOrder && (
          <Modal 
            isOpen={!!cancellingOrder} 
            onClose={() => setCancellingOrder(null)}
            title={t('orders.cancelModal.title')}
          >
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-red-900">{t('orders.cancelModal.warning')} #{cancellingOrder.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-red-700 text-sm opacity-80 mt-1">{t('orders.cancelModal.description')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-4">{t('orders.cancelModal.reasonLabel')}</label>
                <textarea 
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder={t('orders.cancelModal.reasonPlaceholder')}
                  className="w-full bg-gray-50 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 border border-transparent focus:border-red-500/20 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => updateStatus(cancellingOrder, 'cancelled', cancelReason)}
                  disabled={!cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {t('orders.cancelModal.confirm')}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1"
                >
                  {t('orders.cancelModal.cancel')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
