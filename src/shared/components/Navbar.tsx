import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Settings, Globe, CircleDollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const { user, role } = useAuth();
  const { count } = useCart();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSwitchers, setShowSwitchers] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAboutClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigation will happen naturally to /#about
      // but we might want to ensure it works
      navigate('/#about');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? "bg-transparent py-4 shadow-none" 
        : "bg-white/95 backdrop-blur-md py-6 shadow-md border-b border-farm-green/10"
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500">
        <Link to="/" className="text-2xl font-bold text-farm-green flex items-center gap-2">
          <span className="bg-farm-green text-farm-cream w-8 h-8 rounded-lg flex items-center justify-center">К</span>
          Комора
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/shop" className="font-medium hover:text-farm-green transition-colors">{t('nav.shop')}</Link>
          <Link to="/blog" className="font-medium hover:text-farm-green transition-colors">{t('nav.blog')}</Link>
          <button 
            onClick={handleAboutClick}
            className="font-medium hover:text-farm-green transition-colors"
          >
            {t('nav.about')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>

          <Link to="/cart" className="relative p-2 hover:bg-farm-green/10 rounded-full transition-colors">
            <ShoppingCart className="w-6 h-6 text-farm-green" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-farm-berry text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-farm-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link to={role === 'admin' ? '/admin' : '/account'} className="p-2 hover:bg-farm-green/10 rounded-full transition-colors">
                <User className="w-6 h-6 text-farm-green" />
              </Link>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="outline" size="sm">{t('nav.login')}</Button>
            </Link>
          )}

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-farm-cream border-t border-farm-wood/10 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-6">
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold">{t('nav.shop')}</Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold">{t('nav.blog')}</Link>
              <button 
                onClick={handleAboutClick}
                className="text-xl font-bold text-left"
              >
                {t('nav.about')}
              </button>
              
              <div className="flex gap-4 pt-4 border-t border-farm-wood/10">
                <LanguageSwitcher />
                <CurrencySwitcher />
              </div>

              {user ? (
                <Link 
                  to={role === 'admin' ? '/admin' : '/account'} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="flex items-center gap-2 text-lg font-bold text-farm-green mt-2"
                >
                  <User className="w-5 h-5" /> {role === 'admin' ? 'Панель керування' : t('nav.account')}
                </Link>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">{t('nav.login')}</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
