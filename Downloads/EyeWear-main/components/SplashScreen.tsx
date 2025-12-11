import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        const diff = 100 - prev;
        // Slow down as we get closer to 100
        const inc = Math.max(1, Math.floor(Math.random() * (diff / 3)));
        const next = prev + inc;
        
        if (next >= 98) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Hold 100% for a brief moment before triggering completion
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        y: -20, 
        transition: { duration: 0.8, ease: "easeInOut" } 
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 mb-12"
      >
        <Logo variant="gold" className="w-64 md:w-80" />
      </motion.div>
      
      {/* Minimal Progress Bar */}
      <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
        <motion.div 
            className="absolute left-0 top-0 h-full bg-gold-500 shadow-[0_0_15px_rgba(197,160,89,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
        />
      </div>

      <div className="mt-6 flex justify-between w-64 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-mono">
         <span>Loading Experience</span>
         <span className="text-gold-500">{progress}%</span>
      </div>
    </motion.div>
  );
};

export default SplashScreen;