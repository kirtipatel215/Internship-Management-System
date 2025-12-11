import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

const HeroVideo: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <section id="hero-video" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
      {/* Cinematic Background - Simulating Video with High Quality Image + Motion */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=2660&auto=format&fit=crop" 
          alt="Cinematic Eyewear Lifestyle" 
          className="w-full h-full object-cover"
          loading="eager" // Hero image should load eagerly
        />
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
        >
          See the World in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">Ultra Clarity.</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light drop-shadow-md"
        >
          Premium sunglasses, power eyewear & blue-light lenses engineered for the modern visionary. Experience precision like never before.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <button className="bg-gold-500 hover:bg-gold-600 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg">
            Book Free Eye Test
          </button>
          <button className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-lg backdrop-blur-sm">
            Explore Collection
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroVideo;