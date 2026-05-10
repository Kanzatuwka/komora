import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails } from '../../account/hooks/useAccountData';
import { db } from '@/shared/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  Store, 
  MapPin, 
  Clock, 
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/contexts/ToastContext';
import { sendTransactional } from '@/shared/lib/brevo';
import { Modal } from '@/shared/components/Modal';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, loading } = useOrderDetails(id || '');
  const { showToast } = useToast();
  const [cancelReason, setCancelReason] = useState(order?.cancelReason || '');
  const [showCancelReason, setShowCancelReason] = useState(false);

  if (loading) return <PageLoader />;
  if (!order) return <div className="p-24 text-center">Замовлення не знайдено</div>;

  const updateStatus = async (newStatus: string) => {
    if (newStatus === 'cancelled' && !showCancelReason) {
      setShowCancelReason(true);
      return;
    }

    if (newStatus === 'cancelled' && !cancelReason) {
      showToast({ message: 'Вкажіть причину скасування', type: 'error' });
      return;
    }

    try {
      const updates: any = { 
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'cancelled') {
        updates.cancelReason = cancelReason;
      }

      await updateDoc(doc(db, 'orders', order.id), updates);

      let templateId = 0;
      switch (newStatus) {
        case 'confirmed': templateId = Number(import.meta.env.VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID); break;
        case 'in_transit': templateId = Number(import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID); break;
        case 'delivered': templateId = Number(import.meta.env.VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID); break;
        case 'cancelled': templateId = Number(import.meta.env.VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID); break;
      }

      if (templateId && order.userEmail) {
        await sendTransactional({
          to: order.userEmail,
          templateId,
          params: {
            customerName: order.userName,
            orderNumber: order.id.slice(0, 8).toUpperCase(),
            total: order.total.toFixed(2),
            cancelReason: newStatus === 'cancelled' ? cancelReason : ''
          }
        });
      }

      showToast({ message: `Статус змінено на ${newStatus}`, type: 'success' });
      setShowCancelReason(false);
    } catch (err) {
      showToast({ message: 'Помилка оновлення', type: 'error' });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Нове';
      case 'confirmed': return 'Підтверджено';
      case 'in_transit': return 'В дорозі';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50';
      case 'confirmed': return 'text-amber-600 bg-amber-50';
      case 'in_transit': return 'text-farm-berry bg-farm-berry/5';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-farm-green transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> До списку замовлень
        </button>
        <div className="flex items-center gap-4">
          <span className={cn("px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest", getStatusColor(order.status))}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Склад замовлення</h2>
              <div className="space-y-6">
                {order.items?.map((item: any) => (
                  <div key={item.productId} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold">
                        {item.quantity}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.price} грн / шт</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{item.price * item.quantity} грн</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t border-gray-50 flex justify-between items-end">
                <span className="text-gray-400 font-medium">Разом до сплати</span>
                <span className="text-3xl font-bold text-farm-green">{order.total} грн</span>
              </div>
            </div>

            {order.comment && (
              <div className="p-10 bg-amber-50/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">Коментар від клієнта:</p>
                <p className="text-gray-600 italic">"{order.comment}"</p>
              </div>
            )}
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Історія замовлення</h2>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="flex items-start gap-6 relative">
                <div className="w-4 h-4 rounded-full bg-farm-green ring-4 ring-green-50 z-10" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Замовлення створено</p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt && format(order.createdAt.toDate(), 'd MMMM yyyy, HH:mm', { locale: uk })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6 relative">
                <div className="w-4 h-4 rounded-full bg-gray-200 z-10" />
                <div>
                  <p className="text-sm font-bold text-gray-400">Остання зміна</p>
                  <p className="text-xs text-gray-400">
                    {order.updatedAt && format(order.updatedAt.toDate(), 'd MMMM yyyy, HH:mm', { locale: uk })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-lg font-bold text-gray-900">Клієнт</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.userName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {order.userId?.slice(0, 8)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-600">{order.userPhone}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-600 break-all">{order.userEmail}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-lg font-bold text-gray-900">Змінити статус</h2>
            <div className="space-y-2">
              {[
                { id: 'confirmed', label: 'Підтверджено', color: 'hover:bg-amber-50 hover:text-amber-600' },
                { id: 'in_transit', label: 'В дорозі', color: 'hover:bg-farm-berry/10 hover:text-farm-berry' },
                { id: 'delivered', label: 'Доставлено', color: 'hover:bg-green-50 hover:text-green-600' },
                { id: 'cancelled', label: 'Скасовано', color: 'hover:bg-red-50 hover:text-red-600' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => updateStatus(s.id)}
                  className={cn(
                    "w-full text-left px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                    order.status === s.id ? "bg-gray-100 text-gray-900" : `text-gray-400 ${s.color}`
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCancelReason && (
          <Modal 
            isOpen={showCancelReason} 
            onClose={() => setShowCancelReason(false)}
            title="Скасування замовлення"
          >
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-red-900">Ви скасовуєте замовлення #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-red-700 text-sm opacity-80 mt-1">Клієнт отримає повідомлення про причину скасування.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-4">Причина скасування</label>
                <textarea 
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Вкажіть причину для клієнта..."
                  className="w-full bg-gray-50 rounded-[2rem] p-6 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 border border-transparent focus:border-red-500/20 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => updateStatus('cancelled')}
                  disabled={!cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Підтвердити скасування
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCancelReason(false)}
                  className="flex-1"
                >
                  Скасувати
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
