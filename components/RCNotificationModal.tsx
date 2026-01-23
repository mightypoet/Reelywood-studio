
import React, { useEffect, useState } from 'react';
import { Coins, Sparkles, PartyPopper, X } from 'lucide-react';

interface RCNotificationModalProps {
  amount: number;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const RCNotificationModal: React.FC<RCNotificationModalProps> = ({ 
  amount, 
  onClose, 
  title = "KA-CHING! 💸", 
  subtitle = "Admin just dropped some loot into your wallet." 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Add a satisfying sound if possible (fallback to silence if blocked)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg bg-[#ffde59] border-[8px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 text-center transform transition-all duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'}`}>
        {/* Floating Sparkles */}
        <div className="absolute top-4 left-4 animate-pulse text-black"><Sparkles size={32} /></div>
        <div className="absolute bottom-4 right-4 animate-bounce text-black"><PartyPopper size={32} /></div>

        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-white border-[6px] border-black rounded-full flex items-center justify-center mx-auto shadow-[8px_8px_0px_0px_#000] animate-bounce">
            <Coins size={48} className="text-[#834bf1]" strokeWidth={2.5} />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex space-x-1 justify-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-3 h-3 bg-white border-2 border-black rounded-full animate-ping`} style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase font-display text-black tracking-tighter leading-none">
            {title}
          </h2>
          <p className="text-sm font-black uppercase tracking-[0.1em] text-black/60 max-w-xs mx-auto italic leading-tight">
            {subtitle}
          </p>
        </div>

        <div className="my-10 py-6 bg-black border-[4px] border-black shadow-inner">
          <div className="text-5xl md:text-7xl font-black italic font-display text-[#ffde59] tracking-tighter animate-pulse">
            + {amount.toLocaleString()} <span className="text-2xl not-italic tracking-normal">RC</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-[#834bf1] text-white py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xl tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group"
        >
          <span className="flex items-center justify-center gap-4">
            CLAIM LOOT <Coins className="group-hover:rotate-12 transition-transform" />
          </span>
        </button>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-black/30">REELYWOOD LEDGER SYNC v4.5</p>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};
