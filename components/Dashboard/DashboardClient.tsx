import React, { useState, useEffect } from 'react';
import { ThreeDCard } from '../ThreeDCard';
// @ts-ignore
import { getMyProfile, applyForCard } from '../../services/backend';
import { supabase } from '../../lib/clients';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, Clock, Wallet, Target, Sparkles, Zap, 
  ShieldCheck, Ticket, CheckCircle, ArrowUpRight, 
  Loader2, Sparkle, Gift, CheckCircle2
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface DashboardClientProps {
  userName: string;
  dashboardResult: any;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ userName, dashboardResult }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  
  // UI State
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user || !supabase) return;
    try {
      // Parallel fetch for profile and operational grid data
      const [profileData, missionsRes, rewardsRes, subsRes] = await Promise.all([
        getMyProfile(user.uid),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('submissions').select('*').eq('user_id', user.uid)
      ]);

      setProfile(profileData);
      const currentProfile = profileData;

      // Filter Missions: Show global, targeted, and non-draft items
      if (missionsRes.data) {
        const visibleMissions = missionsRes.data.filter((m: any) => {
          const targets = m.assigned_to;
          if (Array.isArray(targets) && targets.includes('DRAFT')) return false;
          if (!targets || (Array.isArray(targets) && targets.length === 0)) return true;
          return Array.isArray(targets) && (targets.includes(user.uid) || (currentProfile?.id && targets.includes(currentProfile.id)));
        });
        setMissions(visibleMissions);
      }

      // Filter Rewards: Identical logic to missions
      if (rewardsRes.data) {
        const visibleRewards = rewardsRes.data.filter((r: any) => {
          const targets = r.assigned_to;
          if (Array.isArray(targets) && targets.includes('DRAFT')) return false;
          if (!targets || (Array.isArray(targets) && targets.length === 0)) return true;
          return Array.isArray(targets) && (targets.includes(user.uid) || (currentProfile?.id && targets.includes(currentProfile.id)));
        });
        setRewards(visibleRewards);
      }

      if (subsRes.data) setUserSubmissions(subsRes.data);

    } catch (err) {
      console.error("DASHBOARD_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      
      if (!supabase) return;
      const channel = supabase.channel('dashboard-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => fetchData())
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `firebase_uid=eq.${user.uid}` }, () => fetchData())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const handleApply = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await applyForCard(user.uid);
      await fetchData();
    } catch (err) {
      alert("Terminal Sync Error. Application failed to dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (!profile || profile.reelcoins < reward.cost) return alert("⛔ INSUFFICIENT RC BAL");
    if (!confirm(`Authorize redemption of "${reward.title}" for ${reward.cost} RC?`)) return;
    
    setProcessingId(reward.id);
    try {
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: user?.uid,
        cost: reward.cost,
        item_title: reward.title
      });
      if (error) throw error;
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'DECRYPTED' }));
      await fetchData();
    } catch (err: any) {
      alert("Protocol Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black/40 animate-pulse">Syncing Identity Node...</p>
      </div>
    );
  }

  if (!profile || profile.card_status === 'none') {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-16 animate-in fade-in duration-1000">
        <div className="w-32 h-32 bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#834bf1] mx-auto flex items-center justify-center -rotate-6">
          <Sparkle size={64} className="text-[#834bf1]" fill="currentColor" />
        </div>
        <div className="space-y-8">
          <h2 className="text-7xl md:text-9xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-[0.8]">
            Claim Your <br /> <span className="text-[#834bf1] drop-shadow-[6px_6px_0px_#000] dark:drop-shadow-[6px_6px_0px_#fff]">Creator Card</span>
          </h2>
          <p className="text-black/60 dark:text-white/60 text-xl font-black uppercase italic tracking-tight max-w-2xl mx-auto border-l-[8px] border-[#ffde59] pl-10 py-6 bg-slate-50 dark:bg-white/5">
            Authorized node access required for Mission Control, ReelCoin Vault, and Premium Alliance Partnerships.
          </p>
        </div>
        <button 
          onClick={handleApply}
          className="bg-[#ffde59] text-black px-20 py-10 border-[6px] border-black font-black uppercase text-lg tracking-[0.5em] shadow-[16px_16px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 italic font-display"
        >
          Initiate Production
        </button>
      </div>
    );
  }

  if (profile.card_status === 'pending') {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-16 animate-in fade-in duration-1000">
        <div className="w-32 h-32 bg-[#ffde59] border-[6px] border-black shadow-[16px_16px_0px_0px_#000] mx-auto flex items-center justify-center rotate-12 animate-pulse">
          <Clock size={64} className="text-black" strokeWidth={4} />
        </div>
        <div className="space-y-6">
          <h2 className="text-6xl md:text-8xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter">Production Active</h2>
          <p className="text-black/40 dark:text-white/40 text-sm font-black uppercase tracking-[0.5em]">Identity Handshake: In Progress</p>
        </div>
        <div className="bg-black text-white p-12 border-[8px] border-white shadow-[24px_24px_0px_0px_#834bf1] max-w-xl mx-auto">
          <p className="text-sm font-black uppercase tracking-[0.2em] leading-relaxed italic">
            Verification Protocol Running. Estimated sync: 24-48 Hours. access will unlock upon admin authorization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24 animate-in fade-in duration-1000 max-w-7xl mx-auto pb-32 px-6 lg:px-8">
      {selectedMission && (
        <MissionModal 
          mission={selectedMission} 
          user={user} 
          onClose={() => {
            setSelectedMission(null);
            fetchData();
          }} 
        />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-20 py-16">
        <div className="space-y-12 lg:max-w-3xl">
          <div className="inline-flex items-center space-x-5 bg-black border-[4px] border-black px-10 py-3.5 rounded-none text-white font-black text-xs uppercase tracking-[0.5em] shadow-[10px_10px_0px_0px_#ffde59]">
            <ShieldCheck size={20} className="text-[#ffde59]" />
            <span>Identity Node Authorized</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-7xl md:text-9xl font-black text-black dark:text-white uppercase font-display italic tracking-tighter leading-[0.8]">
              Creator <br /> <span className="text-[#834bf1] drop-shadow-[6px_6px_0px_#000] dark:drop-shadow-[6px_6px_0px_#fff]">Hub</span>
            </h2>
            <p className="text-black/60 dark:text-white/60 text-xl md:text-2xl font-black uppercase italic tracking-tight border-l-[10px] border-[#ffde59] pl-10 py-4 bg-slate-50 dark:bg-white/5">
              Sync complete. Bounty grid active. proceed to execution.
            </p>
          </div>
        </div>
        <div className="relative shrink-0 flex justify-center group">
          <div className="absolute inset-0 bg-[#834bf1]/10 blur-[100px] rounded-full group-hover:bg-[#834bf1]/20 transition-colors"></div>
          <ThreeDCard name={userName} handle={`@${userName.toLowerCase().split(' ')[0]}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-12">
          <div className="bg-white dark:bg-[#111] border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#000] dark:shadow-[16px_16px_0px_0px_#834bf1] relative overflow-hidden group">
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_#000]">
                  <Wallet size={32} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-[0.3em] text-sm italic text-black dark:text-white font-display">RC Vault</h3>
              </div>
              <Sparkles size={24} className="text-[#ffde59] animate-pulse" />
            </div>
            <div className="flex items-baseline space-x-5 mb-12">
              <span className="text-9xl font-black font-display italic tracking-tighter text-black dark:text-white">
                 {profile.reelcoins?.toLocaleString() || "0"}
              </span>
              <span className="text-3xl font-black text-[#834bf1] uppercase tracking-[0.3em] italic">RC</span>
            </div>
            <div className="pt-10 border-t-[4px] border-dashed border-black/10 dark:border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                 <span className="text-xs font-black uppercase tracking-widest text-black/40 dark:text-white/40">Sync Level 12.4</span>
              </div>
            </div>
          </div>

          <div className="bg-[#ffde59] border-[6px] border-black p-12 shadow-[16px_16px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-black border-[4px] border-black flex items-center justify-center text-[#ffde59] shadow-[6px_6px_0px_0px_#fff]">
                  <Ticket size={32} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-[0.3em] text-sm italic text-black font-display">Alliance Rewards</h3>
              </div>
            </div>
            
            <div className="space-y-6">
              {rewards.length === 0 ? (
                <div className="py-20 text-center border-[4px] border-dashed border-black/20 bg-white/20">
                  <p className="text-xs font-black uppercase text-black/40 tracking-[0.4em]">No active vouchers</p>
                </div>
              ) : (
                rewards.map(reward => (
                  <div key={reward.id} className="bg-white border-[4px] border-black p-6 flex flex-col gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-1 transition-transform">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-black uppercase text-xl italic leading-none font-display">{reward.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">{reward.partner_brands?.name}</p>
                      </div>
                      <span className="bg-black text-white text-xs font-black px-4 py-2 italic">-{reward.cost} RC</span>
                    </div>
                    <button 
                      disabled={!!revealedCodes[reward.id] || processingId === reward.id}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-5 font-black uppercase text-xs tracking-[0.3em] border-[4px] border-black ${revealedCodes[reward.id] ? 'bg-[#39ff14]' : 'bg-white hover:bg-black hover:text-white'} transition-all shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1`}
                    >
                      {processingId === reward.id ? <Loader2 className="animate-spin mx-auto" /> : revealedCodes[reward.id] ? `HASH: ${revealedCodes[reward.id]}` : 'EXECUTE REDEMPTION'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111] border-[6px] border-black p-10 md:p-16 shadow-[16px_16px_0px_0px_#000] dark:shadow-[16px_16px_0px_0px_#ffde59] h-full relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 relative z-10">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-black border-[4px] border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_#834bf1]">
                  <Target size={32} strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-[0.3em] text-sm italic text-black dark:text-white font-display">Active Modules</h3>
              </div>
            </div>

            {missions.length === 0 ? (
              <div className="py-48 text-center space-y-10">
                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 border-[4px] border-dashed border-black/20 mx-auto flex items-center justify-center rounded-none animate-pulse rotate-45">
                  <Target size={40} className="text-black/10 -rotate-45" />
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase text-black/40 tracking-[0.5em]">Scanning Grid...</p>
                  <p className="text-[10px] font-bold uppercase text-black/20">Awaiting narrative transmission.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-10">
                {missions.map(mission => {
                  const submission = userSubmissions.find(s => s.mission_id === mission.id);
                  const status = submission ? submission.status : 'idle';
                  const isCompleted = status === 'approved';
                  const isPending = status === 'pending';

                  return (
                    <div key={mission.id} className={`border-[4px] border-black p-8 relative transition-all ${isCompleted ? 'bg-[#dcfce7] border-emerald-500 shadow-[10px_10px_0px_0px_#10b981]' : isPending ? 'bg-[#fffbeb] border-yellow-500 shadow-[10px_10px_0px_0px_#f59e0b]' : 'bg-white hover:shadow-[12px_12px_0px_0px_#834bf1] hover:-translate-y-1 shadow-[8px_8px_0px_0px_#000]'}`}>
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-6">
                           <div className="w-16 h-16 bg-white border-[3px] border-black p-2 shrink-0 shadow-[4px_4px_0px_0px_#000]">
                              {mission.partner_brands?.logo_url ? <img src={mission.partner_brands.logo_url} className="w-full h-full object-contain" alt="Brand"/> : <div className="w-full h-full bg-black flex items-center justify-center text-white font-black text-xl italic font-display">R</div>}
                           </div>
                           <div>
                              <h4 className="font-black uppercase italic text-2xl leading-none mb-2 font-display">{mission.title}</h4>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{mission.partner_brands?.name || 'Reelywood'}</p>
                           </div>
                        </div>
                        <div className="bg-black text-[#ffde59] px-5 py-2 font-black text-sm italic border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1]">
                          +{mission.reward_amount} RC
                        </div>
                      </div>
                      
                      <p className="text-xs font-bold text-gray-600 mb-8 line-clamp-3 uppercase leading-relaxed border-l-4 border-black/5 pl-6">{mission.description}</p>
                      
                      <button 
                        disabled={isCompleted || isPending}
                        onClick={() => setSelectedMission(mission)}
                        className={`w-full py-6 font-black uppercase text-xs tracking-[0.4em] border-[4px] border-black shadow-[6px_6px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all italic font-display ${isCompleted ? 'bg-emerald-500 text-white' : isPending ? 'bg-yellow-400 text-black' : 'bg-[#834bf1] text-white hover:bg-black'}`}
                      >
                        {isCompleted ? 'Deployment Finalized' : isPending ? 'Review in progress' : 'Initialize Mission'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};