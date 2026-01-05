
import React from 'react';
import { Calendar, ArrowRight, Zap, Sparkles, TrendingUp } from 'lucide-react';
import CurvedLoop from './CurvedLoop';

export const CTA: React.FC = () => {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="contact" className="py-24 sm:py-48 px-4 sm:px-6 scroll-mt-24 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto bg-[#ffde59] border-[4px] sm:border-[6px] border-black relative shadow-[12px_12px_0px_0px_#000000] sm:shadow-[24px_24px_0px_0px_#000000] dark:shadow-[12px_12px_0px_0px_#834bf1] sm:dark:shadow-[24px_24px_0px_0px_#834bf1] p-8 sm:p-12 lg:p-32 overflow-hidden group transition-all duration-500">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:20px_20px]"></div>

        {/* Dynamic Curved Loop Backgrounds */}
        <div className="absolute top-0 left-0 w-full opacity-5 pointer-events-none transform -translate-y-6 sm:-translate-y-12 z-0">
          <CurvedLoop 
            marqueeText="SCALE ✦ AUTOMATE ✦ DOMINATE ✦ REELYWOOD ✦"
            speed={1}
            curveAmount={100}
            interactive={false}
            className="text-black italic font-black text-4xl sm:text-8xl"
          />
        </div>

        <div className="relative z-10 text-center space-y-10 sm:space-y-14">
          <div className="inline-flex items-center space-x-3 sm:space-x-4 bg-black border-[3px] border-black px-4 sm:px-8 py-2 sm:py-3 rounded-none text-white font-black text-[9px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.5em] shadow-[4px_4px_0px_0px_#834bf1] sm:shadow-[8px_8px_0px_0px_#834bf1] animate-in fade-in slide-in-from-top-4 duration-700">
            <TrendingUp size={14} sm:size={16} className="text-[#ffde59] animate-pulse" />
            <span>Deployment Protocol Ready</span>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black text-black leading-[0.9] tracking-tighter font-display uppercase italic drop-shadow-[3px_3px_0px_rgba(0,0,0,0.05)] sm:drop-shadow-[6px_6px_0px_rgba(0,0,0,0.05)]">
              Ready to automate <br /> 
              your brand's <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#fff] sm:drop-shadow-[4px_4px_0px_#fff]">growth</span>?
            </h2>
            <p className="text-black text-base sm:text-xl md:text-2xl max-w-3xl mx-auto font-black uppercase italic tracking-tight opacity-90 border-l-[6px] sm:border-l-[8px] border-black pl-6 sm:pl-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm">
              Stop guessing. Start Scaling. Partner with the agency that engineers virality through data.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-6 sm:pt-10">
            <button 
              onClick={scrollToAbout}
              className="w-full sm:w-auto bg-[#834bf1] text-white px-8 sm:px-14 py-5 sm:py-8 border-[4px] sm:border-[5px] border-black shadow-[6px_6px_0px_0px_#000000] sm:shadow-[10px_10px_0px_0px_#000000] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all hover:-translate-x-1 sm:hover:-translate-x-2 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_#000000] sm:hover:shadow-[20px_20px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-4 sm:space-x-5 group/btn"
            >
              <Calendar size={18} sm:size={22} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="italic font-display uppercase tracking-widest">Apply for creator card</span>
            </button>
            
            <button className="w-full sm:w-auto bg-white text-black border-[4px] sm:border-[5px] border-black px-8 sm:px-14 py-5 sm:py-8 shadow-[6px_6px_0px_0px_#000000] sm:shadow-[10px_10px_0px_0px_#000000] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:-translate-x-1 sm:hover:-translate-x-2 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_#834bf1] sm:hover:shadow-[20px_20px_0px_0px_#834bf1] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-4 sm:space-x-5 group/btn2">
              <span className="italic font-display uppercase tracking-widest">View Mission Archive</span>
              <ArrowRight size={18} sm:size={22} strokeWidth={3} className="group-hover/btn2:translate-x-2 transition-transform" />
            </button>
          </div>
          
          <div className="pt-8 sm:pt-12 flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="flex -space-x-3 sm:-space-x-5">
               {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-10 h-10 sm:w-14 sm:h-14 border-[3px] sm:border-[4px] border-black bg-white overflow-hidden shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] transition-transform hover:scale-110 hover:z-20 cursor-help">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i + 20}`} alt="Partner" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="bg-black text-white px-4 sm:px-6 py-2 border-[2px] border-black font-black uppercase text-[8px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.6em] italic">
              ✦ 100% Performance Guarantee ✦
            </div>
          </div>
        </div>

        {/* Corner Sparkle Decorations */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 text-black animate-bounce hidden sm:block opacity-40">
          <Sparkles size={48} sm:size={64} />
        </div>
        <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 text-[#834bf1] animate-pulse hidden sm:block">
          <Sparkles size={32} sm:size={48} />
        </div>
        <div className="absolute top-1/2 right-8 text-black animate-spin-slow hidden sm:block opacity-20">
          <Zap size={60} sm:size={80} fill="currentColor" />
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};
