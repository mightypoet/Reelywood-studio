
import React from 'react';
import { ArrowRight, Zap, Target, Users, Trophy, Sparkles, Sword, Coins, CreditCard, MousePointer2 } from 'lucide-react';

interface LevelCardProps {
  level: string;
  title: string;
  desc: string;
  color: string;
  textColor: string;
  icon: React.ReactNode;
  shadowColor?: string;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, title, desc, color, textColor, icon, shadowColor = "#000" }) => (
  <div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[450px] py-6 md:py-10 px-4 md:px-6 snap-center group">
    <div 
      className={`relative h-[480px] md:h-[550px] ${color} border-[4px] md:border-[6px] border-black p-8 md:p-10 flex flex-col justify-between shadow-[8px_8px_0px_0px_${shadowColor}] md:shadow-[12px_12px_0px_0px_${shadowColor}] group-hover:-translate-y-4 group-hover:translate-x-2 transition-all duration-300`}
    >
      <div className="space-y-4 md:space-y-6">
        <div className="flex justify-between items-start">
          <div className="bg-black text-white px-3 md:px-4 py-1 md:py-1.5 border-[2px] md:border-[3px] border-black font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] italic">
            {level}
          </div>
          <div className={`w-12 h-12 md:w-16 md:h-16 bg-white border-[3px] md:border-[4px] border-black flex items-center justify-center ${textColor} shadow-[3px_3px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] group-hover:rotate-12 transition-transform`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6 md:w-8 md:h-8" })}
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <h3 className={`text-3xl md:text-4xl font-black italic uppercase font-display leading-[0.9] md:leading-none tracking-tighter ${textColor}`}>
            {title}
          </h3>
          <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-80 ${textColor}`}>
            {desc}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 md:pt-8 border-t-[2px] md:border-t-[3px] border-black/10">
        <div className="flex items-center space-x-2 text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-40 italic">
          <span>Level Progress</span>
          <div className="flex-1 h-1 md:h-1.5 bg-black/10">
            <div className="h-full bg-black/20 w-[40%] group-hover:w-full transition-all duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const GamifiedJourney: React.FC = () => {
  const levels = [
    {
      level: "Lvl 01",
      title: "The Artifact",
      desc: "The First Earn-as-you-Go Creator Card. NFC-powered, Mission-driven identity node for the elite.",
      color: "bg-[#ffde59]",
      textColor: "text-black",
      icon: <CreditCard strokeWidth={3} />
    },
    {
      level: "Lvl 02",
      title: "Game Loop",
      desc: "Simple Logic: Tap Card -> Complete Mission -> Redeem Value. Real value, zero friction.",
      color: "bg-white",
      textColor: "text-black",
      icon: <Zap strokeWidth={3} />
    },
    {
      level: "Player 1",
      title: "For Creators",
      desc: "Missions = Direct Opportunities. No agent paywalls. No gatekeepers. Pure performance arbitrage.",
      color: "bg-[#834bf1]",
      textColor: "text-white",
      icon: <Users strokeWidth={3} />
    },
    {
      level: "Player 2",
      title: "For Brands",
      desc: "Pay for outcomes, not hype. Gamified sampling at scale with surgical ROI precision.",
      color: "bg-[#3b82f6]",
      textColor: "text-white",
      icon: <Target strokeWidth={3} />
    },
    {
      level: "PvP Mode",
      title: "Reelywood vs Old World",
      desc: "Old World = Vanity Metrics & Bureaucracy. Reelywood = Sales Incentives & Dynamic Scale.",
      color: "bg-[#ef4444]",
      textColor: "text-white",
      icon: <Sword strokeWidth={3} />
    },
    {
      level: "Loot Table",
      title: "Unit Economics",
      desc: "Micro-Budgeting at Scale. Budget ₹5k -> High-Fidelity Product Vouchers -> Direct Sales Conversion.",
      color: "bg-[#22c55e]",
      textColor: "text-white",
      icon: <Coins strokeWidth={3} />
    },
    {
      level: "High Scores",
      title: "Social Proof",
      desc: "The Alliance is Growing. Top brands are switching because creators hate being undervalued.",
      color: "bg-[#ec4899]",
      textColor: "text-white",
      icon: <Trophy strokeWidth={3} />
    },
    {
      level: "Magic Item",
      title: "NFC Moment",
      desc: "The physical-digital bridge. One tap to join. Instant Identity, Access, and Rewards. True Magic.",
      color: "bg-black",
      textColor: "text-white",
      icon: <Sparkles strokeWidth={3} />
    }
  ];

  return (
    <section 
      className="bg-white dark:bg-[#0a0a0a] overflow-hidden border-t-[4px] md:border-t-[6px] border-black dark:border-white transition-colors duration-500 relative py-20 md:py-32"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:32px_32px] dark:bg-[radial-gradient(#fff_2px,transparent_2px)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-12 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-5 py-2 rounded-none text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-[4px_4px_0px_0px_#ffde59] md:shadow-[6px_6px_0px_0px_#ffde59]">
              <Target size={14} className="text-[#ffde59] animate-pulse" />
              <span>Operational Reelywood</span>
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-black dark:text-white leading-[0.9] md:leading-[0.85] tracking-tighter font-display uppercase italic">
              The User <br />
              <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#000] md:drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[3px_3px_0px_#fff]">Journey Map</span>
            </h2>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4 bg-[#ffde59] border-[3px] md:border-[4px] border-black px-6 md:px-8 py-3 md:py-5 shadow-[6px_6px_0px_0px_#000] md:shadow-[8px_8px_0px_0px_#000]">
            <MousePointer2 size={20} strokeWidth={3} className="text-black md:w-6 md:h-6" />
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-black italic">Swipe horizontally to explore</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto snap-x snap-mandatory flex scrollbar-hide pb-12">
        <div className="flex px-[5%] md:px-[10%] space-x-0 items-center">
          {levels.map((lvl, i) => (
            <React.Fragment key={i}>
              <LevelCard {...lvl} />
              {i < levels.length - 1 && (
                <div className="flex-shrink-0 w-12 md:w-24 flex items-center justify-center">
                  <div className="w-full h-1 border-t-[4px] md:border-t-[6px] border-dashed border-black/20"></div>
                </div>
              )}
            </React.Fragment>
          ))}
          
          {/* PRESS START CARD */}
          <div className="flex-shrink-0 w-[340px] md:w-[600px] py-6 md:py-10 px-4 md:px-6 snap-center">
            <div className="h-[480px] md:h-[550px] bg-[#ffde59] border-[4px] md:border-[6px] border-black p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-[10px_10px_0px_0px_#000] md:shadow-[16px_16px_0px_0px_#000] space-y-10 md:space-y-12">
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase font-display leading-[0.9] md:leading-none tracking-tighter text-black">
                  Press <br /> Start
                </h3>
                <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-black/60 italic">Initiate New Session</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md">
                <button className="flex-1 bg-black text-white py-5 md:py-6 border-[3px] md:border-[4px] border-black shadow-[4px_4px_0px_0px_#834bf1] md:shadow-[6px_6px_0px_0px_#834bf1] font-black uppercase text-[10px] md:text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3">
                  <span>Get Card</span>
                  <ArrowRight size={16} strokeWidth={3} className="md:w-4.5 md:h-4.5" />
                </button>
                <button className="flex-1 bg-white text-black py-5 md:py-6 border-[3px] md:border-[4px] border-black shadow-[4px_4px_0px_0px_#000] md:shadow-[6px_6px_0px_0px_#000] font-black uppercase text-[10px] md:text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3">
                  <span>Launch Mission</span>
                  <Zap size={16} strokeWidth={3} fill="currentColor" className="md:w-4.5 md:h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
