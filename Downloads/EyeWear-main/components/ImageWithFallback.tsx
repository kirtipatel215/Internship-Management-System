import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallbackSrc = 'https://images.unsplash.com/photo-1570222094114-28a9d88a2b64?q=80&w=1000&auto=format&fit=crop', 
  alt, 
  className,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src as string | undefined);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setImgSrc(src as string | undefined);
    setErrored(false);
  }, [src]);

  const handleError = () => {
    if (!errored) {
      setErrored(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'AIMOPTIC Image'}
      className={`${className} transition-opacity duration-500 ${errored ? 'opacity-80 grayscale-[0.2]' : 'opacity-100'}`}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default ImageWithFallback;