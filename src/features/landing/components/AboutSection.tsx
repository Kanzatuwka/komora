import { Button } from '@/shared/components/Button';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  text: string;
  imageUrl?: string;
  loading?: boolean;
}

export function AboutSection({ text, imageUrl, loading }: AboutProps) {
  const { t, i18n } = useTranslation('landing');

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="h-64 bg-farm-wood/10 animate-pulse rounded-2xl" />
        <div className="h-64 bg-farm-wood/10 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <section id="about" className="py-24 max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-farm-green mb-8">{t('about.title')}</h2>
          <p className="text-lg text-farm-wood leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-farm-green/5 rounded-[2rem] -rotate-3" />
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1590779033100-9f60705a2d3d?auto=format&fit=crop&q=80'} 
            alt="Artisanal Preserves" 
            className="relative rounded-[2rem] shadow-xl w-full h-[500px] object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
