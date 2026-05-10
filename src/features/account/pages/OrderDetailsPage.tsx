import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useOrderDetails } from '../hooks/useAccountData';
import { Navbar } from '@/shared/components/Navbar';
import { PageLoader } from '@/shared/components/Loader';
import { ChevronLeft, Package, Truck, Store, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { cn } from '@/shared/lib/utils';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { order, loading } = useOrderDetails(id || '');

  if (loading) return <PageLoader />;
  if (!order) return <div className="p-24 text-center">Замовлення не знайдено</div>;

  const isOwner = user?.uid === order.userId || role === 'admin';
  if (!isOwner) return <Navigate to="/account" replace />;

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
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-farm-wood hover:text-farm-green transition-colors mb-12"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Назад до кабінету</span>
        </button>

        <div className="bg-white rounded-[3.5rem] shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-farm-wood/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-farm-green">Замовлення #{order.id.slice(0, 8).toUpperCase()}</h1>
                <span className={cn("px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest", getStatusColor(order.status))}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-farm-wood opacity-50 flex items-center gap-2">
                <Clock className="w-4 h-4" /> 
                {order.createdAt && format(order.createdAt.toDate(), 'd MMMM yyyy, HH:mm', { locale: uk })}
              </p>
            </div>
            
            {order.status === 'in_transit' && (
              <div className="bg-farm-berry text-white p-6 rounded-3xl text-sm font-medium">
                <p>Ваше замовлення вже їде до вас!</p>
              </div>
            )}
          </div>

          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 border-b border-farm-wood/5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-6">Дані отримувача</h3>
              <div className="space-y-1">
                <p className="font-bold text-farm-green text-lg">{order.userName}</p>
                <p className="text-farm-wood">{order.userPhone}</p>
                <p className="text-farm-wood">{order.userEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-6">Доставка</h3>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-farm-cream rounded-xl flex items-center justify-center text-farm-green shrink-0">
                  {order.deliveryMethod === 'delivery' ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-farm-green">
                    {order.deliveryMethod === 'delivery' ? 'Кур\'єрська доставка' : 'Самовивіз'}
                  </p>
                  <p className="text-farm-wood opacity-70 text-sm mt-1">
                    {order.deliveryMethod === 'delivery' ? order.address : 'Київ, вул. Велика Васильківська, 32'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-8">Склад замовлення</h3>
            <div className="space-y-6">
              {order.items?.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-farm-cream rounded-2xl flex items-center justify-center text-farm-green font-bold">
                      {item.quantity}
                    </div>
                    <div>
                      <p className="font-bold text-farm-green">{item.name}</p>
                      <p className="text-xs text-farm-wood opacity-50">{item.price} грн / шт</p>
                    </div>
                  </div>
                  <span className="font-bold text-farm-green whitespace-nowrap">{item.price * item.quantity} грн</span>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-farm-wood/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
              {order.comment && (
                <div className="bg-farm-cream/30 p-6 rounded-3xl max-w-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-2">Коментар:</p>
                  <p className="text-sm text-farm-wood italic">"{order.comment}"</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-farm-wood opacity-50 mb-1">Разом до сплати:</p>
                <p className="text-4xl font-bold text-farm-berry">{order.total} грн</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
