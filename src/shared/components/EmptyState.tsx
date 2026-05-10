import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-farm-wood/20">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-farm-green mb-2">{title}</h3>
      {description && <p className="text-farm-wood max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
