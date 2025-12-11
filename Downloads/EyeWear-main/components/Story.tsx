import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const Story: React.FC = () => {
  const features = [
    { icon: <ShieldCheck className="w-6 h-6 text-gold-500" />, title: "Certified Optometrists", text: "Expert care for your vision health." },
    { icon: <Sparkles className="w-6 h-6 text-gold-500" />, title: "Premium Lens Tech", text: "Japanese engineered glass for perfect clarity." },
    { icon: <CheckCircle2 className="w-6 h-6 text-gold-500" />, title: "Custom Fitting", text: "Frames adjusted to your unique facial structure." },
    { icon: <Eye className="w-6 h-6 text-gold-500" />, title: "After-Sales Care", text: "Lifetime maintenance and adjustment support." },
  ];

  return (
    <section id="story" className="py-24 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Where Design Meets <br />Eye Health</h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              At AIMOPTIC, we believe eyewear is more than just a medical necessity—it's an extension of your personality. We merge cutting-edge optical technology with avant-garde aesthetics to create frames that not only help you see better but make you look iconic.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-black/5 p-3 rounded-full">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative h-[600px]"
          >
            <div className="absolute inset-0 bg-gray-200 rounded-sm overflow-hidden">
                <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1600&auto=format&fit=crop" 
                    alt="Craftsmanship" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-10 -left-10 bg-black text-white p-8 max-w-xs shadow-2xl hidden md:block">
                <p className="font-serif italic text-xl">"Precision is not an act, it is a habit."</p>
                <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-gold-500"></div>
                    <span className="text-xs uppercase tracking-widest text-gold-500">AIMOPTIC Studio</span>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Story;