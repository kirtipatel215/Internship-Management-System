
export interface Product {
  id: number;
  name: string;
  style: string; // e.g., "Classic Aviator"
  brandInspiration: string; // e.g., "Ray-Ban"
  price: string;
  shape: string; // used for filtering
  color: string;
  features: string[]; // e.g., ["Anti-Glare", "Polarized"]
  image?: string; // Lifestyle image URL
  category?: 'sunglasses' | 'power' | 'blue-light';
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export enum FaceShape {
  ROUND = 'Round',
  OVAL = 'Oval',
  SQUARE = 'Square',
  HEART = 'Heart'
}

export enum FrameStyle {
  MINIMAL = 'Minimal',
  CLASSIC = 'Classic',
  BOLD = 'Bold',
  TRENDY = 'Trendy'
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      torusGeometry: any;
      meshStandardMaterial: any;
      circleGeometry: any;
      meshPhysicalMaterial: any;
      cylinderGeometry: any;
      boxGeometry: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}
