import React from 'react';
import { X, AlertCircle, Zap, Ticket } from 'lucide-react';

interface RedeemConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reward: any;
  isProcessing: boolean;
}

export const RedeemConfirmationModal: React.FC<RedeemConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reward,
  isProcessing 
}) => {
  if (!isOpen || !reward) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Heavy Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Neobrutalist Modal */}
      <div className="relative w-full max-w-md bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_#000] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Terminal Style */}
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center border-b-[4px] border-black">
          <div className="flex items-center gap-3">
            <Ticket size={18} className="text-[#ffde59]" />
            <h3 className="font-black text-xs uppercase tracking-[0.2em]">Redemption Protocol</h3>
          </div>
          <button onClick={onClose} className="hover:text-[#ffde59] transition-colors">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#ffde59] border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">
              <AlertCircle size={14} strokeWidth={3} />
              Auth Required
            </div>
            
            <h2 className="text-3xl font-black italic uppercase font-display leading-none tracking-tighter">
              Confirm <br/> Acquisition?
            </h2>
            
            <div className="bg-slate-50 border-[3px] border-black p-5 space-y-3">
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Selected Asset:</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-black uppercase italic">{reward.title}</span>
                <span className="text-xs font-black text-[#834bf1]">{reward.cost} RC</span>
              </div>
              <p className="text-[9px] font-bold uppercase text-black/60 border-t border-black/5 pt-3 leading-relaxed">
                Transmission of {reward.cost} ReelCoins will be finalized upon confirmation.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-full bg-black text-white py-5 border-[4px] border-black font-black uppercase text-xs tracking-[0.3em] shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="animate-pulse">Executing...</span>
              ) : (
                <>
                  <Zap size={16} fill="currentColor" />
                  <span>Execute Confirm</span>
                </>
              )}
            </button>
            
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="w-full bg-white text-black py-4 border-[4px] border-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Abort Mission
            </button>
          </div>
        </div>

        {/* System ID Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20">
            Node_{reward.id.slice(0,8)}_REDEMPTION_v4.1
          </p>
        </div>
      </div>
    </div>
  );
};