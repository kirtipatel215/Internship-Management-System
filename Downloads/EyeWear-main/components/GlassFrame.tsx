import React from 'react';

interface GlassFrameProps {
  type: string;
  className?: string;
  color?: string;
  lensColor?: string;
}

const GlassFrame: React.FC<GlassFrameProps> = ({ 
  type, 
  className, 
  color = "currentColor", 
  lensColor = "rgba(200,230,255,0.1)" 
}) => {
  const getPath = () => {
    switch (type) {
      case 'Round':
        return (
          <g>
            <circle cx="35" cy="50" r="22" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <circle cx="85" cy="50" r="22" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <path d="M57 50 C 57 45, 63 45, 63 50" stroke={color} strokeWidth="2" fill="none" />
          </g>
        );
      case 'Square':
      case 'Wayfarer':
        return (
          <g>
            <rect x="15" y="30" width="40" height="35" rx="5" stroke={color} strokeWidth="3" fill="url(#lens-gradient)" />
            <rect x="65" y="30" width="40" height="35" rx="5" stroke={color} strokeWidth="3" fill="url(#lens-gradient)" />
            <path d="M55 40 L 65 40" stroke={color} strokeWidth="3" />
          </g>
        );
      case 'Aviator':
        return (
          <g>
            <path d="M15 35 Q 35 25 55 35 Q 50 65 35 65 Q 15 65 15 35 Z" stroke={color} strokeWidth="2" fill="url(#lens-gradient)" />
            <path d="M65 35 Q 85 25 105 35 Q 105 65 85 65 Q 70 65 65 35 Z" stroke={color} strokeWidth="2" fill="url(#lens-gradient)" />
            <path d="M55 35 L 65 35" stroke={color} strokeWidth="2" />
            <path d="M52 30 Q 60 25 68 30" stroke={color} strokeWidth="2" fill="none" />
          </g>
        );
      case 'Cat-Eye':
        return (
          <g>
            <path d="M10 30 Q 35 30 50 40 Q 45 60 30 60 Q 15 60 10 30 Z" stroke={color} strokeWidth="3" fill="url(#lens-gradient)" transform="rotate(-10 30 45)" />
            <path d="M70 40 Q 85 30 110 30 Q 105 60 90 60 Q 75 60 70 40 Z" stroke={color} strokeWidth="3" fill="url(#lens-gradient)" transform="rotate(10 90 45)" />
            <path d="M53 45 L 67 45" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'Rectangular':
        return (
          <g>
            <rect x="10" y="38" width="45" height="25" rx="2" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <rect x="65" y="38" width="45" height="25" rx="2" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <path d="M55 50 L 65 50" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'Geometric':
        return (
          <g>
             <path d="M25 30 L 50 30 L 55 45 L 50 60 L 25 60 L 20 45 Z" stroke={color} strokeWidth="2" fill="url(#lens-gradient)" />
             <path d="M70 30 L 95 30 L 100 45 L 95 60 L 70 60 L 65 45 Z" stroke={color} strokeWidth="2" fill="url(#lens-gradient)" />
             <path d="M55 40 L 65 40" stroke={color} strokeWidth="2" />
          </g>
        );
      case 'Oval':
        return (
          <g>
            <ellipse cx="35" cy="50" rx="22" ry="16" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <ellipse cx="85" cy="50" rx="22" ry="16" stroke={color} strokeWidth="2.5" fill="url(#lens-gradient)" />
            <path d="M57 50 L 63 50" stroke={color} strokeWidth="2" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg viewBox="0 0 120 100" className={`w-full h-auto drop-shadow-xl ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lens-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="50%" stopColor={lensColor} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.05)" />
        </linearGradient>
      </defs>
      {getPath()}
      {/* Glint effect */}
      <circle cx="20" cy="40" r="2" fill="white" opacity="0.6" />
      <circle cx="80" cy="40" r="2" fill="white" opacity="0.6" />
    </svg>
  );
};

export default GlassFrame;