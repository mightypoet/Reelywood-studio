
import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { PartnerBrands } from './PartnerBrands';

interface HeroProps {
  onAuthClick: () => void;
  onDashboardClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick, onDashboardClick }) => {
  return (
    <section 
      className="relative min-h-[90svh] md:min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors overflow-x-hidden"
    >
      <div className="flex-1 flex items-center relative z-10 pt-28 md:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-4xl space-y-8 md:space-y-12">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-4 md:px-6 py-2 rounded-none text-white font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-[4px_4px_0px_0px_#834bf1] md:shadow-[6px_6px_0px_0px_#834bf1]">
              <Zap size={12} className="text-[#ffde59] animate-pulse md:w-3.5 md:h-3.5" />
              <span>HIGH-PERFORMANCE BRAND SYSTEMS</span>
            </div>

            <div className="space-y-2 md:space-y-4">
              <h1 className="flex flex-col text-5xl sm:text-7xl md:text-9xl lg:text-[140px] font-black text-black dark:text-white leading-[0.85] md:leading-[0.8] tracking-tighter font-display uppercase italic">
                <span>SWIPE</span>
                <span className="text-[#834bf1]">PROMOTE</span>
                <div className="flex items-center">
                  <span>EARN</span>
                  <Sparkles className="ml-3 md:ml-4 text-[#ffde59] w-10 h-10 md:w-12 md:h-12 lg:w-[48px] lg:h-[48px]" strokeWidth={3} />
                </div>
              </h1>
              
              <div className="flex items-start pt-6 md:pt-10 max-w-3xl relative">
                <div className="flex-1 py-1 md:py-2">
                  <p className="text-base sm:text-lg md:text-2xl text-black dark:text-white font-black uppercase italic tracking-tight leading-[1.2] md:leading-[1.1]">
                    The Reelywood Creator Card turns creator influence <br className="hidden md:block" /> into a gamified marketing engine for brands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full mt-auto overflow-hidden">
        <PartnerBrands />
      </div>
    </section>
  );
};
