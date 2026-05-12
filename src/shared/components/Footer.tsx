import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('common');

  const handleAboutClick = () => {
    if (window.location.pathname === '/') {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#about';
    }
  };

  return (
    <footer className="bg-farm-green text-white py-16 mt-24 rounded-t-[4rem] shadow-2xl relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-1">
          <Link to="/" className="text-3xl font-bold mb-6 block">Комора</Link>
          <p className="opacity-70 text-sm leading-relaxed max-w-xs">
            {t('footer.aboutText')}
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-farm-cream">{t('footer.navTitle')}</h4>
          <ul className="space-y-3 font-medium text-sm">
            <li><Link to="/shop" className="hover:text-farm-cream transition-colors">{t('nav.shop')}</Link></li>
            <li><Link to="/blog" className="hover:text-farm-cream transition-colors">{t('nav.blog')}</Link></li>
            <li>
              <button 
                onClick={handleAboutClick}
                className="hover:text-farm-cream transition-colors text-left"
              >
                {t('nav.about')}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-farm-cream">{t('footer.legalTitle')}</h4>
          <ul className="space-y-3 font-medium text-sm">
            <li><Link to="/privacy" className="hover:text-farm-cream transition-colors">{t('footer.privacy')}</Link></li>
            <li><Link to="/terms" className="hover:text-farm-cream transition-colors">{t('footer.terms')}</Link></li>
            <li><Link to="/delivery" className="hover:text-farm-cream transition-colors">{t('footer.delivery')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-farm-cream">{t('footer.contactTitle')}</h4>
          <ul className="space-y-3 font-medium text-sm opacity-70">
            <li className="break-all">olexandr.prykhodko@gmail.com</li>
            <li>+38 (0XX) XXX-XX-XX</li>
            <li className="pt-4 flex gap-4">
              {/* Social icons could go here */}
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-12 border-t border-white/5 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">
        © 2026 Комора. {t('footer.allRightsReserved')}
      </div>
    </footer>
  );
}
