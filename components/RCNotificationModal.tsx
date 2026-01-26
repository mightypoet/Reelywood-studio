
import React, { useEffect, useState } from 'react';
// Added CheckCircle2 to imports
import { Coins, Sparkles, PartyPopper, X, Trophy, Zap, CheckCircle2 } from 'lucide-react';

interface RCNotificationModalProps {
  amount: number;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  coverImage?: string;
}

export const RCNotificationModal: React.FC<RCNotificationModalProps> = ({ 
  amount, 
  onClose, 
  title = "LOOT RECEIVED! 💸", 
  subtitle = "Admin just dropped some loot into your wallet.",
  coverImage
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Arcade style sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] flex flex-col overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-6'}`}>
        
        {/* Header - Arcade Style */}
        <header className="bg-black text-white p-5 flex justify-between items-center border-b-[6px] border-black">
          <div className="flex items-center gap-3">
             <div className="bg-[#ffde59] p-2 border-2 border-black rotate-3 shrink-0">
               <Zap size={20} fill="black" className="text-black" />
             </div>
             <div>
               <h2 className="text-xl font-black italic uppercase font-display leading-none">Transmission Decoded</h2>
               <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Loot Protocol v4.5</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500 transition-colors">
            <X size={20} strokeWidth={4} />
          </button>
        </header>

        {/* Optional Cover Image */}
        {coverImage && (
          <div className="h-48 w-full border-b-[6px] border-black bg-slate-900 overflow-hidden relative">
             <img src={coverImage} className="w-full h-full object-cover grayscale-[30%] opacity-80" alt="Reward Hub" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        <main className="p-8 md:p-10 text-center space-y-8 bg-[#fdfdfd]">
          <div className="relative inline-block">
             <div className="w-24 h-24 bg-[#ffde59] border-[6px] border-black shadow-[8px_8px_0px_0px_#000] flex items-center justify-center mx-auto -rotate-6 animate-bounce">
                <Coins size={48} className="text-black" strokeWidth={3} />
             </div>
             <div className="absolute -top-4 -right-4 text-[#834bf1] animate-pulse">
                <Sparkles size={32} />
             </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-4xl md:text-5xl font-black italic uppercase font-display leading-none text-black tracking-tighter">
              {title}
            </h3>
            <p className="text-xs font-black uppercase tracking-widest text-black/40 italic leading-relaxed border-l-[6px] border-[#834bf1] pl-6 py-1 max-w-sm mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="bg-slate-50 border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] relative group">
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-white shadow-[3px_3px_0px_0px_#ffde59]">
                ASSET SYNC
             </div>
             <div className="text-5xl md:text-7xl font-black italic font-display text-[#834bf1] tracking-tighter">
                + {amount.toLocaleString()} <span className="text-2xl not-italic tracking-normal align-middle">RC</span>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-black text-white py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#ffde59] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group flex items-center justify-center gap-4"
          >
            CONFIRM RECEIPT <CheckCircle2 className="group-hover:scale-110 transition-transform" />
          </button>
        </main>

        <footer className="p-4 bg-slate-100 border-t-[4px] border-black text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 italic">Secure Ledger Handshake v4.5.1</p>
        </footer>
      </div>
    </div>
  );
};
