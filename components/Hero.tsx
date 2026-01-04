
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface HeroProps {
  onAuthClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyClick = () => {
    scrollToSection('about');
  };

  const VIDEO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%282%29.mp4";

  return (
    <section className="relative min-h-[100svh] flex items-center pt-32 pb-24 overflow-hidden bg-[#834bf1]">
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30 animate-pulse-slow bg-gradient-to-br from-[#834bf1] via-[#945cf5] to-[#7239e3]"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-8 space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
            
            {/* Intelligence Badge */}
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-full text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
              <span className="text-white font-black text-xs">+</span>
              <span>Intelligence-First Agency</span>
            </div>

            {/* Heading - Matched to Screenshot Request */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl lg:text-[100px] font-black text-white leading-[0.85] tracking-tighter font-display uppercase">
                Apply for <br />
                creator <br />
                card
              </h1>
              <h2 className="text-[#ffde59] text-5xl md:text-8xl lg:text-[100px] italic hero-stroke font-black uppercase tracking-tighter leading-[0.85]">
                With Reelywood
              </h2>
              <p className="text-base md:text-lg text-white font-bold leading-relaxed max-w-2xl pt-4">
                We engineer dynamic brand ecosystems through the synergy of Human Creativity and AI Precision. Scaling SMEs with surgical efficiency.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-4">
              <button 
                onClick={handleApplyClick}
                className="group w-full sm:w-auto bg-white text-black px-10 lg:px-12 py-5 lg:py-6 rounded-none font-black text-sm lg:text-base transition-all flex items-center justify-between sm:justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2"
              >
                <span>Apply for creator card</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 lg:w-10 h-[2px] bg-black/40"></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div>
              </button>
              
              <button 
                onClick={() => scrollToSection('creators')}
                className="w-full sm:w-auto bg-[#ffde59] text-black px-10 lg:px-12 py-5 lg:py-6 rounded-none font-black text-sm lg:text-base transition-all flex items-center justify-center space-x-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group"
              >
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-white border-[2.5px] border-black rounded-full flex items-center justify-center text-black shrink-0 shadow-[3px_3px_0px_#000]">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </div>
                <span>See Works</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-4 relative items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative w-full aspect-[4/5] max-w-[400px] overflow-hidden border-[6px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-black/5">
              <video src={VIDEO_URL} autoPlay loop muted playsInline className="w-full h-full object-cover mix-blend-screen opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#834bf1]/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .hero-stroke {
          -webkit-text-stroke: 3px black;
          text-shadow: 4px 4px 0px black;
        }
        @media (max-width: 640px) {
          .hero-stroke {
            -webkit-text-stroke: 2px black;
            text-shadow: 3px 3px 0px black;
          }
        }
      `}</style>
    </section>
  );
};
