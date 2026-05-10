import { Button } from '@/shared/components/Button';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  imageUrl?: string;
  loading?: boolean;
}

export function HeroSection({ title, subtitle, ctaText, imageUrl, loading }: HeroProps) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-[80vh] w-full bg-farm-wood/10 animate-pulse rounded-3xl" />;
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden rounded-b-[4rem]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'} 
          alt="Artisanal Pantry" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            onClick={() => navigate('/shop')} 
            size="lg"
            className="bg-farm-green hover:bg-farm-green/90 px-12"
          >
            {ctaText}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
