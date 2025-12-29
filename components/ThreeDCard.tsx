
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
    
    // Calculate mouse position relative to the card center
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map the cursor across the entire container to a 360-degree range for a very spatial orbit
    // We use a sensitivity multiplier to make it feel responsive but not erratic
    const rotateY = ((mouseX - width / 2) / width) * 180; 
    const rotateX = ((height / 2 - mouseY) / height) * 180; 

    setRotate({ x: rotateX, y: rotateY });

    // Calculate dynamic glare based on cursor
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.6
    });
  };

  const handleMouseLeave = () => {
    // Reset position smoothly
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
      style={{ perspective: '2000px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-[300px] h-[480px] sm:w-[340px] sm:h-[530px] transition-transform duration-300 ease-out select-none"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 rounded-[32px] bg-[#0c0c0c] shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}
        >
          {/* NOISE OVERLAY (MATTE TEXTURE) */}
          <div 
            className="absolute inset-0 rounded-[32px] pointer-events-none z-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          ></div>

          {/* METALLIC RIM BORDER */}
          <div className="absolute inset-0 rounded-[32px] border border-white/10 z-10 pointer-events-none shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>
          
          {/* MAIN CONTENT */}
          <div className="relative h-full w-full flex flex-col items-center pt-10 pb-12 z-20 rounded-[32px]">
            
            {/* Top Logo */}
            <h1 className="text-[#888] font-bold tracking-[0.3em] text-[12px] uppercase mb-10 drop-shadow-lg font-display">
              REELYWOOD
            </h1>

            {/* HOLOGRAPHIC PANEL */}
            <div 
              className="relative w-[210px] h-[260px] sm:w-[240px] sm:h-[300px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/panel border border-white/5"
              style={{ transform: 'translateZ(40px)' }}
            >
                {/* Vibrant Iridescent Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff0095] via-[#00d4ff] to-[#fffb00] animate-pulse-slow opacity-90"></div>
                
                {/* Panel Shine Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.1)_100%)]"></div>
                
                {/* Central Black Chip */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/85 backdrop-blur-xl rounded-xl flex flex-col items-center justify-center border border-white/20 shadow-2xl"
                  style={{ transform: 'translate(-50%, -50%) translateZ(25px)' }}
                >
                    <span className="text-[7px] text-white/90 font-black tracking-[0.2em] mb-1 font-display">REELYWOOD</span>
                    <div className="w-6 h-[1px] bg-white/20 mb-1"></div>
                    <span className="text-[6px] text-white/40 font-bold uppercase tracking-widest text-center px-2">Creator<br/>Card</span>
                </div>

                {/* Micro-details */}
                <div className="absolute bottom-4 left-5 text-[6px] font-mono text-black/20 font-black tracking-widest uppercase">
                  #NODE-004.8842
                </div>
            </div>

            {/* Bottom Identity Block */}
            <div className="mt-auto text-center px-8" style={{ transform: 'translateZ(60px)' }}>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white/90 mb-1 uppercase font-display drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                    {name || "YOUR NAME"}
                </h2>
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Authenticated Access v4.0
                </p>
                {handle && (
                  <p className="text-[8px] text-indigo-400 font-black uppercase tracking-[0.4em] mt-3 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                    {handle.startsWith('@') ? handle : `@${handle}`}
                  </p>
                )}
            </div>
          </div>

          {/* GLARE EFFECT */}
          <div 
            className="absolute inset-0 rounded-[32px] pointer-events-none z-30 mix-blend-overlay"
            style={{
              background: `radial-gradient(
                circle at ${glare.x}% ${glare.y}%, 
                rgba(255,255,255,0.4) 0%, 
                rgba(255,255,255,0) 70%
              )`,
              opacity: glare.opacity,
              transition: 'opacity 0.4s ease'
            }}
          />
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute inset-0 rounded-[32px] bg-[#0c0c0c] flex items-center justify-center overflow-hidden"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg) translateZ(1px)',
            border: '1px solid rgba(255,255,255,0.1)' 
          }}
        >
          {/* Logo on the back */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-4xl">R</span>
            </div>
            <div className="text-center">
              <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em]">REELYWOOD STUDIO</p>
              <p className="text-white/10 font-mono text-[8px] mt-2">ENCRYPTED IDENTITY TOKEN</p>
            </div>
          </div>
          
          {/* Circuit-like pattern overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.85; filter: hue-rotate(0deg); }
          50% { opacity: 1; filter: hue-rotate(15deg); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
