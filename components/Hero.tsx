
import React, { useState } from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

interface HeroProps {
  onAuthClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-24 pb-12 overflow-hidden bg-slate-50">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 lg:via-white/40 to-transparent z-10"></div>
        
        {/* Poster image from the same video source area or a matching aesthetic high-res image */}
        <img 
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-0 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          alt="Hero Background Placeholder"
        />

        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover grayscale-[20%] transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Using a more direct-looking source if possible, but keeping the requested link with added optimization parameters */}
          <source src="https://www.pexels.com/download/video/25744129/" type="video/mp4" />
        </video>
        
        {/* Subtle Solid Overlay */}
        <div className="absolute inset-0 bg-white/5 z-[5]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="max-w-4xl space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-left-4 lg:slide-in-from-left-12 duration-700">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-indigo-600 font-bold text-[10px] uppercase tracking-[0.3em] shadow-sm">
            <Sparkles size={14} className="fill-indigo-600" />
            <span>Scale with Intelligence</span>
          </div>

          {/* Typography - Mobile Optimized */}
          <div className="space-y-4 lg:space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-extrabold text-[#1a1c1e] leading-[1.1] lg:leading-[0.95] tracking-tight">
              Your Marketing <br />
              Partner <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">
                REELYWOOD
              </span>
            </h1>
            <p className="text-base lg:text-2xl text-slate-600 leading-relaxed max-w-2xl font-medium">
              A lean, dynamic marketing company built on the power of Human + AI collaboration. We study how brands connect, engage, and convert.
            </p>
          </div>

          {/* CTAs - Mobile Stacked, Desktop Row */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
            <button 
              onClick={onAuthClick}
              className="group w-full sm:w-auto bg-[#8b8dfa] text-white px-8 lg:px-12 py-5 lg:py-6 rounded-2xl lg:rounded-[2.5rem] font-bold text-lg lg:text-xl transition-all hover:bg-[#7a7cf0] flex items-center justify-center space-x-4 shadow-xl"
            >
              <span>Book a Consultation</span>
              <div className="relative flex items-center">
                <div className="w-6 h-px bg-white/50 group-hover:w-8 transition-all duration-300"></div>
                <ArrowRight size={20} className="ml-1" />
              </div>
            </button>
            
            <button 
              onClick={() => scrollToSection('leaderboard')}
              className="w-full sm:w-auto bg-white text-[#1a1c1e] px-8 lg:px-12 py-5 lg:py-6 rounded-2xl lg:rounded-[2.5rem] font-bold text-lg lg:text-xl transition-all flex items-center justify-center space-x-4 border border-slate-200 shadow-sm hover:bg-slate-50"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shrink-0">
                <Play size={16} fill="currentColor" />
              </div>
              <span>See our Works</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fade out to solid white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </section>
  );
};
