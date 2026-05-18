import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useCart } from '@/shared/contexts/CartContext';
import { useToast } from '@/shared/contexts/ToastContext';
import { usePickupAddresses, useUserAddresses, useCreateOrder } from '../hooks/useShopData';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { ChevronLeft, MapPin, Truck, Store, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { serverTimestamp } from 'firebase/firestore';
import { sendTransactional, getTemplateId } from '@/shared/lib/brevo';
import { useNotifications } from '@/features/admin/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useCurrency } from '@/shared/contexts/CurrencyContext';
import { formatPrice } from '@/shared/lib/format';
import { pickLocale } from '@/shared/lib/i18nContent';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, total, clearCart, cartCurrency } = useCart();
  const { showToast } = useToast();
  const { createOrder, loading: orderLoading } = useCreateOrder();
  const { addresses: pickupPoints } = usePickupAddresses();
  const { addresses: userAddresses } = useUserAddresses(user?.uid || '');
  const { createNotification } = useNotifications();
  const { t, i18n } = useTranslation(['shop', 'common', 'account']);
  const { language } = useLanguage();
  const { currency: currentCurrency } = useCurrency();
  const currency = cartCurrency || currentCurrency;

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    pickupId: '',
    comment: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: profile?.name || user.displayName || '',
        phone: profile?.phone || prev.phone, // Keep current if profile phone is empty
        email: user.email || ''
      }));
    }
  }, [user, profile]);

  if (items.length === 0) return <Navigate to="/shop" replace />;

  const handleAddressSelect = (addr: any) => {
    setFormData(prev => ({
      ...prev,
      address: addr.street || '',
      city: addr.city || '',
      zip: addr.postalCode || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      userId: user?.uid,
      userName: formData.name,
      userPhone: formData.phone,
      userEmail: formData.email,
      userLanguage: language,
      currency: currency,
      items: items.map(i => ({
        productId: i.productId,
        name: typeof i.name === 'object' ? pickLocale(i.name, language) : i.name,
        price: typeof i.price === 'object' ? (i.price as any)[currency] : i.price,
        quantity: i.quantity
      })),
      total,
      deliveryMethod,
      address: deliveryMethod === 'delivery' ? `${formData.address}, ${formData.city}, ${formData.zip}` : null,
      pickupAddressId: deliveryMethod === 'pickup' ? formData.pickupId : null,
      comment: formData.comment,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const orderId = await createOrder(orderData);
      
      // Create admin notification
      await createNotification({
        title: t('shop:checkout.newOrderToast'),
        message: `Клієнт ${formData.name} оформив замовлення на суму ${total} ${currency}.`,
        type: 'order',
        link: `/admin/orders`
      });

      // Send email
      await sendTransactional({
        to: formData.email,
        templateId: getTemplateId('ORDER_PLACED', language),
        params: {
          customerName: formData.name,
          orderNumber: orderId.slice(0, 8).toUpperCase(),
          orderItemsHtml: items.map(i => `${typeof i.name === 'object' ? pickLocale(i.name, language) : i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, currency, language)}`).join('\n'), 
          total: formatPrice(total, currency, language),
          deliveryInfo: deliveryMethod === 'delivery' 
            ? `${t('shop:checkout.deliveryAddress')}: ${orderData.address}` 
            : `${t('shop:checkout.pickupPoint')}: ${pickLocale(pickupPoints.find(p => p.id === formData.pickupId)?.label, language) || ''}`
        }
      });

      clearCart();
      navigate(`/order/${orderId}`);
      showToast({ message: t('shop:checkout.successToast'), type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: t('shop:checkout.errorToast'), type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />
      {orderLoading && <PageLoader />}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-farm-wood hover:text-farm-green transition-colors mb-12"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">{t('common:actions.back')}</span>
        </button>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-12">
            {/* Delivery Method */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm">
              <h2 className="text-2xl font-bold text-farm-green mb-8 flex items-center gap-3">
                <Truck className="w-6 h-6" /> {t('shop:checkout.deliveryMethod')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all",
                    deliveryMethod === 'delivery' ? "border-farm-green bg-farm-green/5" : "border-farm-wood/10 hover:border-farm-green/30"
                  )}
                >
                  <Truck className={cn("w-8 h-8", deliveryMethod === 'delivery' ? "text-farm-green" : "text-farm-wood/30")} />
                  <span className={cn("font-bold", deliveryMethod === 'delivery' ? "text-farm-green" : "text-farm-wood")}>{t('shop:checkout.delivery')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={cn(
                    "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all",
                    deliveryMethod === 'pickup' ? "border-farm-green bg-farm-green/5" : "border-farm-wood/10 hover:border-farm-green/30"
                  )}
                >
                  <Store className={cn("w-8 h-8", deliveryMethod === 'pickup' ? "text-farm-green" : "text-farm-wood/30")} />
                  <span className={cn("font-bold", deliveryMethod === 'pickup' ? "text-farm-green" : "text-farm-wood")}>{t('shop:checkout.pickup')}</span>
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm">
              <h2 className="text-2xl font-bold text-farm-green mb-8">{t('shop:checkout.contactInfo')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.name')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.phone')} *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+380..."
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Email</label>
                  <input
                    type="email"
                    readOnly
                    value={formData.email}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 bg-farm-cream/50 cursor-not-allowed opacity-70"
                  />
                </div>
              </div>
            </div>

            {/* Address / Pickup */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm">
              {deliveryMethod === 'delivery' ? (
                <>
                  <h2 className="text-2xl font-bold text-farm-green mb-8">{t('shop:checkout.deliveryAddress')}</h2>
                  {userAddresses.length > 0 && (
                    <div className="mb-8 p-4 bg-farm-green/5 rounded-2xl flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-farm-green/60 ml-2">{t('shop:checkout.selectSavedAddress')}</span>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {userAddresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleAddressSelect(addr)}
                            className="bg-white px-4 py-2 rounded-xl border border-farm-wood/10 text-xs font-bold hover:border-farm-green whitespace-nowrap"
                          >
                            {addr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.street')} *</label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.city')} *</label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.postalCode')} *</label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        value={formData.zip}
                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-farm-green mb-8">{t('shop:checkout.pickupPoint')}</h2>
                  {pickupPoints.length > 0 ? (
                    <div className="space-y-4">
                      {pickupPoints.map(point => (
                        <label
                          key={point.id}
                          className={cn(
                            "flex items-start gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all",
                            formData.pickupId === point.id ? "border-farm-green bg-farm-green/5" : "border-farm-wood/5 hover:border-farm-green/20"
                          )}
                        >
                          <input
                            type="radio"
                            name="pickup"
                            value={point.id}
                            required={deliveryMethod === 'pickup'}
                            checked={formData.pickupId === point.id}
                            onChange={e => setFormData({ ...formData, pickupId: e.target.value })}
                            className="mt-1 accent-farm-green"
                          />
                          <div>
                            <p className="font-bold text-farm-green">{pickLocale(point.label, language)}</p>
                            <p className="text-sm text-farm-wood opacity-70 mb-2">{pickLocale(point.address, language)}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-farm-wood/40">{t('shop:checkout.pickupSchedule')} {pickLocale(point.workingHours, language)}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-farm-wood opacity-50 italic">{t('shop:checkout.noPickupPoints')}</p>
                  )}
                </>
              )}

              <div className="mt-12">
                <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('shop:checkout.comment')}</label>
                <textarea
                  rows={3}
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-6 py-4 rounded-3xl border border-farm-wood/10 focus:border-farm-green focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl sticky top-32">
              <h2 className="text-2xl font-bold text-farm-green mb-8">{t('shop:checkout.yourOrder')}</h2>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.image || undefined} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-farm-green text-sm line-clamp-1">{typeof item.name === 'object' ? pickLocale(item.name, language) : item.name}</p>
                      <p className="text-xs text-farm-wood opacity-50">{item.quantity} × {formatPrice(item.price, currency, language)}</p>
                    </div>
                    <span className="font-bold text-farm-green text-sm">{formatPrice(item.quantity * item.price, currency, language)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-farm-wood/10">
                <div className="flex justify-between items-center mb-10">
                  <span className="text-farm-wood font-bold">{t('shop:checkout.total') || 'Разом'}:</span>
                  <span className="text-3xl font-bold text-farm-green">{formatPrice(total, currency, language)}</span>
                </div>

                <Button type="submit" size="lg" className="w-full py-6">
                  {t('shop:checkout.placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
