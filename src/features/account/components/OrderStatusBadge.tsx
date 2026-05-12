import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const { t } = useTranslation('account');
  
  const statusColors: Record<string, string> = {
    new:        'bg-blue-100 text-blue-800',
    confirmed:  'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
  };
  
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
      colorClass,
      className
    )}>
      {t(`orderStatus.${status}`, { defaultValue: status })}
    </span>
  );
}
