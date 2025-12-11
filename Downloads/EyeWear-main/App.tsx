import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Product } from './types';
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import HeroVideo from './components/HeroVideo';
import Story from './components/Story';
import Collections from './components/Collections';
import LensTech from './components/LensTech';
import FaceFinder from './components/FaceFinder';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import BrandMarquee from './components/BrandMarquee';
import ProductDetails from './components/ProductDetails';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
    const finderElement = document.getElementById('finder');
    if (finderElement) {
      finderElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToCollection = () => {
    setSelectedProduct(null);
    // Slight delay to allow render, then scroll back to finder
    setTimeout(() => {
      const finderElement = document.getElementById('finder');
      if (finderElement) {
        finderElement.scrollIntoView({ behavior: 'auto' });
      }
    }, 100);
  };

  return (
    <div className={`bg-white min-h-screen ${loading ? 'h-screen overflow-hidden' : ''}`}>
      <AnimatePresence>
        {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          {!selectedProduct ? (
            // LANDING PAGE VIEW
            <div className="animate-in fade-in duration-500">
               <Navbar />
               <main>
                 <Hero3D onShapeSelect={handleShapeSelect} />
                 <BrandMarquee />
                 <HeroVideo />
                 <Story />
                 <Collections />
                 <LensTech />
                 <FaceFinder 
                    initialFrameShape={selectedShape} 
                    onProductSelect={handleProductSelect}
                 />
                 <Testimonials />
               </main>
               <Footer />
            </div>
          ) : (
            // PRODUCT DETAILS VIEW
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
               <ProductDetails 
                 product={selectedProduct} 
                 onBack={handleBackToCollection} 
               />
               <Footer />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;