
import React from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onAuthClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent z-10"></div>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover brightness-[1.05]"
        >
          <source src="https://www.pexels.com/download/video/25744129/" type="video/mp4" />
        </video>
        {/* Glass Overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px] bg-white/10 z-[5]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
          
          {/* Floating Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl border border-slate-200/60 px-5 py-2.5 rounded-full text-indigo-600 font-bold text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200/50">
            <Sparkles size={14} className="fill-indigo-600" />
            <span>Scale with Intelligence</span>
          </div>

          {/* Main Typography */}
          <div className="space-y-6">
            <h1 className="text-[64px] lg:text-[100px] font-extrabold text-[#1a1c1e] leading-[0.95] tracking-tight">
              Your Marketing <br />
              Partner <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] drop-shadow-sm">
                REELYWOOD
              </span>
            </h1>
            <p className="text-lg lg:text-2xl text-slate-600 leading-relaxed max-w-2xl font-medium">
              A lean, dynamic marketing company built on the power of Human + AI collaboration. We study how brands connect, engage, and convert.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center space-y-5 sm:space-y-0 sm:space-x-8 pt-6">
            <button 
              onClick={onAuthClick}
              className="group w-full sm:w-auto bg-[#8b8dfa] text-white px-12 py-6 rounded-[2.5rem] font-bold text-xl transition-all transform hover:scale-[1.05] active:scale-95 flex items-center justify-center space-x-4 shadow-[0_20px_40px_-10px_rgba(139,141,250,0.5)]"
            >
              <span>Book a Consultation</span>
              <div className="relative flex items-center">
                <div className="w-8 h-px bg-white/50 group-hover:w-10 transition-all duration-300"></div>
                <ArrowRight size={20} className="ml-1" />
              </div>
            </button>
            
            <button 
              onClick={() => scrollToSection('leaderboard')}
              className="w-full sm:w-auto bg-white/40 backdrop-blur-2xl text-[#1a1c1e] px-12 py-6 rounded-[2.5rem] font-bold text-xl transition-all flex items-center justify-center space-x-4 shadow-2xl shadow-slate-200/50 border border-white/60 hover:bg-white/60 active:scale-95"
            >
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                <Play size={18} fill="currentColor" />
              </div>
              <span>See our Works</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
    </section>
  );
};
