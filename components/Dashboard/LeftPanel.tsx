
import React from 'react';
import { ThreeDCard } from '../ThreeDCard';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Sparkles, Lock, CreditCard, ChevronRight, Clock, AlertCircle } from 'lucide-react';

interface LeftPanelProps {
  cardStatus: 'none' | 'pending' | 'approved' | 'rejected';
  balance: number;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ cardStatus, balance }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 sticky top-28">
      {/* Creator Card Section */}
      <div className="bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CreditCard size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Identity Card</h3>
          </div>
          {cardStatus === 'pending' && (
            <div className="bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-500/20 flex items-center space-x-2">
              <Clock size={12} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Under Review</span>
            </div>
          )}
        </div>

        <div className="relative aspect-[4/5] w-full max-w-[320px] mx-auto perspective-2000">
          {cardStatus === 'approved' ? (
            <ThreeDCard name={user?.displayName || "Creator"} handle={`@${user?.displayName?.split(' ')[0].toLowerCase()}`} />
          ) : (
            <div className={`w-full h-full rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-white/[0.01] transition-all ${cardStatus === 'pending' ? 'grayscale opacity-50 cursor-wait' : ''}`}>
              <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 dark:text-white/10 mb-6 shadow-inner">
                {cardStatus === 'pending' ? <Clock size={32} /> : <CreditCard size={32} />}
              </div>
              <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight mb-2">
                {cardStatus === 'pending' ? 'Card In Production' : 'Card Not Applied'}
              </h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">
                {cardStatus === 'pending' 
                  ? "Your physical node is being configured. Estimated sync: 24h."
                  : "Apply for your Reelywood Creator Card to unlock the full ecosystem."}
              </p>
              
              {cardStatus === 'none' && (
                <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ReelCoin Wallet Section */}
      <div className={`bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 shadow-sm transition-all overflow-hidden relative ${cardStatus !== 'approved' ? 'opacity-60 grayscale' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Wallet size={20} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">ReelCoin Wallet</h3>
          </div>
          <Sparkles size={18} className="text-amber-400 animate-pulse" />
        </div>

        {cardStatus === 'approved' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-3xl shadow-xl shadow-amber-200/50 dark:shadow-none text-white relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Current Balance</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-5xl font-black tracking-tighter">{balance.toLocaleString()}</span>
                <span className="text-xs font-black uppercase tracking-widest opacity-80">ReelCoins</span>
              </div>
              <p className="text-[9px] mt-6 font-bold uppercase tracking-widest opacity-60">Earn more by completing missions</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">History preview</p>
              <div className="space-y-2">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <ChevronRight size={14} className="rotate-[-90deg]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Mission Reward</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Today, 14:20</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500">+150</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Lock size={20} />
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-[240px] mx-auto leading-relaxed">
              Your ReelCoin wallet will activate after your Creator Card is <span className="text-indigo-600 font-black">approved</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
