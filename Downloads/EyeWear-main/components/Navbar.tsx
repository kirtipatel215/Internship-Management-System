import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const navLinks = [
    { id: 'collections', label: 'Collections' },
    { id: 'lens-tech', label: 'Technology' },
    { id: 'story', label: 'Our World' },
    { id: 'finder', label: 'Style Finder' },
  ];

  // Handle Scroll State
  useEffect(() => {
    const handleScroll = () => {
      // Navbar background state - use a small threshold
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section detection
      const scrollPosition = window.scrollY + 150; 

      let current = '';
      navLinks.forEach((link) => {
        const element = document.getElementById(link.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            current = link.id;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
    // Close menu first to unlock body scroll
    setIsMobileMenuOpen(false);

    // Small timeout to allow layout to settle before scrolling
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Determine Logo & Icon colors based on state
  const logoVariant = (isScrolled || isMobileMenuOpen) ? 'black' : 'white';
  const mobileToggleColor = isMobileMenuOpen ? 'text-black' : (isScrolled ? 'text-black' : 'text-white');
  const desktopTextColor = isScrolled ? 'text-black' : 'text-white';
  
  // Dynamic glass hover effect based on background
  const glassHoverClass = isScrolled 
    ? 'hover:bg-black/5' 
    : 'hover:bg-white/10 hover:backdrop-blur-md';

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
        isScrolled 
        ? 'bg-white/80 backdrop-blur-xl py-4 shadow-sm border-b border-white/20' 
        : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full max-w-[100vw] px-6 md:px-12 flex items-center justify-between relative">
        {/* Logo - Left Aligned */}
        <a 
          href="#" 
          onClick={(e) => { 
            e.preventDefault(); 
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            setIsMobileMenuOpen(false); 
          }}
          className="relative z-[110] block flex-shrink-0"
        >
          <Logo className="h-8 md:h-10 w-auto" variant={logoVariant} />
        </a>

        {/* Desktop Links - Absolutely Centered */}
        <div className={`hidden md:flex items-center gap-2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs lg:text-sm uppercase tracking-[0.2em] font-medium ${desktopTextColor}`}>
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => scrollToSection(e, link.id)}
              className={`relative px-6 py-3 rounded-full transition-all duration-300 group overflow-hidden ${glassHoverClass} ${
                 activeSection === link.id 
                 ? (isScrolled ? 'bg-black/5' : 'bg-white/10 backdrop-blur-md') 
                 : ''
              }`}
            >
               <span className={`relative z-10 transition-colors duration-300 ${
                  activeSection === link.id ? 'text-gold-500' : 'group-hover:text-gold-500'
               }`}>
                {link.label}
              </span>
            </a>
          ))}
        </div>

        {/* Mobile Toggle Button - Right Aligned (Visible only on mobile) */}
        <div className={`flex items-center ${desktopTextColor} z-[110] md:hidden`}>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`p-2 -mr-2 transition-colors duration-300 ${mobileToggleColor}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" /> 
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Empty div to balance flex on desktop if needed, though absolute center handles position */}
        <div className="hidden md:block w-10"></div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 left-0 w-full h-[100dvh] bg-white/90 z-[100] flex flex-col justify-center items-center text-black md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-8 text-center text-xl uppercase tracking-widest font-bold">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  className={`${activeSection === link.id ? 'text-gold-500' : 'text-black'} hover:text-gold-500 transition-colors`}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;