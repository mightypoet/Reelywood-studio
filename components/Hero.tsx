
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Gamepad2, 
  ArrowRight, 
  Coins, 
  Smartphone, 
  Target, 
  Monitor,
  Trophy
} from 'lucide-react';

interface HeroProps {
  onAuthClick: () => void;
  onDashboardClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick, onDashboardClick }) => {
  const [seconds, setSeconds] = useState(9);
  const [rcCount, setRcCount] = useState(0);

  // Gamified timer for the footer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 1 ? prev - 1 : 9));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Furious counter for the Loot Drop
  useEffect(() => {
    const counter = setInterval(() => {
      setRcCount(prev => (prev < 5000 ? prev + 127 : 5000));
    }, 50);
    return () => clearInterval(counter);
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col bg-white overflow-hidden pt-16 md:pt-20">
      {/* Aggressive Photocopy Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-50"></div>

      {/* 1. MASSIVE HEADLINE - Fluid sizing */}
      <div className="w-full px-4 py-8 md:py-20 text-center border-b-[6px] md:border-b-[8px] border-black bg-[#ffde59] relative z-10">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-7xl lg:text-[100px] font-black text-black leading-[0.8] tracking-tighter font-display uppercase italic">
              GAME OVER FOR
            </h1>
            <div className="inline-block bg-black text-[#ffde59] px-3 md:px-6 py-2 -rotate-1 mt-1 border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-3xl sm:text-7xl lg:text-[100px] font-black uppercase font-display italic leading-none">VANITY METRICS.</span>
            </div>
          </div>
          
          <div className="pt-4 md:pt-6">
            <div className="inline-flex items-center space-x-2 md:space-x-4 bg-black text-white px-4 md:px-8 py-3 md:py-4 border-[3px] md:border-[4px] border-black shadow-[4px_4px_0px_0px_#834bf1] md:shadow-[8px_8px_0px_0px_#834bf1]">
               <Gamepad2 className="animate-bounce shrink-0 w-5 h-5 md:w-7 md:h-7" />
               <p className="text-[10px] md:text-2xl font-black uppercase tracking-widest italic leading-none">
                 WELCOME TO THE CREATOR COMMERCE ARCADE
               </p>
            </div>
          </div>

          <p className="text-black font-black uppercase italic tracking-tight text-base sm:text-xl md:text-3xl mt-4 md:mt-8 max-w-xs sm:max-w-4xl mx-auto leading-tight">
            INSERT COIN. TRACK SALES. EARN LOOT. THE CARD THAT TURNS EVERY POST INTO A PAYOUT ENGINE.
          </p>
        </div>
      </div>

      {/* 2. THE MAIN VISUAL ENGINE - Vertical Stack on Mobile */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] relative">
        
        {/* A. PLAYER 1: THE CREATOR (Purple) */}
        <div className="bg-[#834bf1] p-6 sm:p-8 md:p-20 border-b-[4px] md:border-b-0 md:border-r-[8px] border-black relative overflow-hidden group">
          <div className="relative z-10 space-y-8 md:space-y-16">
            <div className="bg-black text-white inline-block px-5 py-2 md:px-8 md:py-4 border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59] -rotate-2">
              <h3 className="text-xl md:text-5xl font-black italic uppercase font-display">PLAYER 1: CREATOR</h3>
            </div>
            
            <div className="space-y-8 md:space-y-12">
              {/* Step 1 */}
              <div className="flex items-center gap-4 md:gap-8 group/step">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white border-[4px] md:border-[6px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] rotate-6 shrink-0 transition-transform group-hover/step:rotate-0">
                  <Gamepad2 className="w-7 h-7 md:w-10 md:h-10" />
                </div>
                <div>
                  <p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60 text-black mb-1">MISSION: SUMMER DROP</p>
                  <button className="bg-black text-white px-3 py-1 text-[8px] md:text-sm font-black uppercase border-[2px] md:border-[4px] border-white transition-colors hover:bg-white hover:text-black">PRESS START</button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4 md:gap-8 group/step">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-[#ffde59] border-[4px] md:border-[6px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] -rotate-6 shrink-0 transition-transform group-hover/step:rotate-0">
                  <Smartphone className="w-7 h-7 md:w-10 md:h-10" />
                </div>
                <p className="text-base md:text-3xl font-black uppercase italic leading-[0.9] text-black">DEPLOY CONTENT <br className="hidden md:block" /> + CARD LINK</p>
              </div>

              {/* Step 3 (Reward Node) */}
              <div className="relative pt-2">
                <div className="bg-white border-[4px] md:border-[6px] border-black p-4 md:p-8 shadow-[8px_8px_0px_0px_#000] md:shadow-[15px_15px_0px_0px_#000] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <span className="font-black text-[9px] md:text-sm uppercase tracking-widest text-black">LOOT DROP ACTIVE</span>
                    <Coins className="text-[#22c55e] animate-bounce shrink-0 w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-4xl md:text-7xl font-black text-black italic font-display">+{rcCount.toLocaleString()}</span>
                    <span className="text-xs md:text-xl font-black uppercase text-[#22c55e]">RC GAINED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 right-4 rotate-12 z-20 scale-90 md:scale-110">
            <div className="bg-[#ffde59] border-[3px] md:border-[6px] border-black px-4 py-3 md:px-8 md:py-6 shadow-[6px_6px_0px_0px_#000] font-black text-sm md:text-2xl italic uppercase font-display leading-none text-black">
              EVERY.<br/>SINGLE.<br/>POST.<br/>PAYS.
            </div>
          </div>
        </div>

        {/* B. THE CENTERPIECE - Scaling for mobile */}
        <div className="bg-black w-full md:w-48 lg:w-72 flex items-center justify-center relative py-12 md:py-0 overflow-visible z-30 border-y-[4px] md:border-y-0 border-black">
          <div className="absolute inset-0 bg-[#834bf1] opacity-5 animate-pulse md:hidden"></div>
          
          <div className="relative group scale-75 sm:scale-90 md:scale-100 transition-transform hover:scale-105">
            <div className="w-48 sm:w-72 h-64 sm:h-[450px] bg-black border-[6px] md:border-[10px] border-black shadow-[15px_15px_0px_0px_#834bf1] md:shadow-[25px_25px_0px_0px_#834bf1] flex flex-col">
              <div className="flex-1 bg-[#834bf1] m-2 sm:m-4 border-[4px] md:border-[6px] border-black p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
                <div className="w-full h-2 bg-black/30 rounded-full"></div>
                <div className="text-center py-4 sm:py-10">
                  <Monitor className="mx-auto text-white mb-2 sm:mb-4 animate-pulse w-8 h-8 md:w-16 md:h-16" />
                  <p className="text-[8px] md:text-[11px] font-black text-white uppercase tracking-[0.2em] leading-tight">
                    THE TRANSACTION <br/> ENGINE
                  </p>
                </div>
                <div className="bg-white p-1 sm:p-2 text-[7px] md:text-[10px] font-black text-center uppercase text-black border-[2px] md:border-[4px] border-black shadow-[3px_3px_0px_0px_#000]">
                  LVL 99 COMMERCE LINK
                </div>
              </div>
              <div className="h-10 sm:h-16 bg-slate-900 border-t-[4px] border-black grid grid-cols-8 gap-1 p-1 sm:p-3">
                {[...Array(8)].map((_, i) => <div key={i} className="bg-[#ffde59] h-full w-full"></div>)}
              </div>
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
               <div className="bg-[#ffde59] text-black border-[2px] md:border-[4px] border-black px-3 py-1 text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap shadow-[4px_4px_0px_0px_#000] animate-bounce">
                 POWER UP
               </div>
            </div>
          </div>
        </div>

        {/* C. PLAYER 2: THE BRAND (Blue) */}
        <div className="bg-[#3b82f6] p-6 sm:p-8 md:p-20 border-t-[4px] md:border-t-0 md:border-l-[8px] border-black relative overflow-hidden group">
           <div className="relative z-10 space-y-8 md:space-y-16 flex flex-col items-end">
            <div className="bg-black text-white inline-block px-5 py-2 md:px-8 md:py-4 border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59] rotate-2 text-right">
              <h3 className="text-xl md:text-5xl font-black italic uppercase font-display">PLAYER 2: BRAND</h3>
            </div>

            <div className="space-y-8 md:space-y-12 w-full max-w-lg flex flex-col items-end">
              {/* Step 1 */}
              <div className="flex items-center gap-4 md:gap-8 group/step flex-row-reverse">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white border-[4px] md:border-[6px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] rotate-3 shrink-0 transition-transform group-hover/step:rotate-0">
                  <div className="w-6 h-1 bg-black rotate-90 rounded-full"></div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] opacity-60 text-black mb-1">INSERT COIN NODE</p>
                  <p className="text-base md:text-3xl font-black uppercase italic leading-[0.9] text-black">LOAD BUDGET <br/> (SET BOUNTY)</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4 md:gap-8 group/step flex-row-reverse w-full">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-[#ffde59] border-[4px] md:border-[6px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] rotate-6 shrink-0 transition-transform group-hover/step:rotate-0">
                  <Target className="w-7 h-7 md:w-10 md:h-10" />
                </div>
                <div className="flex-1 bg-black border-[3px] md:border-[5px] border-black p-3 sm:p-6 text-center relative overflow-hidden h-16 sm:h-24 flex flex-col justify-center">
                   <p className="text-[8px] md:text-sm font-black text-[#3b82f6] uppercase tracking-[0.1em]">REAL-TIME SALES TRACKING</p>
                   <p className="text-[6px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">(NO CHEATS)</p>
                </div>
              </div>

              {/* Step 3 (High Score) */}
              <div className="relative pt-2 w-full">
                <div className="bg-black text-white border-[4px] md:border-[6px] border-black p-4 sm:p-8 shadow-[8px_8px_0px_0px_#3b82f6] md:shadow-[15px_15px_0px_0px_#3b82f6] relative overflow-hidden transition-transform hover:scale-[1.02]">
                  <div className="flex justify-between items-center mb-3 md:mb-6 border-b-2 border-white/10 pb-2 md:pb-4">
                    <span className="font-black text-[8px] md:text-xs uppercase tracking-[0.2em]">HIGH SCORE LEADERBOARD</span>
                    <Trophy className="text-[#ec4899] shrink-0 w-5 h-5 md:w-8 md:h-8" />
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex justify-between items-center text-xs md:text-lg font-black italic">
                       <span className="text-white/40 font-display">SALES:</span>
                       <span className="text-emerald-400 text-sm md:text-2xl">$50,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs md:text-lg font-black italic">
                       <span className="text-white/40 font-display">SPENT:</span>
                       <span className="text-rose-500 text-sm md:text-2xl">$5,000</span>
                    </div>
                  </div>
                  {/* Overlay Stamp - Only visible on wider mobiles/desktops */}
                  <div className="absolute inset-0 flex items-center justify-center rotate-[-15deg] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="border-[6px] md:border-[10px] border-[#22c55e] text-[#22c55e] px-4 md:px-8 py-2 md:py-4 text-xl md:text-5xl font-black uppercase font-display bg-black/60 backdrop-blur-sm">ROI UNLOCKED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-4 -rotate-12 z-20 scale-90 md:scale-110">
            <div className="bg-black text-white border-[3px] md:border-[6px] border-[#22c55e] px-4 py-3 md:px-8 md:py-6 shadow-[6px_6px_0px_0px_#22c55e] font-black text-sm md:text-2xl italic uppercase font-display leading-none">
              ZERO<br/>GUESSWORK.<br/>100%<br/>ATTRIBUTION.
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER / CTA BAR - Vertical Buttons on Mobile */}
      <div className="bg-black border-t-[6px] md:border-t-[10px] border-black py-8 md:py-16 relative z-40 overflow-hidden">
        <div className="absolute inset-0 opacity-10 whitespace-nowrap text-white font-black text-[60px] md:text-[150px] uppercase select-none pointer-events-none italic overflow-hidden">
           CONTINUE? CONTINUE? CONTINUE? 
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
          <button 
            onClick={onDashboardClick}
            className="w-full md:w-auto group relative bg-[#834bf1] text-white px-8 md:px-14 py-6 md:py-10 border-[4px] md:border-[8px] border-black shadow-[6px_6px_0px_0px_#ffde59] md:shadow-[15px_15px_0px_0px_#ffde59] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95"
          >
            <span className="text-base sm:text-2xl md:text-4xl font-black uppercase font-display italic flex items-center justify-center gap-3 md:gap-6">
              CREATORS: JOIN <ArrowRight className="w-6 h-6 md:w-12 md:h-12" strokeWidth={5}/>
            </span>
          </button>

          <div className="flex flex-col items-center py-2">
            <p className="text-[#ffde59] font-black text-sm sm:text-2xl md:text-4xl uppercase font-display italic animate-flicker tracking-tight">
              INSERT QUARTER... 0:{seconds < 10 ? `0${seconds}` : seconds}
            </p>
            <div className="flex gap-2 md:gap-3 mt-2 md:mt-6">
               {[...Array(9)].map((_, i) => (
                 <div key={i} className={`w-2 h-2 md:w-4 md:h-4 border-[1px] md:border-[3px] border-[#ffde59] transition-all duration-300 ${i < seconds ? 'bg-[#ffde59]' : 'opacity-20'}`}></div>
               ))}
            </div>
          </div>

          <button 
            onClick={onAuthClick}
            className="w-full md:w-auto group relative bg-[#3b82f6] text-white px-8 md:px-14 py-6 md:py-10 border-[4px] md:border-[8px] border-black shadow-[6px_6px_0px_0px_#834bf1] md:shadow-[15px_15px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95"
          >
            <span className="text-base sm:text-2xl md:text-4xl font-black uppercase font-display italic flex items-center justify-center gap-3 md:gap-6">
              BRANDS: START <Zap className="w-6 h-6 md:w-12 md:h-12" fill="white" />
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-flicker {
          animation: flicker 2s infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #834bf1;
          border: 1px solid #000;
        }
      `}</style>
    </section>
  );
};
