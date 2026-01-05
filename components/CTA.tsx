import React from 'react';
import { Calendar, ArrowRight, Zap, Sparkles } from 'lucide-react';
import CurvedLoop from './CurvedLoop';

export const CTA: React.FC = () => {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="contact" className="py-32 px-6 scroll-mt-24 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto bg-[#ffde59] border-[6px] border-black relative shadow-[20px_20px_0px_0px_#000000] dark:shadow-[20px_20px_0px_0px_#834bf1] p-12 lg:p-24 overflow-hidden group">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

        {/* Curved Loop Decoration */}
        <div className="absolute top-0 left-0 w-full opacity-10 pointer-events-none transform -translate-y-8 z-0">
          <CurvedLoop 
            marqueeText="REELYWOOD ✦ AI DRIVEN ✦ GROWTH ✦ AUTOMATION ✦ PERFORMANCE ✦ SCALE ✦"
            speed={1.5}
            curveAmount={150}
            interactive={false}
            className="text-black italic font-black text-6xl"
          />
        </div>

        <div className="relative z-10 text-center space-y-12">
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
            <Zap size={14} className="text-[#ffde59] animate-pulse" />
            <span>Terminal Protocol</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl lg:text-8xl font-black text-black leading-[0.85] tracking-tighter font-display uppercase italic drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
              Ready to automate <br /> 
              your brand's <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#fff]">growth</span>?
            </h2>
            <p className="text-black text-lg md:text-xl max-w-2xl mx-auto font-black uppercase italic tracking-tight opacity-80 border-x-[4px] border-black py-2">
              Partner with the best. Design the future now. <br className="hidden md:block" /> Schedule your free performance audit.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-10">
            <button 
              onClick={scrollToAbout}
              className="w-full sm:w-auto bg-[#834bf1] text-white px-12 py-7 border-[4px] border-black shadow-[8px_8px_0px_0px_#000000] font-black text-xs uppercase tracking-[0.3em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 flex items-center justify-center space-x-4 group/btn"
            >
              <Calendar size={20} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="italic font-display">Apply for creator card</span>
            </button>
            
            <button className="w-full sm:w-auto bg-white text-black border-[4px] border-black px-12 py-7 shadow-[8px_8px_0px_0px_#000000] font-black text-xs uppercase tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 transition-all flex items-center justify-center space-x-4">
              <span className="italic font-display">View Case Studies</span>
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
          
          <div className="pt-8 flex flex-col items-center space-y-4">
            <div className="flex -space-x-4">
               {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-12 h-12 border-[3px] border-black bg-white overflow-hidden shadow-[2px_2px_0px_#000]">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i + 10}`} alt="Partner" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-black font-black uppercase tracking-[0.5em] italic">100% Trusted • High Impact • ROI Driven</p>
          </div>
        </div>

        {/* Bottom Curved Loop Decoration */}
        <div className="absolute bottom-0 left-0 w-full opacity-5 pointer-events-none transform translate-y-12">
          <CurvedLoop 
            marqueeText="INNOVATE ✦ TRANSFORM ✦ SUCCEED ✦ REELYWOOD ✦"
            speed={2}
            curveAmount={-150}
            direction="right"
            interactive={false}
            className="text-black italic font-black text-6xl"
          />
        </div>

        {/* Decorative Sparkles */}
        <div className="absolute top-12 left-12 text-[#834bf1] animate-bounce hidden lg:block">
          <Sparkles size={48} />
        </div>
        <div className="absolute bottom-12 right-12 text-[#834bf1] animate-pulse hidden lg:block">
          <Sparkles size={32} />
        </div>
      </div>
    </section>
  );
};