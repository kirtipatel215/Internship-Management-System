import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const categories = [
  {
    title: "Sunglasses",
    desc: "Outdoor Performance",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
    offset: "0"
  },
  {
    title: "Optical",
    desc: "Daily Comfort & Clarity",
    image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1000&auto=format&fit=crop",
    offset: "20px"
  },
  {
    title: "Blue-Light",
    desc: "Screen Protection",
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop",
    offset: "40px"
  }
];

const Collections: React.FC = () => {
  return (
    <section id="collections" className="py-24 bg-luxury-gray text-white">
      <div className="container mx-auto px-6">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">The Right Lens for Every Lifestyle</h2>
          <p className="text-gray-400">Curated collections designed for specific visual needs.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group relative cursor-pointer"
            >
              <div className="relative h-[500px] w-full overflow-hidden bg-black">
                <ImageWithFallback 
                  src={cat.image} 
                  alt={cat.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                
                {/* 3D Mock Hover Effect Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="bg-white text-black px-6 py-3 rounded-full uppercase text-xs font-bold tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        View Collection <ArrowUpRight className="w-4 h-4" />
                    </span>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-end border-b border-white/20 pb-4 group-hover:border-gold-500 transition-colors">
                <div>
                  <h3 className="text-2xl font-bold">{cat.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{cat.desc}</p>
                </div>
                <span className="text-2xl font-light text-gray-500 group-hover:text-gold-500 transition-colors">0{idx + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;