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
import { sendTransactional } from '@/shared/lib/brevo';
import { useNotifications } from '@/features/admin/hooks/useNotifications';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const { createOrder, loading: orderLoading } = useCreateOrder();
  const { addresses: pickupPoints } = usePickupAddresses();
  const { addresses: userAddresses } = useUserAddresses(user?.uid || '');
  const { createNotification } = useNotifications();

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
      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      })),
      total,
      deliveryMethod,
      address: deliveryMethod === 'delivery' ? `${formData.address}, ${formData.city}, ${formData.zip}` : null,
      pickupAddressId: deliveryMethod === 'pickup' ? formData.pickupId : null,
      comment: formData.comment,
    };

    try {
      const orderId = await createOrder(orderData);
      
      // Create admin notification
      await createNotification({
        title: 'Нове замовлення!',
        message: `Клієнт ${formData.name} оформив замовлення на суму ${total} грн.`,
        type: 'order',
        link: `/admin/orders`
      });

      // Send email
      await sendTransactional({
        to: formData.email,
        templateId: Number(import.meta.env.VITE_BREVO_ORDER_PLACED_TEMPLATE_ID),
        params: {
          customerName: formData.name,
          orderNumber: orderId.slice(0, 8).toUpperCase(),
          orderItemsHtml: items.map(i => `${i.name} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} грн`).join('\n'),
          total: total.toFixed(2),
          deliveryInfo: deliveryMethod === 'delivery' 
            ? `Доставка: ${orderData.address}` 
            : `Самовивіз: ${pickupPoints.find(p => p.id === formData.pickupId)?.label || ''}`
        }
      });

      clearCart();
      navigate(`/order/${orderId}`);
      showToast({ message: 'Замовлення успішно оформлено!', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: 'Сталася помилка при оформленні. Спробуйте ще раз.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />
      {orderLoading && <PageLoader />}

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-farm-wood hover:text-farm-green transition-colors mb-12"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-bold">Назад</span>
        </button>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2 space-y-12">
            {/* Delivery Method */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm">
              <h2 className="text-2xl font-bold text-farm-green mb-8 flex items-center gap-3">
                <Truck className="w-6 h-6" /> Спосіб отримання
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
                  <span className={cn("font-bold", deliveryMethod === 'delivery' ? "text-farm-green" : "text-farm-wood")}>Доставка кур'єром</span>
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
                  <span className={cn("font-bold", deliveryMethod === 'pickup' ? "text-farm-green" : "text-farm-wood")}>Самовивіз</span>
                </button>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm">
              <h2 className="text-2xl font-bold text-farm-green mb-8">Контактні дані</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Ваше ім'я *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Телефон *</label>
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
                  <h2 className="text-2xl font-bold text-farm-green mb-8">Адреса доставки</h2>
                  {userAddresses.length > 0 && (
                    <div className="mb-8 p-4 bg-farm-green/5 rounded-2xl flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-farm-green/60 ml-2">Вибрати збережену:</span>
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
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Вулиця та номер будинку *</label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Місто *</label>
                      <input
                        type="text"
                        required={deliveryMethod === 'delivery'}
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Поштовий індекс *</label>
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
                  <h2 className="text-2xl font-bold text-farm-green mb-8">Точка самовивозу</h2>
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
                            <p className="font-bold text-farm-green">{point.label}</p>
                            <p className="text-sm text-farm-wood opacity-70 mb-2">{point.address}</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-farm-wood/40">Графік: {point.workingHours}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-farm-wood opacity-50 italic">Точки самовивозу поки що не додані.</p>
                  )}
                </>
              )}

              <div className="mt-12">
                <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">Коментар до замовлення</label>
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
              <h2 className="text-2xl font-bold text-farm-green mb-8">Ваше замовлення</h2>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.image || undefined} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-farm-green text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-farm-wood opacity-50">{item.quantity} × {item.price} грн</p>
                    </div>
                    <span className="font-bold text-farm-green text-sm">{item.quantity * item.price} грн</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-farm-wood/10">
                <div className="flex justify-between items-center mb-10">
                  <span className="text-farm-wood font-bold">Разом:</span>
                  <span className="text-3xl font-bold text-farm-green">{total} грн</span>
                </div>

                <Button type="submit" size="lg" className="w-full py-6">
                  Замовити зараз
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
