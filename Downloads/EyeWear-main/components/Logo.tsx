import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'white' | 'gold' | 'black';
}

const Logo: React.FC<LogoProps> = ({ className = "w-32", variant = 'white' }) => {
  const getColor = () => {
    switch (variant) {
      case 'gold': return '#C5A059';
      case 'black': return '#000000';
      default: return '#FFFFFF';
    }
  };

  const color = getColor();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        {/* Abstract Lens Ring */}
        <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="3" strokeOpacity="0.8" />
        <circle cx="50" cy="50" r="32" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
        
        {/* Abstract A - Stylized as a prism or reflection */}
        <path d="M50 20L75 75H25L50 20Z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
        <path d="M40 55H60" stroke={color} strokeWidth="3" />
        
        {/* Glint */}
        <circle cx="70" cy="30" r="4" fill={color} fillOpacity="0.8" />
      </svg>
      <div className="flex flex-col justify-center">
        <span className="text-2xl font-bold tracking-[0.2em] leading-none" style={{ color }}>
          AIMOPTIC
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.4em] opacity-70 mt-1" style={{ color }}>
          Crafted for Your Eyes
        </span>
      </div>
    </div>
  );
};

export default Logo;