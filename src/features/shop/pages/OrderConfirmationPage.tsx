import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { formatPrice } from '@/shared/lib/format';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { CheckCircle2, Package, Truck, Store, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS, de } from 'date-fns/locale';

const dateLocales: Record<string, any> = { uk, en: enUS, de };

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const { t } = useTranslation(['shop', 'common']);
  const { language } = useLanguage();
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
  if (!order) return <div className="p-24 text-center">{t('shop:orderConfirmation.notFound')}</div>;

  // Security check: only owner or admin can see
  const isOwner = user?.uid === order.userId || role === 'admin';
  if (!isOwner) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-24">
        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-xl text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-farm-green mb-4">{t('shop:orderConfirmation.thanks')}</h1>
          <p className="text-xl text-farm-wood opacity-70 mb-10">{t('shop:orderConfirmation.received')} #{order.id.slice(0, 8).toUpperCase()}</p>
          
          <div className="w-full grid md:grid-cols-2 gap-8 text-left border-t border-b border-farm-wood/10 py-12 mb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-4">{t('shop:orderConfirmation.info')}</h3>
              <p className="font-bold text-farm-green text-lg mb-1">{order.userName}</p>
              <p className="text-farm-wood text-sm">{order.userEmail}</p>
              <p className="text-farm-wood text-sm">{order.userPhone}</p>
              <p className="mt-4 text-xs text-farm-wood opacity-50">
                {order.createdAt && format(order.createdAt.toDate(), 'd MMMM yyyy, HH:mm', { locale: dateLocales[language] || uk })}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-4">{t('shop:orderConfirmation.deliveryAndPayment')}</h3>
              <div className="flex items-start gap-3 mb-2">
                {order.deliveryMethod === 'delivery' ? (
                  <>
                    <Truck className="w-5 h-5 text-farm-green shrink-0" />
                    <p className="text-farm-green font-bold text-sm">{t('shop:orderConfirmation.courierDelivery')}</p>
                  </>
                ) : (
                  <>
                    <Store className="w-5 h-5 text-farm-green shrink-0" />
                    <p className="text-farm-green font-bold text-sm">{t('shop:orderConfirmation.pickup')}</p>
                  </>
                )}
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-farm-wood/30 shrink-0" />
                <p className="text-farm-wood text-sm">
                  {order.deliveryMethod === 'delivery' ? order.address : t('shop:orderConfirmation.pickupPoint')}
                </p>
              </div>
              <div className="mt-6">
                <div className="space-y-2 mb-4 border-t border-farm-wood/5 pt-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-1 text-sm">
                      <span className="text-farm-wood">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-farm-green">{formatPrice(item.price * item.quantity, order.currency, language)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-2xl font-bold text-farm-berry">{t('shop:orderConfirmation.total')}: {formatPrice(order.total, order.currency, language)}</p>
              </div>
            </div>
          </div>

          <p className="text-farm-wood mb-12 max-w-sm">
            {t('shop:orderConfirmation.emailNote')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link to="/shop" className="flex-1">
              <Button variant="outline" className="w-full">{t('shop:orderConfirmation.toShop')}</Button>
            </Link>
            <Link to="/account" className="flex-1">
              <Button className="w-full">{t('shop:orderConfirmation.toAccount')}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
