import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import GlassFrame from './GlassFrame';

const shapes = [
  { label: 'Aviator', type: 'Aviator' },
  { label: 'Wayfarer', type: 'Wayfarer' },
  { label: 'Round', type: 'Round' },
  { label: 'Cat-Eye', type: 'Cat-Eye' },
  { label: 'Rectangular', type: 'Rectangular' },
  { label: 'Geometric', type: 'Geometric' },
];

const EyewearModel = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow elegant rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left Lens Frame */}
      <mesh position={[-1.2, 0, 0]}>
        <torusGeometry args={[1, 0.1, 16, 100]} />
        <meshStandardMaterial color="#C5A059" roughness={0.1} metalness={1} />
      </mesh>
       {/* Left Lens Glass */}
       <mesh position={[-1.2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshPhysicalMaterial 
            color="#aaccff" 
            roughness={0} 
            metalness={0.1} 
            transmission={0.9} 
            thickness={0.5} 
            transparent 
            opacity={0.3}
        />
      </mesh>

      {/* Right Lens Frame */}
      <mesh position={[1.2, 0, 0]}>
        <torusGeometry args={[1, 0.1, 16, 100]} />
        <meshStandardMaterial color="#C5A059" roughness={0.1} metalness={1} />
      </mesh>
      {/* Right Lens Glass */}
      <mesh position={[1.2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
        <meshPhysicalMaterial 
            color="#aaccff" 
            roughness={0} 
            metalness={0.1} 
            transmission={0.9} 
            thickness={0.5} 
            transparent 
            opacity={0.3}
        />
      </mesh>

      {/* Bridge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 32]} />
        <meshStandardMaterial color="#C5A059" roughness={0.1} metalness={1} />
      </mesh>

      {/* Temples (Arms) */}
      <mesh position={[-2.2, 0, -1]} rotation={[0, -0.5, 0]}>
         <boxGeometry args={[0.1, 0.1, 2.5]} />
         <meshStandardMaterial color="#111" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[2.2, 0, -1]} rotation={[0, 0.5, 0]}>
         <boxGeometry args={[0.1, 0.1, 2.5]} />
         <meshStandardMaterial color="#111" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
};

interface Hero3DProps {
  onShapeSelect: (shape: string) => void;
}

const Hero3D: React.FC<Hero3DProps> = ({ onShapeSelect }) => {
  return (
    <div className="h-screen w-full bg-luxury-black relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black" />
      
      <div className="flex-grow relative">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#C5A059" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <EyewearModel />
          </Float>
          
          <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#C5A059" />
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.25} far={10} color="#000" />
        </Canvas>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none pb-32 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          >
            <p className="text-gold-300 text-sm tracking-[0.5em] uppercase mb-4">Premium Eyewear Studio</p>
            <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter mb-2">AIMOPTIC</h1>
            <p className="text-white/60 text-lg tracking-[0.3em] font-light">CRAFTED FOR YOUR EYES</p>
          </motion.div>
        </div>
      </div>
      
      {/* Shape Selector Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="relative z-30 w-full bg-black/40 backdrop-blur-md border-t border-white/10 py-6 md:py-8"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Choose Your Silhouette</p>
            
            <div className="flex gap-4 md:gap-12 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 justify-start md:justify-center no-scrollbar px-2">
              {shapes.map((shape, i) => (
                <motion.button
                  key={shape.label}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onShapeSelect(shape.type)}
                  className="flex flex-col items-center gap-3 min-w-[80px] group"
                >
                  <div className="w-16 h-10 relative text-gray-400 group-hover:text-gold-500 transition-colors duration-300">
                     <GlassFrame type={shape.type} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                    {shape.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero3D;