import React from 'react';
import { Zap, Gift, X, ArrowRight, Activity } from 'lucide-react';

interface NewAlertModalProps {
  notification: any;
  onClose: () => void;
}

export const NewAlertModal: React.FC<NewAlertModalProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const isMission = notification.type === 'MISSION_DEPLOYED';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_#000] animate-in zoom-in duration-300 overflow-hidden">
        
        {/* Header Decor */}
        <div className={`p-10 ${isMission ? 'bg-[#ffde59]' : 'bg-[#834bf1] text-white'} border-b-[6px] border-black text-center relative`}>
          <div className="absolute top-4 left-4 opacity-20">
            <Activity size={40} />
          </div>
          <div className="w-24 h-24 bg-white border-[5px] border-black mx-auto mb-6 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3 group-hover:rotate-0 transition-transform">
            {isMission ? <Zap size={40} className="text-[#834bf1]" fill="currentColor" /> : <Gift size={40} className="text-[#ffde59]" fill="currentColor" />}
          </div>
          <h2 className={`text-4xl font-black italic uppercase font-display tracking-tighter leading-[0.8] ${isMission ? 'text-black' : 'text-white'}`}>
            {isMission ? 'System <br/> Deployment' : 'Premium <br/> Drop'}
          </h2>
          <div className="mt-4 inline-block px-4 py-1 bg-black text-white text-[8px] font-black uppercase tracking-[0.5em] italic">
            Priority Protocol v4.1
          </div>
        </div>

        <div className="p-10 space-y-8 text-center">
          <div className="bg-slate-50 border-[4px] border-black p-8 shadow-[6px_6px_0px_0px_#834bf1]">
             <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.4em] mb-4 italic">Encrypted Transmission</p>
             <h4 className="text-2xl font-black uppercase italic font-display leading-tight">{notification.title}</h4>
             <p className="text-xs font-bold uppercase text-black/60 mt-6 leading-relaxed border-t-2 border-black/5 pt-6">{notification.message}</p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={onClose}
              className="w-full bg-black text-white py-6 border-[4px] border-black font-black uppercase text-xs tracking-[0.4em] shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-6 active:scale-95"
            >
              <span>Initialize Node</span>
              <ArrowRight size={22} strokeWidth={4} className="animate-bounce-x" />
            </button>
            <button 
              onClick={onClose}
              className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity"
            >
              Dismiss Signal
            </button>
          </div>
        </div>

        {/* Footer Sequence */}
        <div className="bg-black py-3 px-10 flex justify-between items-center">
           <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.6em]">REELYWOOD_HQ_NODE_01</span>
           <div className="flex gap-2">
             <div className="w-1.5 h-1.5 bg-[#ffde59] rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};