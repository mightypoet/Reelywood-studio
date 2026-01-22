
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Calendar, Sparkles, Bot, Building2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { PartnerBrands } from './PartnerBrands';

interface HeroProps {
  onAuthClick: () => void;
  onDashboardClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick, onDashboardClick }) => {
  const MASCOT_ICON = "https://gkaffrpzczamnawhmlph.supabase.co/storage/v1/object/public/brand-assets/5.png";

  return (
    <section 
      className="relative min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors overflow-x-hidden"
    >
      <div className="flex-1 flex items-center relative z-10 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl space-y-12">
            <div className="inline-flex items-center space-x-4 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <Zap size={14} className="text-[#ffde59] animate-pulse" />
              <span>High-Performance Brand Systems</span>
            </div>

            <div className="space-y-4">
              <h1 className="flex flex-col text-7xl md:text-9xl lg:text-[140px] font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
                <span>Scale</span>
                <span className="text-[#834bf1]">Automate</span>
                <div className="flex items-center">
                  <span>Dominate</span>
                  <Sparkles className="ml-4 text-[#ffde59] hidden md:block" size={48} />
                </div>
              </h1>
              
              <div className="flex items-start pt-6 max-w-2xl relative">
                <div className="flex items-center gap-0">
                  <div className="w-[12px] h-16 bg-[#ffde59] border-y-[3px] border-l-[3px] border-black"></div>
                  <div className="shrink-0 w-16 h-16 bg-[#834bf1] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white overflow-hidden p-2">
                    <img 
                      src={MASCOT_ICON} 
                      alt="Mascot Icon"
                      className="w-full h-full object-contain scale-110"
                    />
                  </div>
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-black uppercase italic tracking-tight leading-tight">
                    Architecting digital dominance through human-AI synergy. Surgical execution for the modern SME.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-8">
              <button onClick={onDashboardClick} className="group w-full sm:w-auto bg-[#834bf1] text-white px-12 py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2">
                <span>Claim Creator ID</span> <Calendar size={22} className="group-hover:rotate-12 transition-transform" />
              </button>
              <button onClick={onAuthClick} className="w-full sm:w-auto bg-white text-black px-12 py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group">
                <span>BRAND LOGIN / ENTER HUB</span> <Building2 size={22} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full mt-auto">
        <PartnerBrands />
      </div>
    </section>
  );
};
