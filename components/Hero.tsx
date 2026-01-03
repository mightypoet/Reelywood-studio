
import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface HeroProps {
  onAuthClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const VIDEO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%282%29.mp4";

  return (
    <section className="relative min-h-[100svh] flex items-center pt-32 pb-24 overflow-hidden bg-[#834bf1]">
      {/* Subtle Blending Animation Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-30 animate-pulse-slow bg-gradient-to-br from-[#834bf1] via-[#945cf5] to-[#7239e3]"></div>
      
      {/* Visual background noise/texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-8 space-y-10 lg:space-y-16 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
            
            {/* Elite Branding Badge */}
            <div className="inline-flex items-center space-x-3 bg-white/10 border-2 border-black dark:border-white px-6 py-3 rounded-full text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] backdrop-blur-xl">
              <Sparkles size={14} className="fill-white animate-pulse" />
              <span>Intelligence-First Agency</span>
            </div>

            {/* Master Typography - Updated Heading */}
            <div className="space-y-6 lg:space-y-10">
              <h1 className="text-4xl md:text-7xl lg:text-[85px] font-black text-white leading-[1] lg:leading-[0.85] tracking-tighter font-display uppercase">
                Unlock Your <br />
                Creative Potential <br />
                <span className="text-[#ffde59] text-stroke block mt-4">
                  with Reelywood
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl font-bold">
                We engineer dynamic brand ecosystems through the synergy of Human Creativity and AI Precision. Scaling SMEs with surgical efficiency.
              </p>
            </div>

            {/* Action Hub - Neobrutalist buttons with generous whitespace */}
            <div className="flex flex-col sm:flex-row items-center space-y-8 sm:space-y-0 sm:space-x-10 pt-6">
              <button 
                onClick={onAuthClick}
                className="group w-full sm:w-auto bg-white text-black px-10 lg:px-14 py-6 lg:py-7 rounded-none font-black text-base lg:text-xl transition-all flex items-center justify-center space-x-8 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2"
              >
                <span>Book Consultation</span>
                <div className="flex items-center">
                  <div className="w-10 h-px bg-black/40"></div>
                  <ArrowRight size={24} className="ml-3" />
                </div>
              </button>
              
              <button 
                onClick={() => scrollToSection('leaderboard')}
                className="w-full sm:w-auto bg-[#ffde59] text-black px-10 lg:px-14 py-6 lg:py-7 rounded-none font-black text-base lg:text-xl transition-all flex items-center justify-center space-x-6 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group"
              >
                <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center text-black shrink-0">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </div>
                <span>See Works</span>
              </button>
            </div>
          </div>

          {/* Right Video Column */}
          <div className="hidden lg:flex lg:col-span-4 relative items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative w-full aspect-[4/5] max-w-[400px] overflow-hidden border-4 border-black dark:border-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] bg-black/5">
              <video 
                src={VIDEO_URL}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover mix-blend-screen opacity-90"
              />
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
      `}</style>
    </section>
  );
};
