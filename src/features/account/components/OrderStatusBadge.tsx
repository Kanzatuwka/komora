import { cn } from '@/shared/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new:        { label: 'Нове',         className: 'bg-blue-100 text-blue-800' },
  confirmed:  { label: 'Підтверджено', className: 'bg-yellow-100 text-yellow-800' },
  in_transit: { label: 'В дорозі',     className: 'bg-orange-100 text-orange-800' },
  delivered:  { label: 'Доставлено',   className: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Скасовано',    className: 'bg-red-100 text-red-800' },
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
