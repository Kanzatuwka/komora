import { useState } from 'react';
import { useSubscribe } from '../hooks/useSubscribe';
import { Button } from '@/shared/components/Button';
import { useTranslation } from 'react-i18next';

export function SubscribeForm() {
  const { t } = useTranslation(['newsletter', 'landing', 'common']);
  const [email, setEmail] = useState('');
  const { subscribe, loading } = useSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await subscribe(email);
    if (success) setEmail('');
  };

  return (
    <div className="bg-white/40 p-8 rounded-[3rem] border border-white/50 backdrop-blur-md">
      <h3 className="text-2xl font-bold text-farm-green mb-4">{t('newsletter:subscribe.title')}</h3>
      <p className="text-farm-wood mb-8 opacity-80">
        {t('newsletter:subscribe.description')}
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          required
          placeholder={t('newsletter:subscribe.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-6 py-4 rounded-full bg-white border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
        />
        <Button type="submit" isLoading={loading} className="px-8 shrink-0">
          {t('newsletter:subscribe.submit')}
        </Button>
      </form>
    </div>
  );
}
