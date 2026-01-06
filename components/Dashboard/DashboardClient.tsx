
import React from 'react';
import { ThreeDCard } from '../ThreeDCard';
import { Lock, Clock, Wallet, Target, Sparkles, Zap, ShieldCheck, Ticket, ChevronRight } from 'lucide-react';
import { DashboardData } from '../../hooks/useCreatorDashboard';

interface DashboardClientProps {
  dashboardResult: DashboardData | null;
  userName: string;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ dashboardResult, userName }) => {
  const isLocked = !dashboardResult || dashboardResult.status === 'LOCKED';
  const data = dashboardResult;

  return (
    <div className="space-y-16 animate-in fade-in duration-700 max-w-6xl mx-auto pb-24">
      
      {/* 1. Header & Digital Card Section */}
      <div className="flex flex-col items-center space-y-12 py-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#ffde59]">
            <ShieldCheck size={14} className={isLocked ? "text-white/40" : "text-[#ffde59]"} />
            <span>Identity Node {isLocked ? 'Syncing' : 'Authorized'}</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-none">
            Creator <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Hub</span>
          </h2>
        </div>

        <div className="relative">
          <ThreeDCard 
            name={userName} 
            handle={`@${userName.toLowerCase().split(' ')[0]}`} 
          />
          {isLocked && (
            <div className="absolute inset-0 z-40 bg-white/40 dark:bg-black/40 backdrop-blur-md flex items-center justify-center rounded-[32px] border-[4px] border-dashed border-black/20">
               <div className="bg-[#ffde59] border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_#000] text-center rotate-3 scale-90 sm:scale-100">
                  <Clock size={48} className="mx-auto mb-4 text-black animate-pulse" />
                  <h3 className="font-black uppercase text-lg tracking-tighter text-black">Under Review</h3>
                  <p className="font-bold uppercase text-[9px] tracking-widest text-black/60 mt-2">Sync: 24-48 Hours</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Grid for Wallet, Missions, Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative">
        
        {/* SHARED LOCK OVERLAY FOR MODULES */}
        {isLocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="bg-black text-white px-10 py-10 border-[5px] border-white shadow-[16px_16px_0px_0px_#834bf1] text-center space-y-6 max-w-sm pointer-events-auto">
                <Lock size={48} className="mx-auto text-[#ffde59]" />
                <h3 className="font-black uppercase tracking-tighter text-3xl italic">Encrypted Modules</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                   Operational data and Mission archives require an <span className="text-[#ffde59]">ACTIVE</span> Identity Card.
                </p>
                <button className="w-full bg-[#ffde59] text-black py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#fff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Check Sync Progress
                </button>
             </div>
          </div>
        )}

        {/* Wallet & Vouchers (Left Side) */}
        <div className={`lg:col-span-5 space-y-10 transition-all duration-1000 ${isLocked ? 'blur-2xl grayscale pointer-events-none select-none' : ''}`}>
          {/* Wallet Module */}
          <div className="bg-white dark:bg-[#111] border-[4px] border-black p-8 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#834bf1]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#834bf1] border-[2px] border-black flex items-center justify-center text-white shadow-[3px_3px_0px_#000]">
                  <Wallet size={18} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs italic text-black dark:text-white">Vault</h3>
              </div>
              <Sparkles className="text-[#ffde59] animate-pulse" />
            </div>
            <div className="flex items-baseline space-x-4">
              <span className="text-7xl font-black font-display italic tracking-tighter text-black dark:text-white">
                 {data?.walletBalance?.toLocaleString() || "0"}
              </span>
              <span className="text-xl font-black text-[#834bf1] uppercase tracking-widest">RC</span>
            </div>
          </div>

          {/* Vouchers Module */}
          <div className="bg-[#ffde59] border-[4px] border-black p-8 shadow-[10px_10px_0px_0px_#000]">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-black border-[2px] border-black flex items-center justify-center text-[#ffde59] shadow-[3px_3px_0px_#fff]">
                <Ticket size={18} strokeWidth={3} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs italic text-black">Vouchers</h3>
            </div>
            
            <div className="space-y-4">
              {data?.vouchers && data.vouchers.length > 0 ? (
                data.vouchers.map((v: any) => (
                  <div key={v.id} className="bg-white border-[3px] border-black p-4 flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-transform">
                    <div>
                      <p className="font-black text-[10px] uppercase text-black/40">{v.brandName}</p>
                      <p className="font-black text-sm text-black uppercase">{v.code}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-xs text-[#834bf1]">₹{v.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center border-[2px] border-dashed border-black/20">
                  <p className="text-[9px] font-black uppercase text-black/30 tracking-widest">No vouchers granted</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Missions (Right Side) */}
        <div className={`lg:col-span-7 transition-all duration-1000 ${isLocked ? 'blur-2xl grayscale pointer-events-none select-none' : ''}`}>
          <div className="bg-white dark:bg-[#111] border-[4px] border-black p-10 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#ffde59] h-full">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black border-[2px] border-black flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#834bf1]">
                  <Target size={18} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs italic text-black dark:text-white">Missions</h3>
              </div>
            </div>
            
            <div className="space-y-6">
              {data?.missions && data.missions.length > 0 ? (
                data.missions.map((m: any) => (
                  <div key={m.id} className="bg-slate-50 dark:bg-white/5 border-[3px] border-black p-6 flex justify-between items-center group cursor-pointer hover:bg-white dark:hover:bg-[#111] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#834bf1]">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                         <span className="text-[9px] font-black text-[#834bf1] uppercase tracking-widest">+{m.rewardAmount} RC</span>
                      </div>
                      <h4 className="font-black text-xl text-black dark:text-white uppercase font-display italic leading-none">{m.title}</h4>
                      <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase">{m.description}</p>
                    </div>
                    <div className="w-12 h-12 bg-black border-[3px] border-black flex items-center justify-center text-white group-hover:bg-[#834bf1] group-hover:rotate-12 transition-all">
                      <Zap size={20} fill="currentColor" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 border-[2px] border-dashed border-black/20 mx-auto flex items-center justify-center rounded-full">
                    <Target size={24} className="text-black/10" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Awaiting Commands...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
