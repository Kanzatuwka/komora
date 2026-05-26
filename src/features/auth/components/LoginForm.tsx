import { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions';
import { Button } from '@/shared/components/Button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function LoginForm() {
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || t('auth:login.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl">
      <h2 className="text-3xl font-bold text-farm-green text-center mb-8">{t('auth:login.title')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:login.emailLabel')}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-farm-wood mb-1 ml-4">{t('auth:login.passwordLabel')}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-3 rounded-full border border-farm-wood/20 focus:outline-none focus:border-farm-green transition-colors"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        
        <Button type="submit" isLoading={loading} className="w-full py-4 text-lg">
          {t('auth:login.submit')}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-farm-wood/10" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-farm-wood/50">{t('auth:login.or')}</span></div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={loginWithGoogle} 
        className="w-full py-4 flex items-center justify-center gap-3 border-farm-wood/20 text-farm-wood hover:bg-black/5"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t('auth:login.google')}
      </Button>

      <p className="mt-8 text-center text-farm-wood/70 text-sm">
        {t('auth:login.noAccount')} <Link to="/register" className="text-farm-green font-bold hover:underline">{t('auth:login.registerLink')}</Link>
      </p>
    </div>
  );
}
