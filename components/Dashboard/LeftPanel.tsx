
import React from 'react';
import { ThreeDCard } from '../ThreeDCard';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Sparkles, Lock, CreditCard, ChevronRight, Clock, ShieldCheck } from 'lucide-react';

interface LeftPanelProps {
  cardStatus: 'none' | 'pending' | 'approved' | 'rejected';
  balance: number;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ cardStatus, balance }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-10 sticky top-32">
      {/* Creator Card Section */}
      <div className="bg-white dark:bg-[#111] border-[4px] border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_#834bf1]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#834bf1] border-[2px] border-black flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard size={18} strokeWidth={3} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.1em] text-black dark:text-white font-display italic">Identity Card</h3>
          </div>
          
          {cardStatus === 'pending' && (
            <div className="bg-[#ffde59] border-[2px] border-black px-3 py-1 flex items-center space-x-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Clock size={12} strokeWidth={3} className="text-black" />
              <span className="text-[9px] font-black uppercase tracking-widest text-black">In Sync</span>
            </div>
          )}
        </div>

        <div className="relative aspect-[4/5] w-full max-w-[320px] mx-auto perspective-2000">
          {cardStatus === 'approved' ? (
            <ThreeDCard name={user?.displayName || "Creator"} handle={`@${user?.displayName?.split(' ')[0].toLowerCase()}`} />
          ) : (
            <div className={`w-full h-full border-[4px] border-black dark:border-white flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-white/[0.02] transition-all ${cardStatus === 'pending' ? 'grayscale opacity-50 cursor-wait' : ''}`}>
              <div className="w-16 h-16 bg-white dark:bg-black border-[3px] border-black dark:border-white flex items-center justify-center text-black dark:text-white mb-6 shadow-[6px_6px_0px_0px_#000]">
                {cardStatus === 'pending' ? <Clock size={32} strokeWidth={3} /> : <Lock size={32} strokeWidth={3} />}
              </div>
              <h4 className="text-black dark:text-white font-black uppercase tracking-tight mb-2 font-display italic">
                {cardStatus === 'pending' ? 'Production Active' : 'Access Denied'}
              </h4>
              <p className="text-black/60 dark:text-white/60 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8">
                {cardStatus === 'pending' 
                  ? "Configuring your physical node. estimated sync: 24h."
                  : "Sync your creator ID to access the Reelywood ecosystem."}
              </p>
              
              {cardStatus === 'none' && (
                <button className="w-full bg-[#ffde59] text-black py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Initiate Sync
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ReelCoin Wallet Section */}
      <div className={`bg-white dark:bg-[#111] border-[4px] border-black dark:border-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_#ffde59] transition-all relative overflow-hidden ${cardStatus !== 'approved' ? 'opacity-50 grayscale' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#ffde59] border-[2px] border-black flex items-center justify-center text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Wallet size={18} strokeWidth={3} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.1em] text-black dark:text-white font-display italic">ReelCoin Node</h3>
          </div>
          <Sparkles size={18} className="text-[#834bf1] animate-pulse" />
        </div>

        {cardStatus === 'approved' ? (
          <div className="space-y-8">
            <div className="bg-[#834bf1] border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] text-white relative group">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Liquid Assets</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-6xl font-black tracking-tighter italic font-display">{balance.toLocaleString()}</span>
                <span className="text-xs font-black uppercase tracking-widest text-[#ffde59]">RC</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/40 italic">Sync History</p>
              <div className="space-y-3">
                <div className="bg-white dark:bg-black border-[3px] border-black dark:border-white p-4 flex items-center justify-between hover:translate-x-1 transition-transform cursor-help">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 border-[2px] border-black flex items-center justify-center text-white">
                      <ChevronRight size={14} strokeWidth={3} className="rotate-[-90deg]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-black dark:text-white uppercase italic">Mission Reward</p>
                      <p className="text-[8px] text-black/40 dark:text-white/40 font-black uppercase">Today • 14:20</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500">+150 RC</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-4 bg-slate-50 dark:bg-black/40 border-[2px] border-dashed border-black/20 dark:border-white/10">
            <Lock size={24} className="text-black/20 dark:text-white/20 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40 max-w-[180px] mx-auto leading-relaxed">
              Wallet encryption unlocks after <span className="text-[#834bf1]">Card Sync</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
