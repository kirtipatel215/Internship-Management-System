import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Shield, Truck, RefreshCw, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import GlassFrame from './GlassFrame';
import ImageWithFallback from './ImageWithFallback';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-12">
      {/* Navigation Bar Override */}
      <div className="fixed top-0 left-0 w-full z-[110] p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-gold-500 transition-colors bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Visuals */}
          <div className="w-full lg:w-3/5 space-y-8">
            {/* Main Hero Shot (Vector + Gradient) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 rounded-3xl aspect-[4/3] flex items-center justify-center relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-200 via-gray-50 to-white opacity-50" />
               <motion.div 
                 className="w-3/4 relative z-10"
                 initial={{ scale: 0.8 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", duration: 1.5 }}
               >
                 <GlassFrame type={product.shape} color={product.color} className="drop-shadow-2xl" />
               </motion.div>
            </motion.div>

            {/* Lifestyle Image */}
            {product.image && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-3xl overflow-hidden h-[400px] relative"
              >
                <ImageWithFallback 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/20 flex items-end p-8">
                  <p className="text-white font-serif italic text-2xl">"Vision redefined."</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Details */}
          <motion.div 
            className="w-full lg:w-2/5 pt-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-gold-500 font-bold text-xs uppercase tracking-widest">{product.brandInspiration} Collection</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-gray-400 text-xs uppercase tracking-widest">{product.style}</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 leading-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-6">
               <div className="flex text-gold-500">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
               </div>
               <span className="text-sm text-gray-500 ml-2">(128 Reviews)</span>
            </div>

            {/* Price (Hidden/Exclusive) */}
            <div className="mb-8">
               <p className="text-3xl font-light">Exclusive Release</p>
               <p className="text-sm text-gray-400 mt-1">Limited availability for this season.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-10">
               <button className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-black transition-all flex items-center justify-center gap-3">
                 <ShoppingBag className="w-5 h-5" /> Reserve Now
               </button>
               <button className="w-full bg-white border border-gray-200 text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-all">
                 Virtual Try-On
               </button>
            </div>

            {/* Description */}
            <div className="prose prose-lg text-gray-600 mb-10">
               <p>{product.description || "Meticulously crafted from premium acetate, these frames offer a sophisticated silhouette that complements a variety of face shapes. Engineered with our signature lightweight technology for all-day comfort."}</p>
            </div>

            {/* Features List */}
            <div className="space-y-4 border-t border-gray-100 pt-8">
               <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Product Highlights</h3>
               <ul className="grid grid-cols-1 gap-3">
                 {product.features.map((feat, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                     <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                       <Check className="w-3 h-3" />
                     </div>
                     {feat}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 mt-10">
               <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-[10px] uppercase tracking-wider font-bold">2 Year Warranty</p>
               </div>
               <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-[10px] uppercase tracking-wider font-bold">Free Shipping</p>
               </div>
               <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-[10px] uppercase tracking-wider font-bold">30 Day Return</p>
               </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;