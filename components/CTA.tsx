
import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import CurvedLoop from './CurvedLoop';

interface CTAProps {
  onApplyClick: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onApplyClick }) => {
  return (
    <section id="contact" className="py-24 px-6 scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto bg-black rounded-[4rem] overflow-hidden relative border-[6px] border-black shadow-[24px_24px_0px_#834bf1]">
        {/* Curved Loop Decoration */}
        <div className="absolute top-0 left-0 w-full opacity-20 pointer-events-none transform -translate-y-12">
          <CurvedLoop 
            marqueeText="REELYWOOD ✦ AI DRIVEN ✦ GROWTH ✦ AUTOMATION ✦ PERFORMANCE ✦ SCALE ✦"
            speed={1.5}
            curveAmount={300}
            interactive={false}
            className="text-white/30"
          />
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
        
        <div className="relative z-10 text-center p-12 lg:p-24 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight uppercase font-display">
              Ready to automate <br /> your brand's growth?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-bold uppercase tracking-widest">
              Partner with the best. Join the Reelywood Network today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={onApplyClick}
              className="w-full sm:w-auto bg-[#ffde59] text-black px-10 py-6 border-[4px] border-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex items-center justify-center space-x-3 shadow-[8px_8px_0px_#834bf1]"
            >
              <CreditCard size={18} />
              <span>Get Your Creator Card</span>
            </button>
            <button className="w-full sm:w-auto bg-white text-black border-[4px] border-black px-10 py-6 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3">
              <span>See Works</span>
              <ArrowRight size={18} />
            </button>
          </div>
          
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.6em]">100% Trusted • High Impact • ROI Driven</p>
        </div>

        {/* Bottom Curved Loop Decoration */}
        <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none transform translate-y-24">
          <CurvedLoop 
            marqueeText="INNOVATE ✦ TRANSFORM ✦ SUCCEED ✦ REELYWOOD ✦"
            speed={2}
            curveAmount={-300}
            direction="right"
            interactive={false}
            className="text-indigo-400/20"
          />
        </div>
      </div>
    </section>
  );
};
