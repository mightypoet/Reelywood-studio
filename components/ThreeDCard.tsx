
import React, { useState, useRef } from 'react';
import { Wifi } from 'lucide-react';

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
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
      style={{ perspective: '1500px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[280px] h-[460px] sm:w-[320px] sm:h-[520px] transition-transform duration-500 ease-out select-none cursor-default"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* CARD BODY - Premium NFC Card Aesthetic */}
        <div 
          className="absolute inset-0 rounded-[32px] overflow-hidden bg-[#7B3FE4] shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'translateZ(1px)',
          }}
        >
          {/* Abstract Wavy Fingerprint Pattern Layer */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='white' stroke-width='1.5' d='M20,100 Q40,40 100,20 T180,100 T100,180 T20,100 M40,100 Q60,60 100,40 T160,100 T100,160 T40,100 M60,100 Q80,80 100,60 T140,100 T100,140 T60,100'/%3E%3C/svg%3E")`,
              backgroundSize: '300% 300%',
              backgroundPosition: 'center',
            }}
          ></div>

          {/* TOP LEFT: REELYWOOD */}
          <div className="absolute top-8 left-8" style={{ transform: 'translateZ(30px)' }}>
            <span className="text-white font-black text-[12px] uppercase tracking-[0.2em] opacity-90">REELYWOOD</span>
          </div>

          {/* TOP RIGHT: NFC LOGO IMAGE */}
          <div className="absolute top-8 right-8 w-8 h-8" style={{ transform: 'translateZ(30px)' }}>
            <img 
              src="https://izz9qoicna213xwc.public.blob.vercel-storage.com/icons8-nfc-logo-100.png" 
              alt="NFC Logo" 
              className="w-full h-full object-contain brightness-0 invert opacity-90"
            />
          </div>

          {/* CENTER TOP: ICON MASCOT - DECREASED SPACING */}
          <div 
            className="absolute inset-x-0 top-[12%] flex flex-col items-center justify-center"
            style={{ transform: 'translateZ(50px)' }}
          >
            <div className="relative w-44 h-44 flex items-center justify-center -mb-2">
              <img 
                src="https://izz9qoicna213xwc.public.blob.vercel-storage.com/icon-Photoroom.png"
                className="w-full h-full object-contain"
                alt="Mascot Icon"
              />
            </div>

            {/* CREATOR CARD TEXT */}
            <div className="text-center">
              <h2 className="text-white font-display text-4xl leading-[0.9] tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                CREATOR<br/>CARD
              </h2>
            </div>
          </div>

          {/* LOWER CENTER: NFC ICON AND DETAILS */}
          <div 
            className="absolute inset-x-0 bottom-12 flex flex-col items-center text-center"
            style={{ transform: 'translateZ(40px)' }}
          >
            <Wifi className="text-white mb-6 rotate-90 opacity-80" size={24} />
            
            <div className="space-y-1 mb-8">
              <p className="text-white/80 font-bold text-[11px] uppercase tracking-[0.4em] leading-tight">INFLUENCE</p>
              <p className="text-white/80 font-bold text-[11px] uppercase tracking-[0.4em] logic">LOYALTY</p>
              <p className="text-white font-black text-xl tracking-tight mt-2">
                @{handle.replace('@', '') || 'Username'}
              </p>
            </div>

            <p className="text-white/60 font-medium text-[10px] tracking-wider">reelywood.com</p>
          </div>

          {/* GLARE OVERLAY */}
          <div 
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: `radial-gradient(
                circle at ${glare.x}% ${glare.y}%, 
                rgba(255,255,255,0.2) 0%, 
                rgba(255,255,255,0.05) 30%, 
                transparent 70%
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
