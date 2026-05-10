import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { FeaturedArticles } from '../components/FeaturedArticles';
import { SubscribeForm } from '../../newsletter/components/SubscribeForm';
import { useLandingSettings } from '../hooks/useLandingData';

export default function LandingPage() {
  const { settings, loading } = useLandingSettings();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScrollAndClearHash = () => {
      if (!loading && location.hash === '#about') {
        const element = document.getElementById('about');
        if (element) {
          // Delay slightly to ensure content is rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
            // Clear hash to prevent scroll on refresh without full re-render loop
            if (window.location.hash === '#about') {
              navigate('/', { replace: true });
            }
          }, 100);
        }
      }
    };

    handleScrollAndClearHash();
  }, [loading, location.hash, navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <HeroSection 
          title={settings?.hero.title || ''}
          subtitle={settings?.hero.subtitle || ''}
          ctaText={settings?.hero.ctaText || ''}
          imageUrl={settings?.hero.imageUrl}
          loading={loading}
        />
        
        <AboutSection 
          text={settings?.about.text || ''}
          imageUrl={settings?.about.imageUrl}
          loading={loading}
        />

        <section className="max-w-7xl mx-auto px-4">
          <FeaturedProducts />
        </section>

        <FeaturedArticles />

        <section className="py-24 max-w-7xl mx-auto px-4">
          <SubscribeForm />
        </section>
      </main>

      <footer className="bg-farm-green text-white py-12 mt-12 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Комора</h3>
            <p className="opacity-70 max-w-xs">
              Сімейна ферма, що створює натуральні продукти для вашого столу.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Навігація</h4>
            <ul className="space-y-2 opacity-70">
              <li><Link to="/shop">Магазин</Link></li>
              <li><Link to="/blog">Блог</Link></li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('about');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Про нас
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Контакти</h4>
            <p className="opacity-70 mb-2">olexandr.prykhodko@gmail.com</p>
            <p className="opacity-70">+38 (0XX) XXX-XX-XX</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-12 border-t border-white/10 text-center opacity-50 text-sm">
          © 2026 Комора. Всі права захищені.
        </div>
      </footer>
    </div>
  );
}
