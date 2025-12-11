import React from 'react';
import { motion } from 'framer-motion';

const BrandMarquee: React.FC = () => {
  // Repeated text to ensure seamless loop
  const content = [
    "AIMOPTIC STUDIO",
    "PREMIUM CHASMA COLLECTION",
    "POWER GLASSES",
    "BLUE LIGHT PROTECTION",
    "DESIGNER SUNGLASSES",
    "PRECISION OPTICS"
  ];

  return (
    <div className="bg-gold-500 py-4 overflow-hidden relative z-20 border-y border-gold-700">
      <div className="flex whitespace-nowrap overflow-hidden">
        <motion.div
          className="flex gap-16 items-center"
          animate={{ x: "-50%" }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {/* Render content multiple times to fill screen and allow smooth looping */}
          {[...content, ...content, ...content, ...content].map((text, i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-black font-bold tracking-[0.2em] text-sm md:text-base uppercase flex items-center">
                {text}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandMarquee;