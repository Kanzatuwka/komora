import { Link } from 'react-router-dom';
import { Package, Clock, Truck, Store, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListItemProps {
  order: any;
}

export function OrderListItem({ order }: OrderListItemProps) {
  const { t } = useTranslation(['account', 'shop', 'common']);
  const { language } = useLanguage();

  return (
    <Link 
      to={`/account/orders/${order.id}`}
      className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6 group"
    >
      <div className="w-16 h-16 bg-farm-cream rounded-2xl flex items-center justify-center text-farm-green shrink-0">
        <Package className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-bold text-farm-green">#{order.id.slice(0, 8).toUpperCase()}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-farm-wood opacity-50 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> 
            {order.createdAt ? formatDate(order.createdAt, language) : '...'}
          </span>
          <span className="flex items-center gap-1">
            {order.deliveryMethod === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />} 
            {order.deliveryMethod === 'delivery' ? t('shop:orderConfirmation.courierDelivery') : t('shop:orderConfirmation.pickup')}
          </span>
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-farm-green mb-1">{formatPrice(order.total, order.currency, language)}</p>
        <span className="text-xs text-farm-wood/40 flex items-center gap-1 justify-end group-hover:text-farm-berry transition-colors">
          {t('common:details')} <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
