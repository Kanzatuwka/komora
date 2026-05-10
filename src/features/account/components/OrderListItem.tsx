import { Link } from 'react-router-dom';
import { Package, Clock, Truck, Store, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderListItemProps {
  order: any;
}

export function OrderListItem({ order }: OrderListItemProps) {
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
            {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'd MMMM yyyy', { locale: uk }) : '...'}
          </span>
          <span className="flex items-center gap-1">
            {order.deliveryMethod === 'delivery' ? <Truck className="w-3 h-3" /> : <Store className="w-3 h-3" />} 
            {order.deliveryMethod === 'delivery' ? 'Кур\'єр' : 'Самовивіз'}
          </span>
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-farm-green mb-1">{order.total} грн</p>
        <span className="text-xs text-farm-wood/40 flex items-center gap-1 justify-end group-hover:text-farm-berry transition-colors">
          Деталі <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
