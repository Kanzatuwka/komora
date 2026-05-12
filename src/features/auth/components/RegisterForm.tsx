import { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions';
import { Button } from '@/shared/components/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export function RegisterForm() {
  const { t } = useTranslation(['auth', 'common']);
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError(t('auth:register.passwordMin'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth:register.passwordsNoMatch'));
      return;
    }

    setLoading(true);
    try {
      await register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        language 
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl">
      <h2 className="text-3xl font-bold text-farm-green text-center mb-8">{t('auth:register.title')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:register.nameLabel')}</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:register.emailLabel')}</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:register.passwordLabel')}</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:register.confirmPasswordLabel')}</label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        
        <Button type="submit" isLoading={loading} className="w-full py-4 text-lg">
          {t('auth:register.submit')}
        </Button>
      </form>

      <p className="mt-8 text-center text-farm-wood/70 text-sm">
        {t('auth:register.hasAccount')} <Link to="/login" className="text-farm-green font-bold hover:underline">{t('auth:register.loginLink')}</Link>
      </p>
    </div>
  );
}
