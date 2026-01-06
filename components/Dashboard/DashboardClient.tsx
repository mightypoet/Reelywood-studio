
import React, { useState, useEffect } from 'react';
import { ThreeDCard } from '../ThreeDCard';
// @ts-ignore
import { getMyProfile, applyForCard } from '../../services/backend';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, Clock, Wallet, Target, Sparkles, Zap, 
  ShieldCheck, Ticket, ChevronRight, Activity, 
  ArrowUpRight, Loader2, Sparkle
} from 'lucide-react';

interface DashboardClientProps {
  userName: string;
  dashboardResult: any;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ userName, dashboardResult }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await getMyProfile(user.uid);
      setProfile(data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await applyForCard(user.uid);
      await fetchProfile();
    } catch (err) {
      alert("Submission Error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={48} strokeWidth={3} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40">Syncing Identity...</p>
      </div>
    );
  }

  // --- RENDERING MODES ---

  // 1. NO CARD STATE
  if (!profile || profile.card_status === 'none') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-12 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#834bf1] mx-auto flex items-center justify-center -rotate-3">
          <Sparkle size={48} className="text-[#834bf1]" fill="currentColor" />
        </div>
        <div className="space-y-6">
          <h2 className="text-6xl md:text-8xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-none">
            Get the <br /> <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Creator Card</span>
          </h2>
          <p className="text-black/60 dark:text-white/60 text-lg font-black uppercase italic tracking-tight max-w-xl mx-auto border-y-[4px] border-black py-4">
            Authorized node access required for Mission Control, ReelCoin Vault, and Premium Brand Partnerships.
          </p>
        </div>
        <button 
          onClick={handleApply}
          className="bg-[#ffde59] text-black px-16 py-8 border-[5px] border-black font-black uppercase text-sm tracking-[0.4em] shadow-[12px_12px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
        >
          Initiate Application
        </button>
      </div>
    );
  }

  // 2. PENDING STATE
  if (profile.card_status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-12 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[#ffde59] border-[4px] border-black shadow-[10px_10px_0px_0px_#000] mx-auto flex items-center justify-center rotate-6 animate-pulse">
          <Clock size={48} className="text-black" strokeWidth={3} />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-black dark:text-white uppercase font-display italic tracking-tight">Identity Review Active</h2>
          <p className="text-black/40 dark:text-white/40 text-xs font-black uppercase tracking-[0.4em]">Estimated sync: 24-48 Hours</p>
        </div>
        <div className="bg-black text-white p-10 border-[5px] border-white shadow-[16px_16px_0px_0px_#834bf1] max-w-md mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            Your credentials are being processed. Access to the full operational grid will unlock upon administrator authorization.
          </p>
        </div>
      </div>
    );
  }

  // 3. APPROVED STATE
  const isLocked = profile.card_status !== 'approved';

  return (
    <div className="space-y-16 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24 px-4 lg:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 py-12">
        <div className="space-y-10 lg:max-w-2xl">
          <div className="inline-flex items-center space-x-4 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-[8px_8px_0px_0px_#ffde59]">
            <ShieldCheck size={16} className="text-[#ffde59]" />
            <span>Identity Node Authorized</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-none">
              Creator <br /> <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Hub</span>
            </h2>
            <p className="text-black/60 dark:text-white/60 text-lg md:text-xl font-black uppercase italic tracking-tight border-l-[6px] border-[#ffde59] pl-8">
              Operational authority granted. Missions are live. Wallet decrypted. Proceed to execution.
            </p>
          </div>
        </div>
        <div className="relative shrink-0 flex justify-center">
          <ThreeDCard name={userName} handle={`@${userName.toLowerCase().split(' ')[0]}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white dark:bg-[#111] border-[4px] border-black p-10 shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#834bf1] relative overflow-hidden group">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#834bf1] border-[3px] border-black flex items-center justify-center text-white shadow-[4px_4px_0px_#000]">
                  <Wallet size={20} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs italic text-black dark:text-white">ReelCoin Vault</h3>
              </div>
              <Sparkles className="text-[#ffde59] animate-pulse" />
            </div>
            <div className="flex items-baseline space-x-4 mb-10">
              <span className="text-8xl font-black font-display italic tracking-tighter text-black dark:text-white">
                 {profile.reelcoins?.toLocaleString() || "0"}
              </span>
              <span className="text-2xl font-black text-[#834bf1] uppercase tracking-widest">RC</span>
            </div>
            <div className="pt-8 border-t-[3px] border-dashed border-black/10 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Network Sync: Active</span>
              </div>
            </div>
          </div>

          <div className="bg-[#ffde59] border-[4px] border-black p-10 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-black border-[3px] border-black flex items-center justify-center text-[#ffde59] shadow-[4px_4px_0px_#fff]">
                  <Ticket size={20} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs italic text-black">Vouchers</h3>
              </div>
            </div>
            <div className="py-12 text-center border-[3px] border-dashed border-black/20 bg-white/20">
              <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.3em]">No rewards granted yet</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111] border-[4px] border-black p-12 shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#ffde59] h-full relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-black border-[3px] border-black flex items-center justify-center text-white shadow-[4px_4px_0px_#834bf1]">
                  <Target size={20} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs italic text-black dark:text-white">Active Missions</h3>
              </div>
            </div>
            <div className="py-32 text-center space-y-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 border-[3px] border-dashed border-black/20 mx-auto flex items-center justify-center rounded-full animate-pulse">
                <Target size={32} className="text-black/10" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase text-black/40 tracking-[0.4em]">Wait for transmission...</p>
                <p className="text-[10px] font-bold uppercase text-black/20">Check back later for curated brand missions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
