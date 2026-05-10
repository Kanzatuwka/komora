import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-farm-green" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-farm-cream/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
      <Loader2 className="w-12 h-12 animate-spin text-farm-green mb-4" />
      <span className="text-farm-green font-medium animate-pulse">Завантаження...</span>
    </div>
  );
}
