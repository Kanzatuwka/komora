import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/shared/components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { FeaturedArticles } from '../components/FeaturedArticles';
import { SubscribeForm } from '../../newsletter/components/SubscribeForm';
import { useLandingSettings } from '../hooks/useLandingData';
import { Footer } from '@/shared/components/Footer';

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

      <Footer />
    </div>
  );
}
