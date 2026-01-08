import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  LogOut, 
  Trophy, 
  Gift, 
  User, 
  Star, 
  Zap, 
  Wallet, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  ChevronRight,
  TrendingUp,
  Lock,
  Clock,
  X,
  History,
  Ticket,
} from 'lucide-react';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  
  // Wallet & Redemption State
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    try {
      if (!auth.currentUser) return;

      console.log("🔥 Syncing Operational Grid...");

      const [profileRes, missionsRes, rewardsRes, transRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('firebase_uid', auth.currentUser.uid).single(),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_uid', auth.currentUser.uid).order('created_at', { ascending: false })
      ]);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
      if (profileRes.data) setProfile(profileRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (transRes.data) setTransactions(transRes.data);

    } catch (error) {
      console.error("Dashboard Global Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (!profile || profile.reelcoins < reward.cost) {
      alert("⛔ INSUFFICIENT FUNDS: Sync more missions to earn Reelcoins.");
      return;
    }

    if (!confirm(`INITIALIZE REDEMPTION: ${reward.title} for ${reward.cost} RC?`)) return;

    setIsProcessing(reward.id);

    try {
      // Execute Atomic Redemption via RPC with requested parameters
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: auth.currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });

      if (error) throw error;

      // Local UI Update: Reveal the code
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'REDEEMED' }));
      alert(`✅ MISSION SUCCESS: ${reward.title} Unlocked!`);
      
      // Re-fetch profile to update balance and ledger
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Redemption Error:", err);
      alert("⛔ REDEMPTION PROTOCOL FAILED: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    onBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';
  const userDisplayName = profile?.display_name || auth.currentUser?.displayName || "Agent";
  const userHandle = profile?.handle || "@reelywood_agent";
  const userNiche = profile?.niche || "Creative Strategy";
  const coinBalance = profile?.reelcoins || 0;

  return (
    <div className="min-h-screen bg-white text-black font-lexend selection:bg-[#ffde59] overflow-x-hidden">
      
      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-xl bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b-[4px] border-black flex items-center justify-between bg-[#ffde59]">
              <div className="flex items-center space-x-4">
                <History size={24} strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Vault History</h2>
              </div>
              <button onClick={() => setShowHistory(false)} className="hover:rotate-90 transition-transform p-2 border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <X size={24} strokeWidth={4} />
              </button>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
              {transactions.length === 0 ? (
                <div className="py-16 text-center border-[4px] border-dashed border-black/10">
                  <p className="text-black/20 font-black uppercase text-xs tracking-widest italic">No transactions yet.</p>
                </div>
              ) : (
                transactions.map((tx, i) => (
                  <div key={i} className="border-[3px] border-black p-5 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase italic">{tx.description || 'System Transmission'}</p>
                      <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">
                        {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-lg font-black italic tracking-tighter ${tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount} RC
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="bg-slate-50 p-4 border-t-[4px] border-black text-center">
               <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 italic">End of Ledger</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b-[6px] border-black bg-white sticky top-0 z-50 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={onBack}
              className="p-2 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 bg-white"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter font-display text-black">
              Creator <span className="text-[#834bf1]">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`hidden sm:flex items-center space-x-4 border-[4px] border-black px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isApproved ? 'bg-[#ffde59]' : 'bg-slate-100'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isApproved ? 'bg-green-500 animate-ping' : 'bg-slate-400'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-widest italic text-black">
                {isApproved ? 'Node Active' : 'Sync Pending'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 bg-black text-white px-5 py-2.5 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-[11px] font-black uppercase tracking-widest italic active:bg-rose-600 active:border-rose-700"
            >
              <LogOut size={16} strokeWidth={3} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-4 rotate-6 group-hover:rotate-12 transition-transform">
                <div className={`border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 ${isApproved ? 'bg-[#4ade80]' : 'bg-[#ffde59]'}`}>
                  {isApproved ? <CheckCircle2 size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black">
                    {isApproved ? 'Verified' : 'Reviewing'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-8 mt-6">
                <div className="w-40 h-40 border-[6px] border-black shadow-[8px_8px_0px_0px_#834bf1] bg-[#ffde59] overflow-hidden rounded-none relative">
                  {profile?.photo_url || auth.currentUser?.photoURL ? (
                    <img src={profile?.photo_url || auth.currentUser?.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={64} strokeWidth={3} />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic font-display text-black">{userDisplayName}</h2>
                  <p className="text-[#834bf1] font-black text-sm uppercase italic tracking-widest">{userHandle}</p>
                </div>

                <div className="w-full pt-8 border-t-[4px] border-black/10 flex flex-col space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.3em]">Sector</p>
                    <div className="bg-black text-white px-5 py-1.5 border-[3px] border-black text-xs font-black uppercase italic shadow-[3px_3px_0px_0px_#834bf1]">
                      {userNiche}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.3em]">Deployment</p>
                    <p className="text-sm font-black uppercase italic tracking-tight text-black">{profile?.city || "Remote"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden group transition-all`}>
              <Star className="absolute -right-8 -top-8 w-48 h-48 text-white/10 rotate-12 group-hover:rotate-[30deg] transition-transform duration-1000" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-3">
                  <Wallet size={24} strokeWidth={3} className="text-[#ffde59]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Reelcoin Node</span>
                </div>
                <TrendingUp size={24} strokeWidth={3} className="text-white/40" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <p className="text-7xl font-black tracking-tighter italic font-display leading-none">
                  {coinBalance.toLocaleString()}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="h-[3px] w-12 bg-[#ffde59]"></div>
                  <p className="text-[#ffde59] font-black text-[10px] uppercase tracking-[0.4em]">Available Liquid Assets</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowHistory(true)}
                className="w-full mt-10 bg-black text-white border-[3px] border-white py-5 font-black uppercase text-[12px] tracking-[0.4em] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#ffde59] active:scale-95 relative z-10 italic flex items-center justify-center space-x-3 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <span>📜 Vault History</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-10 relative">
            
            {/* LOCK OVERLAY */}
            {!isApproved && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-12">
                <div className="bg-[#ffde59] border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] text-center space-y-6 pointer-events-auto transform -rotate-2">
                  <div className="w-20 h-20 bg-black border-[4px] border-[#ffde59] mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#000]">
                    <Lock size={40} className="text-[#ffde59]" strokeWidth={3} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase italic font-display tracking-tight leading-none text-black">Approval Pending</h3>
                    <p className="text-black font-black text-[10px] uppercase tracking-[0.3em] opacity-60">Verification in progress</p>
                  </div>
                  <p className="text-black text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto border-t-[3px] border-black/10 pt-6">
                    Our team is reviewing your digital authority node. Missions and Rewards will unlock shortly.
                  </p>
                </div>
              </div>
            )}

            {/* TAB NAV */}
            <div className={`flex border-[6px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2.5 ${!isApproved ? 'grayscale opacity-60 pointer-events-none' : ''}`}>
              <button 
                onClick={() => setActiveTab('missions')}
                className={`flex-1 flex items-center justify-center space-x-4 py-5 font-black uppercase text-sm tracking-[0.3em] transition-all italic ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-slate-50'}`}
              >
                <Zap size={22} fill={activeTab === 'missions' ? "black" : "none"} strokeWidth={3} />
                <span className="text-black">Missions</span>
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 flex items-center justify-center space-x-4 py-5 font-black uppercase text-sm tracking-[0.3em] transition-all italic ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-slate-50'}`}
              >
                <Gift size={22} fill={activeTab === 'rewards' ? "white" : "none"} strokeWidth={3} />
                <span>Rewards</span>
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className={`space-y-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all ${!isApproved ? 'grayscale opacity-40 blur-[1px] pointer-events-none select-none' : ''}`}>
              {activeTab === 'missions' ? (
                missions.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-24 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={64} className="mx-auto mb-8 text-slate-200" strokeWidth={3} />
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-black/30">Scanning Operational Grid...</p>
                  </div>
                ) : (
                  missions.map((mission) => (
                    <div key={mission.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div className="space-y-5 flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="bg-[#ffde59] border-[3px] border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                              Production Mission
                            </span>
                            <span className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.2em] italic">
                              LIVE
                            </span>
                          </div>
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter font-display text-black">{mission.title}</h3>
                          <p className="text-sm font-bold text-black/60 leading-relaxed uppercase tracking-tight line-clamp-2">
                            {mission.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                          <div className="bg-black text-white px-8 py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1] w-full md:w-auto text-center">
                            <p className="text-4xl font-black text-[#ffde59] italic font-display tracking-tighter">+{mission.reward_amount || 500} RC</p>
                          </div>
                          <button className="flex items-center justify-center space-x-3 w-full text-[12px] font-black uppercase tracking-[0.4em] italic group-hover:text-[#834bf1]">
                            <span className="text-black group-hover:text-[#834bf1]">View Brief</span>
                            <ChevronRight size={20} strokeWidth={4} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                rewards.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-24 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <Gift size={64} className="mx-auto mb-8 text-slate-200" strokeWidth={3} />
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-black/30">Vault synchronization pending.</p>
                  </div>
                ) : (
                  rewards.map((reward) => {
                    const isRevealed = !!revealedCodes[reward.id];
                    return (
                      <div key={reward.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                          <div className="flex items-center space-x-8 flex-1">
                            <div className="w-20 h-20 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_#000] rotate-[-2deg] group-hover:rotate-0 transition-transform">
                              <Gift size={32} strokeWidth={3} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-2xl font-black uppercase italic font-display tracking-tight text-black">{reward.title}</h3>
                              <p className="text-[11px] font-black uppercase text-black/40 tracking-widest italic">Elite Inventory</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-10">
                            <p className="text-3xl font-black text-[#834bf1] italic tracking-tighter">{reward.cost} RC</p>
                            <button 
                              disabled={isRevealed || isProcessing === reward.id}
                              onClick={() => handleRedeem(reward)}
                              className={`px-8 py-4 border-[4px] border-black font-black uppercase text-[12px] tracking-[0.4em] italic shadow-[6px_6px_0px_0px_#000] transition-all active:scale-95 ${
                                isRevealed 
                                  ? 'bg-[#ffde59] text-black border-[#000] cursor-default' 
                                  : 'bg-black text-white hover:bg-[#834bf1]'
                              }`}
                            >
                              {isProcessing === reward.id ? (
                                <Loader2 className="animate-spin" size={18} />
                              ) : isRevealed ? (
                                <span className="flex items-center space-x-2">
                                  <Ticket size={16} />
                                  <span>CODE: {revealedCodes[reward.id]}</span>
                                </span>
                              ) : (
                                'Redeem'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t-[6px] border-black p-12 text-center bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-black/30 italic">
            REELYWOOD STUDIO • SECURE CREATOR ENVIRONMENT • VER 4.8.8
          </p>
          <div className="flex items-center space-x-8 opacity-40">
             <div className="h-[2px] w-12 bg-black"></div>
             <p className="text-[10px] font-black uppercase tracking-widest italic">Encrypted Connection Established</p>
          </div>
        </div>
      </footer>
    </div>
  );
};