
import React from 'react';
import { ThreeDCard } from '../ThreeDCard';
import { Lock, Clock, ShieldAlert, Wallet, Target, Sparkles, Zap } from 'lucide-react';

interface DashboardProps {
  dashboardResult: any; // Type based on getCreatorDashboard return
  userName: string;
}

export const DashboardClient: React.FC<DashboardProps> = ({ dashboardResult, userName }) => {
  const isLocked = dashboardResult.status === 'LOCKED';
  const data = dashboardResult.data;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* 1. Header & Digital Card */}
      <div className="flex flex-col items-center space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter">
            Creator <span className="text-[#834bf1]">Node</span>
          </h2>
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#ffde59]">
            <span>Status: {isLocked ? 'Syncing...' : 'Authorized'}</span>
          </div>
        </div>

        <div className="relative group">
          <ThreeDCard 
            name={userName} 
            handle={`@${userName.toLowerCase().replace(/\s/g, '')}`} 
          />
          {isLocked && (
            <div className="absolute inset-0 z-40 bg-white/10 backdrop-blur-md flex items-center justify-center border-[4px] border-dashed border-black/20">
               <div className="bg-[#ffde59] border-[4px] border-black p-6 shadow-[10px_10px_0px_0px_#000] text-center rotate-3">
                  <Clock size={48} className="mx-auto mb-4 text-black animate-pulse" />
                  <p className="font-black uppercase text-xs tracking-widest text-black">Under Review</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Wallet & Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative">
        {/* LOCK OVERLAY FOR SECTIONS */}
        {isLocked && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
             <div className="bg-black text-white px-10 py-8 border-[4px] border-white shadow-[12px_12px_0px_0px_#834bf1] text-center space-y-4 max-w-sm">
                <Lock size={40} className="mx-auto text-[#ffde59]" />
                <h3 className="font-black uppercase tracking-tighter text-2xl">Encrypted Content</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60">
                   Missions and Wallet access require an ACTIVE Identity Card. Check back soon.
                </p>
             </div>
          </div>
        )}

        {/* Wallet Section */}
        <div className={`bg-white dark:bg-[#111] border-[4px] border-black p-8 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#834bf1] transition-all ${isLocked ? 'blur-xl grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Wallet className="text-[#834bf1]" />
              <h3 className="font-black uppercase tracking-widest text-sm italic">ReelCoin Balance</h3>
            </div>
            <Sparkles className="text-[#ffde59] animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-4">
            <span className="text-6xl font-black font-display italic tracking-tighter">
               {data?.user?.walletBalance.toLocaleString() || "0"}
            </span>
            <span className="text-xl font-black text-[#834bf1]">RC</span>
          </div>
        </div>

        {/* Missions Section */}
        <div className={`bg-white dark:bg-[#111] border-[4px] border-black p-8 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#ffde59] transition-all ${isLocked ? 'blur-xl grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Target className="text-[#834bf1]" />
              <h3 className="font-black uppercase tracking-widest text-sm italic">Active Assignments</h3>
            </div>
            <Zap className="text-black fill-[#ffde59]" />
          </div>
          
          <div className="space-y-4">
            {data?.missions?.length > 0 ? (
              data.missions.map((m: any) => (
                <div key={m.id} className="border-[3px] border-black p-4 hover:bg-[#834bf1]/10 transition-colors flex justify-between items-center group cursor-pointer">
                  <div>
                    <p className="font-black text-xs uppercase italic">{m.title}</p>
                    <p className="text-[10px] font-bold text-[#834bf1]">+{m.rewardAmount} RC</p>
                  </div>
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <Zap size={14} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold uppercase text-black/40">No missions currently assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
