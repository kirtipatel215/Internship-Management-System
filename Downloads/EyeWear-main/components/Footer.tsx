import React from 'react';
import Logo from './Logo';
import { Instagram, Facebook, Twitter, MapPin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-black text-white pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <Logo variant="white" className="w-24" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Merging precision engineering with modern luxury. We craft eyewear for the visionaries of tomorrow.
            </p>
            <div className="flex gap-4">
                <Instagram className="w-5 h-5 text-white hover:text-gold-500 cursor-pointer" />
                <Facebook className="w-5 h-5 text-white hover:text-gold-500 cursor-pointer" />
                <Twitter className="w-5 h-5 text-white hover:text-gold-500 cursor-pointer" />
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
                <li className="hover:text-gold-500 cursor-pointer">All Collections</li>
                <li className="hover:text-gold-500 cursor-pointer">Sunglasses</li>
                <li className="hover:text-gold-500 cursor-pointer">Computer Glasses</li>
                <li className="hover:text-gold-500 cursor-pointer">Accessories</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
                <li className="hover:text-gold-500 cursor-pointer">Track Order</li>
                <li className="hover:text-gold-500 cursor-pointer">Book Eye Test</li>
                <li className="hover:text-gold-500 cursor-pointer">Shipping & Returns</li>
                <li className="hover:text-gold-500 cursor-pointer">Warranty Policy</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
             <h4 className="font-bold text-lg mb-6">Visit Us</h4>
             <ul className="space-y-4 text-gray-400 text-sm">
                 <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-gold-500" />
                    <span>1024 Innovation Drive,<br/>Tech District, NY 10012</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gold-500" />
                    <span>hello@aimoptic.com</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gold-500" />
                    <span>+1 (800) 555-0199</span>
                 </li>
             </ul>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>&copy; 2024 AIMOPTIC. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;