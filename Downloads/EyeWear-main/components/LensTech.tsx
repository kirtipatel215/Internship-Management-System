import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Droplets, Monitor, Sparkles } from 'lucide-react';

const features = [
  { 
    id: 'blue',
    title: "Blue-Light Filter", 
    desc: "Blocks 98% of harmful high-energy blue light from digital screens, reducing eye strain.",
    icon: <Monitor className="w-5 h-5" />
  },
  { 
    id: 'glare',
    title: "Anti-Glare Coating", 
    desc: "Advanced multi-layer coating eliminates reflections for crystal clear vision.",
    icon: <Sparkles className="w-5 h-5" />
  },
  { 
    id: 'uv',
    title: "UV-400 Protection", 
    desc: "Full spectrum protection against UVA and UVB rays, preserving long-term eye health.",
    icon: <Sun className="w-5 h-5" />
  },
  { 
    id: 'hydro',
    title: "Hydrophobic & Durable", 
    desc: "Double-hardened coating that resists scratches, smudges, and repels water instantly.",
    icon: <Droplets className="w-5 h-5" />
  }
];

const TechVisualizer = ({ featureId }: { featureId: string }) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-900 rounded-2xl flex items-center justify-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />

      {/* Feature: Blue Light Filter */}
      {featureId === 'blue' && (
        <>
          <div className="absolute inset-0 bg-blue-900/40 z-0 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(59,130,246,0.3)_0%,_transparent_70%)]" />
          </div>
          {/* Digital Rays */}
          {[...Array(5)].map((_, i) => (
             <motion.div 
                key={i}
                className="absolute top-0 w-[2px] h-full bg-blue-400/30"
                style={{ left: `${20 + i * 15}%` }}
                animate={{ opacity: [0.2, 0.6, 0.2], height: ['100%', '80%', '100%'] }}
                transition={{ duration: 2 + i, repeat: Infinity }}
             />
          ))}
          {/* The Lens */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 rounded-full border-[6px] border-white/10 backdrop-blur-md bg-amber-500/10 z-10 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/5 to-transparent pointer-events-none" />
             <span className="text-amber-100 font-bold text-lg tracking-widest uppercase opacity-80 z-20">Filtered</span>
          </motion.div>
        </>
      )}

      {/* Feature: Anti-Glare */}
      {featureId === 'glare' && (
        <>
          {/* Blurry Background (Simulating Glare) */}
          <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-8 opacity-50 filter blur-sm">
             <div className="w-20 h-20 rounded-full bg-white animate-pulse" />
             <div className="w-16 h-16 rounded-full bg-yellow-100 animate-pulse delay-75" />
             <div className="w-24 h-24 rounded-full bg-white/80 animate-pulse delay-150" />
          </div>
          
          {/* The Lens (Sharp View) */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 h-64 rounded-full border-[6px] border-white/10 z-10 flex items-center justify-center relative bg-black/40 backdrop-contrast-125 shadow-2xl overflow-hidden"
          >
             {/* Sharp Lights inside Lens */}
             <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-8">
                <div className="w-20 h-20 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
                <div className="w-16 h-16 rounded-full bg-yellow-100 shadow-[0_0_15px_rgba(253,224,71,0.6)]" />
                <div className="w-24 h-24 rounded-full bg-white/90 shadow-[0_0_25px_rgba(255,255,255,0.7)]" />
             </div>
             <div className="absolute bottom-6 text-white text-xs uppercase tracking-[0.3em]">No Glare</div>
          </motion.div>
        </>
      )}

      {/* Feature: UV Protection */}
      {featureId === 'uv' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-orange-400/20 to-yellow-300/20" />
          {/* Sun */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 w-64 h-64 text-yellow-500 opacity-20"
          >
             <Sun className="w-full h-full" />
          </motion.div>
          
          {/* UV Rays */}
          {[...Array(6)].map((_, i) => (
             <motion.div 
                key={i}
                className="absolute top-0 right-0 h-[2px] bg-yellow-400 origin-right"
                style={{ width: '60%', top: `${20 + i * 10}%`, rotate: '15deg' }}
                animate={{ x: [-20, 0, -20], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
             />
          ))}

          {/* The Lens (Darkened) */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-64 h-64 rounded-full border-[6px] border-gray-700 bg-black/80 z-10 flex items-center justify-center shadow-2xl backdrop-blur-sm"
          >
             <div className="text-center">
               <div className="text-4xl font-bold text-white mb-1">UV400</div>
               <div className="text-[10px] text-gray-400 uppercase tracking-widest">Protection</div>
             </div>
          </motion.div>
        </>
      )}

      {/* Feature: Hydrophobic */}
      {featureId === 'hydro' && (
        <>
          <div className="absolute inset-0 bg-gray-800" />
          
          {/* Water Drops Background (Slow/Stuck) */}
          <div className="absolute inset-0 opacity-30">
             <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-blue-300 blur-[1px]" />
             <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-blue-300 blur-[1px]" />
          </div>

          {/* The Lens */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-64 h-64 rounded-full border-[6px] border-white/10 bg-gradient-to-br from-white/5 to-white/0 z-10 flex items-center justify-center relative overflow-hidden backdrop-blur-sm"
          >
             {/* Fast sliding drops */}
             {[...Array(4)].map((_, i) => (
               <motion.div
                  key={i}
                  className="absolute w-4 h-6 bg-blue-400 rounded-full opacity-80 shadow-md"
                  style={{ left: `${30 + i * 15}%` }}
                  animate={{ top: ['-20%', '120%'] }}
                  transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeIn", delay: Math.random() }}
               />
             ))}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/10 pointer-events-none" />
          </motion.div>
        </>
      )}

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
         <span className="text-[10px] text-white/40 uppercase tracking-widest">Simulation</span>
      </div>
    </div>
  );
};

const LensTech: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="lens-tech" className="py-24 bg-white text-black overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 max-w-3xl">
          <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">Engineering</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Inside the Lens: <br/>Technology You Can Feel</h2>
          <p className="text-gray-600 text-lg">Interact with our proprietary lens technology to see the difference.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-12">
            {/* Visualisation Area */}
            <div className="w-full lg:w-1/2 min-h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full shadow-2xl rounded-2xl overflow-hidden"
                  >
                    <TechVisualizer featureId={features[activeFeature].id} />
                  </motion.div>
                </AnimatePresence>
            </div>

            {/* Features List */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4">
                {features.map((feature, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border group ${
                          activeFeature === i 
                            ? 'bg-luxury-black text-white border-black shadow-xl translate-x-2' 
                            : 'bg-transparent hover:bg-gray-50 border-gray-100 text-gray-500 hover:text-black'
                        }`}
                        onMouseEnter={() => setActiveFeature(i)}
                    >
                        <div className="flex items-center gap-4 mb-2">
                           <div className={`p-2 rounded-full ${activeFeature === i ? 'bg-gold-500 text-black' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                             {feature.icon}
                           </div>
                           <h3 className={`text-xl font-bold ${activeFeature === i ? 'text-white' : ''}`}>
                             {feature.title}
                           </h3>
                        </div>
                        <p className={`text-sm leading-relaxed pl-[3.25rem] ${activeFeature === i ? 'text-gray-300' : 'text-gray-500'}`}>
                          {feature.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default LensTech;