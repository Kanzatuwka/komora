import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useProduct } from '../hooks/useShopData'; // Using useProduct as a template for useOrder
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { CheckCircle2, Package, Truck, Store, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'orders', id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return unsub;
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <div className="p-24 text-center">Замовлення не знайдено</div>;

  // Security check: only owner or admin can see
  const isOwner = user?.uid === order.userId || role === 'admin';
  if (!isOwner) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-24">
        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-xl text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-farm-green mb-4">Дякуємо за замовлення!</h1>
          <p className="text-xl text-farm-wood opacity-70 mb-10">Замовлення #{order.id.slice(0, 8).toUpperCase()} успішно прийнято</p>
          
          <div className="w-full grid md:grid-cols-2 gap-8 text-left border-t border-b border-farm-wood/10 py-12 mb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-4">Інформація про замовлення</h3>
              <p className="font-bold text-farm-green text-lg mb-1">{order.userName}</p>
              <p className="text-farm-wood text-sm">{order.userEmail}</p>
              <p className="text-farm-wood text-sm">{order.userPhone}</p>
              <p className="mt-4 text-xs text-farm-wood opacity-50">
                {order.createdAt && format(order.createdAt.toDate(), 'd MMMM yyyy, HH:mm', { locale: uk })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-4">Доставка та оплата</h3>
              <div className="flex items-start gap-3 mb-2">
                {order.deliveryMethod === 'delivery' ? (
                  <>
                    <Truck className="w-5 h-5 text-farm-green shrink-0" />
                    <p className="text-farm-green font-bold text-sm">Кур'єрська доставка</p>
                  </>
                ) : (
                  <>
                    <Store className="w-5 h-5 text-farm-green shrink-0" />
                    <p className="text-farm-green font-bold text-sm">Самовивіз</p>
                  </>
                )}
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-farm-wood/30 shrink-0" />
                <p className="text-farm-wood text-sm">
                  {order.deliveryMethod === 'delivery' ? order.address : 'Точка самовивозу'}
                </p>
              </div>
              <p className="mt-6 text-2xl font-bold text-farm-berry">Сума: {order.total} грн</p>
            </div>
          </div>

          <p className="text-farm-wood mb-12 max-w-sm">
            Ми надіслали лист із деталями замовлення на вашу пошту. Ви можете відстежувати статус у особистому кабінеті.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link to="/shop" className="flex-1">
              <Button variant="outline" className="w-full">До магазину</Button>
            </Link>
            <Link to="/account" className="flex-1">
              <Button className="w-full">В кабінет</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
