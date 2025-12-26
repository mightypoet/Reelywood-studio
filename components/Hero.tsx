
import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import Ballpit from './Ballpit';

interface HeroProps {
  onAuthClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    
    const handleScroll = () => {
      // Limit parallax updates to avoid excessive layout shifts on mobile
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-24 pb-12 overflow-hidden bg-[#05070a]">
      {/* Background Animated Layer */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          transform: isMobile ? 'none' : `translateY(${scrollY * 0.2}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="absolute inset-0 pointer-events-auto">
          <Ballpit
            count={isMobile ? 60 : 180}
            gravity={0.5}
            friction={0.98}
            wallBounce={0.9}
            followCursor={!isMobile}
            colors={[0x4f46e5, 0x7c3aed, 0x10b981]}
          />
        </div>
        
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070a] via-[#05070a]/80 to-transparent z-[5]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.1)_0%,transparent_50%)] z-[6]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="max-w-4xl space-y-8 lg:space-y-14 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
          
          {/* Elite Branding Badge */}
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-indigo-400 font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] shadow-2xl backdrop-blur-xl">
            <Sparkles size={14} className="fill-indigo-400 animate-pulse" />
            <span>Intelligence-First Agency</span>
          </div>

          {/* Master Typography */}
          <div className="space-y-4 lg:space-y-8">
            <h1 className="text-5xl md:text-8xl lg:text-[110px] font-extrabold text-white leading-[1] lg:leading-[0.9] tracking-tighter">
              The Evolution of <br />
              Marketing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 animate-gradient-x">
                REELYWOOD
              </span>
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-slate-400 leading-relaxed max-w-2xl font-medium">
              We engineer dynamic brand ecosystems through the synergy of Human Creativity and AI Precision. Scaling SMEs with surgical efficiency.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pt-4 lg:pt-6">
            <button 
              onClick={onAuthClick}
              className="group w-full sm:w-auto bg-indigo-600 text-white px-8 lg:px-14 py-5 lg:py-7 rounded-2xl lg:rounded-[2.5rem] font-black text-base lg:text-xl transition-all hover:bg-indigo-500 hover:scale-[1.05] active:scale-[0.95] flex items-center justify-center space-x-4 shadow-[0_15px_40px_rgba(79,70,229,0.25)]"
            >
              <span>Book Consultation</span>
              <div className="relative flex items-center">
                <div className="w-6 lg:w-8 h-px bg-white/40 group-hover:w-10 transition-all duration-500"></div>
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            <button 
              onClick={() => scrollToSection('leaderboard')}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 lg:px-14 py-5 lg:py-7 rounded-2xl lg:rounded-[2.5rem] font-black text-base lg:text-xl transition-all flex items-center justify-center space-x-4 backdrop-blur-md group"
            >
              <div className="w-9 h-9 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <Play size={16} fill="currentColor" />
              </div>
              <span>See Works</span>
            </button>
          </div>
        </div>
      </div>

      {/* Elegant Transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-30"></div>
      
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </section>
  );
};
