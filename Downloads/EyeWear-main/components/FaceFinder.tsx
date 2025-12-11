import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceShape, Product } from '../types';
import { ArrowRight, ScanFace, Check, Sparkles, Sun, Monitor, Shield, Info, ExternalLink } from 'lucide-react';
import GlassFrame from './GlassFrame';

// --- DATA ---
const shapeRecommendations: Record<FaceShape, string[]> = {
  [FaceShape.ROUND]: ['Square', 'Rectangular', 'Geometric'],
  [FaceShape.OVAL]: ['Aviator', 'Square', 'Round', 'Wayfarer'],
  [FaceShape.SQUARE]: ['Round', 'Oval', 'Cat-Eye', 'Aviator'],
  [FaceShape.HEART]: ['Aviator', 'Round', 'Wayfarer', 'Cat-Eye'],
};

// Merged Product Data (No Prices, Real Images)
const allProducts: Product[] = [
  { 
    id: 1, name: "The Maverick", style: "Aviator Classic", brandInspiration: "Ray-Ban Aviator", price: "", shape: "Aviator", color: "#C5A059",
    features: ["Polarized", "UV400", "Anti-Glare"],
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
    description: "The Maverick redefines the classic pilot shape with a modern gold-tone finish. Designed for the bold, these frames feature ultra-lightweight titanium construction and premium polarized lenses that cut glare without compromising clarity."
  },
  { 
    id: 2, name: "Wayfarer Legacy", style: "Iconic Square", brandInspiration: "Ray-Ban Wayfarer", price: "", shape: "Wayfarer", color: "#000000",
    features: ["Impact Resistant", "UV400"],
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop",
    description: "A timeless icon reborn. The Wayfarer Legacy features hand-polished black acetate and our signature impact-resistant lenses. Perfect for any occasion, from the boardroom to the beach."
  },
  { 
    id: 3, name: "Clubmaster Elite", style: "Browline", brandInspiration: "Ray-Ban Clubmaster", price: "", shape: "Rectangular", color: "#4B3621",
    features: ["Blue-Light Filter", "Anti-Reflective"],
    image: "https://images.unsplash.com/photo-1570222094114-28a9d88a2b64?q=80&w=1000&auto=format&fit=crop",
    description: "Intellectual chic meets modern tech. The Clubmaster Elite combines vintage browline aesthetics with advanced blue-light filtering technology, making it the ultimate accessory for the digital professional."
  },
  { 
    id: 4, name: "Holbrook Sport", style: "Active Square", brandInspiration: "Oakley Holbrook", price: "", shape: "Square", color: "#333333",
    features: ["Lightweight", "Polarized", "Sport Grip"],
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1000&auto=format&fit=crop",
    description: "Engineered for performance. The Holbrook Sport offers a secure fit with specialized grip pads and stress-resistant frame material, ensuring they stay in place during your most intense activities."
  },
  { 
    id: 5, name: "Persol 649", style: "Vintage Pilot", brandInspiration: "Persol", price: "", shape: "Aviator", color: "#5C4033",
    features: ["Crystal Lenses", "Handmade", "Anti-Glare"],
    image: "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 6, name: "Symbole Bold", style: "Geometric Thick", brandInspiration: "Prada Symbole", price: "", shape: "Geometric", color: "#111111",
    features: ["High-Index", "UV400", "Luxury Acetate"],
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 7, name: "Biggie Shade", style: "Oversized Hex", brandInspiration: "Versace", price: "", shape: "Rectangular", color: "#000000",
    features: ["Wide Fit", "Gradient Lens"],
    image: "https://images.unsplash.com/photo-1534030347209-7147fd69a394?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 8, name: "Gucci Oversized", style: "Luxury Square", brandInspiration: "Gucci", price: "", shape: "Square", color: "#552200",
    features: ["Gradient Lens", "UV Protection"],
    image: "https://images.unsplash.com/photo-1582142407894-ec85f1260a46?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 9, name: "Snowdon Bond", style: "Classic Soft Square", brandInspiration: "Tom Ford", price: "", shape: "Wayfarer", color: "#000000",
    features: ["Blue-Block", "Anti-Static"],
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 10, name: "Gregory Round", style: "Intellectual Round", brandInspiration: "Oliver Peoples", price: "", shape: "Round", color: "#964B00",
    features: ["Photochromic", "Anti-Reflective"],
    image: "https://images.unsplash.com/photo-1559533358-009139281a17?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 11, name: "Lemtosh Vintage", style: "Acetate Round", brandInspiration: "Moscot", price: "", shape: "Round", color: "#000000",
    features: ["Handcrafted", "Tinted"],
    image: "https://images.unsplash.com/photo-1625591348639-b94f1c93a8e9?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 12, name: "Santos Pilot", style: "Luxury Metal", brandInspiration: "Cartier", price: "", shape: "Aviator", color: "#C0C0C0",
    features: ["Precious Metal", "Polarized", "Anti-Scratch"],
    image: "https://images.unsplash.com/photo-1614715838608-dd527c2dc9d1?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 13, name: "Mach-Six", style: "Tech Aviator", brandInspiration: "Dita", price: "", shape: "Geometric", color: "#1F1F1F",
    features: ["Titanium", "Hydrophobic"],
    image: "https://images.unsplash.com/photo-1570222094114-28a9d88a2b64?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 14, name: "Lilit Flat", style: "Korean Minimal", brandInspiration: "Gentle Monster", price: "", shape: "Rectangular", color: "#000000",
    features: ["Flat Lens", "UV400", "Blue-Light"],
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 15, name: "Burberry Check", style: "Modern Rect", brandInspiration: "Burberry", price: "", shape: "Rectangular", color: "#333333",
    features: ["Scratch Resistant", "Classic Fit"],
    image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 16, name: "Mica Cat-Eye", style: "Sharp Cat-Eye", brandInspiration: "Saint Laurent", price: "", shape: "Cat-Eye", color: "#000000",
    features: ["Nylon Lens", "100% UV Protection"],
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 17, name: "Triomphe Oval", style: "Retro Oval", brandInspiration: "Celine", price: "", shape: "Oval", color: "#FFFFFF",
    features: ["Fashion Tint", "Anti-Glare"],
    image: "https://images.unsplash.com/photo-1597196526281-91efc16f0363?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 18, name: "Chanel Sig", style: "Elegant Rect", brandInspiration: "Chanel", price: "", shape: "Rectangular", color: "#000000",
    features: ["Polarized", "Pearl Detail"],
    image: "https://images.unsplash.com/photo-1505535162959-9bbcb4fe3bbc?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 19, name: "Montaigne 30", style: "Boxy Oversized", brandInspiration: "Dior", price: "", shape: "Square", color: "#000000",
    features: ["Oversized", "Gradient"],
    image: "https://images.unsplash.com/photo-1604782666037-3c63d5005229?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: 20, name: "Carrera Champ", style: "Sport Aviator", brandInspiration: "Carrera", price: "", shape: "Aviator", color: "#800000",
    features: ["Polycarbonate", "Sport Fit"],
    image: "https://images.unsplash.com/photo-1614715838608-dd527c2dc9d1?q=80&w=1000&auto=format&fit=crop"
  }
];

interface FaceFinderProps {
  initialFrameShape?: string | null;
  onProductSelect: (product: Product) => void;
}

const FaceFinder: React.FC<FaceFinderProps> = ({ initialFrameShape, onProductSelect }) => {
  const [selectedFaceShape, setSelectedFaceShape] = useState<FaceShape>(FaceShape.OVAL);
  const [activeFrameFilter, setActiveFrameFilter] = useState<string | null>(null);

  useEffect(() => {
    if (initialFrameShape) {
      setActiveFrameFilter(initialFrameShape);
    } else {
      const defaults = shapeRecommendations[selectedFaceShape];
      if (defaults && defaults.length > 0) {
        setActiveFrameFilter(defaults[0]);
      }
    }
  }, [initialFrameShape, selectedFaceShape]);

  const visibleProducts = activeFrameFilter 
    ? allProducts.filter(p => p.shape === activeFrameFilter)
    : [];

  const getFeatureIcon = (feature: string) => {
    const lower = feature.toLowerCase();
    if (lower.includes('uv')) return <Sun className="w-3 h-3" />;
    if (lower.includes('blue')) return <Monitor className="w-3 h-3" />;
    if (lower.includes('scratch') || lower.includes('impact') || lower.includes('titanium')) return <Shield className="w-3 h-3" />;
    return <Info className="w-3 h-3" />;
  };

  return (
    <section id="finder" className="py-24 bg-luxury-charcoal text-white relative overflow-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-luxury-black to-black opacity-50 z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-gold-500 mb-4">
                    <ScanFace className="w-6 h-6" />
                    <span className="text-sm font-bold tracking-widest uppercase">Stylist Algorithm</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-4">Find Frames That <br/>Fit Your Face</h2>
                <p className="text-gray-400 text-lg">Select your face shape to unlock our curated recommendations. Click a card to view full details.</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
            {Object.values(FaceShape).map((shape) => (
                <button
                key={shape}
                onClick={() => {
                   setSelectedFaceShape(shape);
                   setActiveFrameFilter(shapeRecommendations[shape][0]);
                }}
                className={`px-6 py-3 rounded-full border text-sm font-medium transition-all duration-300 ${
                    selectedFaceShape === shape
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-transparent border-white/20 text-gray-400 hover:border-white hover:text-white'
                }`}
                >
                {shape}
                </button>
            ))}
            </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-black p-1 rounded-3xl border border-white/10 shadow-2xl">
            <div className="bg-luxury-black rounded-[20px] p-8 md:p-12 overflow-hidden relative min-h-[600px]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="mb-12">
                        <h3 className="text-xl font-light mb-6 text-gray-400">
                            Recommended styles for <span className="text-gold-500 font-serif italic text-2xl mx-1">{selectedFaceShape}</span> faces:
                        </h3>
                        <div className="flex flex-wrap gap-4 md:gap-8">
                            {shapeRecommendations[selectedFaceShape].map((style) => (
                                <motion.button 
                                    key={style}
                                    onClick={() => setActiveFrameFilter(style)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 min-w-[100px] ${
                                        activeFrameFilter === style 
                                        ? 'bg-white/10 border-gold-500 shadow-[0_0_15px_rgba(197,160,89,0.2)]' 
                                        : 'bg-transparent border-white/10 hover:border-white/30'
                                    }`}
                                >
                                    <div className={`w-16 h-8 ${activeFrameFilter === style ? 'text-gold-500' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        <GlassFrame type={style} />
                                    </div>
                                    <span className={`text-xs uppercase tracking-widest ${activeFrameFilter === style ? 'text-white' : 'text-gray-500'}`}>
                                        {style}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-12">
                        <div className="flex items-center justify-between mb-8">
                             <h4 className="text-2xl font-bold flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-gold-500" />
                                {activeFrameFilter} Collection
                             </h4>
                             <span className="text-xs text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
                                {visibleProducts.length} Premium Frames
                             </span>
                        </div>

                        <AnimatePresence mode="wait">
                            {visibleProducts.length > 0 ? (
                                <motion.div 
                                    key={activeFrameFilter}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, staggerChildren: 0.1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {visibleProducts.map((product, i) => (
                                        <motion.div 
                                            key={product.id}
                                            onClick={() => onProductSelect(product)}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group relative bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-gold-500/50 hover:bg-white/10 transition-all duration-500 flex flex-col cursor-pointer"
                                        >
                                            <div className="absolute top-4 right-4 z-20">
                                                <span className="text-[10px] font-bold bg-black/50 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-gold-300 uppercase tracking-wider">
                                                    {product.brandInspiration}
                                                </span>
                                            </div>

                                            <div className="w-full aspect-[3/2] flex items-center justify-center mb-6 relative bg-gradient-to-br from-white/5 to-transparent rounded-lg">
                                                <div className="absolute inset-0 bg-gold-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <motion.div
                                                    whileHover={{ scale: 1.15, rotateZ: 2, y: -5 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                    className="w-3/4 relative z-10"
                                                >
                                                   <GlassFrame type={product.shape} color={product.color} />
                                                </motion.div>
                                            </div>

                                            <div className="space-y-3 flex-grow">
                                                <div>
                                                    <h4 className="text-xl font-bold mb-1 text-white group-hover:text-gold-100 transition-colors flex items-center justify-between">
                                                      {product.name}
                                                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
                                                    </h4>
                                                    <p className="text-xs text-gray-400 uppercase tracking-widest">{product.style}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {product.features.map((feat, idx) => (
                                                        <span key={idx} className="flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-300">
                                                            {getFeatureIcon(feat)} {feat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-6 mt-6 border-t border-white/10">
                                                <button className="w-full py-3 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gold-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(197,160,89,0.4)]">
                                                    View Details <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 text-gray-500"
                                >
                                    <p>Select a style above to view the collection.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default FaceFinder;