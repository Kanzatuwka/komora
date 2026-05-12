import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Loader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-farm-green" />
    </div>
  );
}

export function PageLoader() {
  const { t, i18n } = useTranslation('common');
  return (
    <div className="fixed inset-0 bg-farm-cream/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
      <Loader2 className="w-12 h-12 animate-spin text-farm-green mb-4" />
      <span className="text-farm-green font-medium animate-pulse">{t('actions.loading')}</span>
    </div>
  );
}
