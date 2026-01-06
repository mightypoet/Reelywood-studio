
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

    const rotateY = ((mouseX - width / 2) / width) * 20; 
    const rotateX = ((height / 2 - mouseY) / height) * 20; 

    setRotate({ x: rotateX, y: rotateY });

    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.3
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-2 sm:p-8"
      style={{ perspective: '2000px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[260px] h-[400px] sm:w-[350px] sm:h-[550px] transition-transform duration-500 ease-out select-none cursor-default"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* CARD BODY - Solid Purple */}
        <div 
          className="absolute inset-0 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-[#834bf1]"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(1px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Subtle Sheen */}
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-black pointer-events-none"></div>

          {/* OWL EYES LOGO - Centered */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center text-center -translate-y-12"
            style={{ transform: 'translateZ(40px) translateY(-40px)' }}
          >
            <div className="relative w-36 sm:w-44 h-24 sm:h-28 flex items-center justify-center space-x-2">
              {/* Back Brows/Detail */}
              <div className="absolute top-2 w-[90%] flex justify-between px-2 opacity-80">
                 <div className="w-10 h-2 bg-black -rotate-12 rounded-full"></div>
                 <div className="w-10 h-2 bg-black rotate-12 rounded-full"></div>
              </div>

              {/* Eyes */}
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#ffde59] border-[3px] border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <div className="w-10 h-10 bg-black rounded-full translate-y-2"></div>
              </div>
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#ffde59] border-[3px] border-black rounded-[24px] flex items-center justify-center shadow-[4px_4px_0px_#000] relative overflow-hidden">
                <div className="w-10 h-10 bg-black rounded-full translate-y-2"></div>
              </div>
              
              {/* Beak */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-black rotate-45"></div>
            </div>

            <div className="mt-4 flex flex-col items-center space-y-1">
              <span className="text-white font-black text-2xl sm:text-3xl tracking-tight uppercase font-display italic">REELY</span>
              <span className="text-white font-black text-2xl sm:text-3xl tracking-tight uppercase font-display italic leading-none">WOOD</span>
              <span className="text-white font-bold text-[8px] sm:text-[10px] tracking-[0.4em] uppercase opacity-90 pt-1">STUDIO</span>
            </div>
          </div>

          {/* CHIP REMOVED AS PER REQUEST */}

          {/* CARD NUMBERS - Reduced size and optimized for devices */}
          <div 
            className="absolute bottom-[26%] left-6 sm:left-8 right-6 sm:right-8"
            style={{ transform: 'translateZ(30px)' }}
          >
            <p className="text-[#d1d5db] font-mono text-[14px] sm:text-[18px] lg:text-[20px] tracking-[0.1em] italic font-bold drop-shadow-[2px_2px_1px_rgba(0,0,0,0.5)] whitespace-nowrap">
              1234 5678 9000 0000
            </p>
          </div>

          {/* EXPO DATE */}
          <div 
            className="absolute bottom-[18%] sm:bottom-[16%] left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ transform: 'translateZ(25px)' }}
          >
            <div className="flex items-center space-x-1 mb-0.5">
               <span className="text-[6px] sm:text-[7px] font-black text-[#d1d5db] uppercase tracking-tighter opacity-70">EXPO</span>
               <span className="text-[6px] sm:text-[7px] font-black text-[#d1d5db] uppercase tracking-tighter opacity-70">DATE</span>
            </div>
            <span className="text-[#d1d5db] font-mono text-xs sm:text-sm tracking-widest font-bold">12/28</span>
          </div>

          {/* CARDHOLDER NAME */}
          <div 
            className="absolute bottom-6 sm:bottom-10 left-6 sm:left-8 right-6 sm:right-8"
            style={{ transform: 'translateZ(35px)' }}
          >
            <p className="text-[#d1d5db] font-bold text-xs sm:text-base uppercase tracking-widest truncate drop-shadow-md">
              {name || "CARDHOLDER NAME"}
            </p>
          </div>

          {/* GLARE OVERLAY */}
          <div 
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `radial-gradient(
                circle at ${glare.x}% ${glare.y}%, 
                rgba(255,255,255,0.4) 0%, 
                rgba(255,255,255,0) 60%
              )`,
              opacity: glare.opacity,
              transition: 'opacity 0.4s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};
