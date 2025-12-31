
import React, { useState, useRef } from 'react';

interface ThreeDCardProps {
  name: string;
  handle: string;
}

export const ThreeDCard: React.FC<ThreeDCardProps> = ({ name, handle }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateY = ((mouseX - width / 2) / width) * 25; 
    const rotateX = ((height / 2 - mouseY) / height) * 25; 

    setRotate({ x: rotateX, y: rotateY });

    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.4
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-2 sm:p-8"
      style={{ perspective: '1500px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[260px] h-[400px] sm:w-[350px] sm:h-[530px] transition-transform duration-700 ease-out select-none cursor-default"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* THE CARD BODY */}
        <div 
          className="absolute inset-0 rounded-[30px] sm:rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/30"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(1px)',
            // High-contrast, vibrant iridescent gradient
            background: 'linear-gradient(135deg, #ff66b2 0%, #33ccff 25%, #4dffb8 50%, #fff24d 75%, #ff66b2 100%)',
          }}
        >
          {/* Surface Texture */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* BRUSHED METAL CHIP (CENTER) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-36 sm:h-36 rounded-[24px] sm:rounded-[32px] flex items-center justify-center overflow-hidden shadow-[inset_0_2px_10px_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.5)] border border-black/40"
            style={{ 
              transform: 'translate(-50%, -50%) translateZ(50px)',
              background: 'radial-gradient(circle at center, #444 0%, #000 100%)'
            }}
          >
            {/* Brushed Metal Radial Effect */}
            <div className="absolute inset-0 opacity-50"
                 style={{ 
                   background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.2) 45deg, transparent 90deg, rgba(255,255,255,0.2) 135deg, transparent 180deg, rgba(255,255,255,0.2) 225deg, transparent 270deg, rgba(255,255,255,0.2) 315deg, transparent 360deg)',
                   filter: 'blur(3px)'
                 }}
            ></div>
            
            <span className="relative z-10 text-[8px] sm:text-[12px] font-black tracking-[0.4em] text-[#999] uppercase select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              REELYWOOD
            </span>
          </div>

          {/* IDENTITY TEXTS (BOTTOM) */}
          <div 
            className="absolute bottom-10 sm:bottom-14 left-0 right-0 flex flex-col items-center px-4 sm:px-8 text-center"
            style={{ transform: 'translateZ(80px)' }}
          >
            <h2 className="text-[#1a1a1a] font-cursive text-4xl sm:text-6xl mb-1 drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)]">
              {name || "Your Identity"}
            </h2>
            <p className="text-[#1a1a1a] font-mono-custom text-[10px] sm:text-[14px] font-bold tracking-tight opacity-95">
              {handle ? (handle.startsWith('@') ? handle : `@${handle}`) : "@handle"}
            </p>
          </div>

          {/* GLARE OVERLAY */}
          <div 
            className="absolute inset-0 rounded-[30px] sm:rounded-[40px] pointer-events-none z-30"
            style={{
              background: `radial-gradient(
                circle at ${glare.x}% ${glare.y}%, 
                rgba(255,255,255,0.6) 0%, 
                rgba(255,255,255,0) 65%
              )`,
              opacity: glare.opacity,
              transition: 'opacity 0.4s ease'
            }}
          />
        </div>

        {/* REAR FACE - HOLLOW / CLEAN */}
        <div 
          className="absolute inset-0 rounded-[30px] sm:rounded-[40px] bg-white flex items-center justify-center overflow-hidden border border-white/20"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg) translateZ(1px)',
            background: 'linear-gradient(135deg, #ff66b2 0%, #33ccff 25%, #4dffb8 50%, #fff24d 75%, #ff66b2 100%)',
          }}
        >
        </div>
      </div>
    </div>
  );
};
