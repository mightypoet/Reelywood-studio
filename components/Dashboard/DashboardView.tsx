import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  LogOut, 
  Layout, 
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
  TrendingUp
} from 'lucide-react';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');

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

      console.log("🔥 Fetching Dashboard Data...");

      // 1. Get Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', auth.currentUser.uid)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (profileData) setProfile(profileData);

      // 2. Get Missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (missionsError) console.error("Missions fetch error:", missionsError);
      if (missionsData) setMissions(missionsData);

      // 3. Get Rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*');
      
      if (rewardsError) console.error("Rewards fetch error:", rewardsError);
      if (rewardsData) setRewards(rewardsData);

    } catch (error) {
      console.error("Dashboard Global Error:", error);
    } finally {
      setLoading(false);
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
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Syncing Production Nodes...</p>
      </div>
    );
  }

  const userDisplayName = profile?.display_name || auth.currentUser?.displayName || "Agent";
  const userHandle = profile?.handle || "@reelywood_agent";
  const userNiche = profile?.niche || "Creative Strategy";
  const coinBalance = profile?.reelcoins || 0;

  return (
    <div className="min-h-screen bg-white text-black font-lexend selection:bg-[#ffde59] overflow-x-hidden">
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
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter font-display">
              Creator <span className="text-[#834bf1]">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4 bg-[#ffde59] border-[4px] border-black px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
              <span className="text-[11px] font-black uppercase tracking-widest italic">Node Active</span>
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
          
          {/* LEFT COLUMN: Identity & Wallet */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Creator Profile Card */}
            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-4 rotate-6 group-hover:rotate-12 transition-transform">
                <div className="bg-[#4ade80] border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2">
                  <CheckCircle2 size={14} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
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
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none italic font-display">{userDisplayName}</h2>
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
                    <p className="text-sm font-black uppercase italic tracking-tight">{profile?.city || "Remote"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reelcoin Wallet Card */}
            <div className="bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden group">
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
              
              <button className="w-full mt-10 bg-black text-white border-[3px] border-white py-4 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:scale-95 relative z-10 italic">
                Withdraw Protocol
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabbed Missions & Rewards */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Custom Neo-Brutalist Tabs */}
            <div className="flex border-[6px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2.5">
              <button 
                onClick={() => setActiveTab('missions')}
                className={`flex-1 flex items-center justify-center space-x-4 py-5 font-black uppercase text-sm tracking-[0.3em] transition-all italic ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-slate-50'}`}
              >
                <Zap size={22} fill={activeTab === 'missions' ? "black" : "none"} strokeWidth={3} />
                <span>Missions</span>
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 flex items-center justify-center space-x-4 py-5 font-black uppercase text-sm tracking-[0.3em] transition-all italic ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-slate-50'}`}
              >
                <Gift size={22} fill={activeTab === 'rewards' ? "white" : "none"} strokeWidth={3} />
                <span>Rewards</span>
              </button>
            </div>

            {/* Tab Panels with High-Fidelity Cards */}
            <div className="space-y-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'missions' ? (
                missions.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-24 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={64} className="mx-auto mb-8 text-slate-200" strokeWidth={3} />
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-black/30">Scanning for brand transmissions...</p>
                  </div>
                ) : (
                  missions.map((mission) => (
                    <div key={mission.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 transition-all cursor-default">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                        <div className="space-y-5 flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="bg-[#ffde59] border-[3px] border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                              New Deployment
                            </span>
                            <span className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.2em] italic border-l-[3px] border-black/10 pl-4">
                              {new Date(mission.created_at || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter font-display">{mission.title}</h3>
                          <p className="text-sm font-bold text-black/60 leading-relaxed uppercase tracking-tight border-l-[6px] border-black/5 pl-6">
                            {mission.description || "Operational parameters pending. Detailed brief available upon mission initiation."}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-6 shrink-0 w-full md:w-auto">
                          <div className="bg-black text-white px-8 py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1] w-full md:w-auto text-center md:text-right">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-50 mb-1 leading-none">Yield Reward</p>
                            <p className="text-4xl font-black text-[#ffde59] italic font-display tracking-tighter">+{mission.reward_amount || 500} RC</p>
                          </div>
                          <button className="flex items-center justify-center space-x-3 w-full md:w-auto text-[12px] font-black uppercase tracking-[0.4em] group-hover:text-[#834bf1] transition-all hover:translate-x-2 italic">
                            <span>Initialize Mission</span>
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
                    <p className="text-sm font-black uppercase tracking-[0.4em] text-black/30">Rewards vault encrypted.</p>
                  </div>
                ) : (
                  rewards.map((reward) => (
                    <div key={reward.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-2 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center space-x-8 flex-1">
                          <div className="w-24 h-24 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_#000] rotate-[-2deg] group-hover:rotate-0 transition-transform">
                            <Gift size={40} strokeWidth={3} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-3xl font-black uppercase italic font-display tracking-tight">{reward.title}</h3>
                            <div className="flex items-center space-x-3">
                              <span className="w-3 h-3 bg-[#ffde59] border-[2px] border-black"></span>
                              <p className="text-[11px] font-black uppercase text-black/40 tracking-widest italic">Elite Tier Redeemable</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-10 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                             <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">Asset Cost</p>
                             <p className="text-3xl font-black text-[#834bf1] italic tracking-tighter">-{reward.cost} RC</p>
                          </div>
                          <button className="bg-black text-white px-10 py-5 border-[4px] border-black font-black uppercase text-[12px] tracking-[0.4em] hover:bg-[#ffde59] hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none italic">
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-32 border-t-[6px] border-black p-12 text-center bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-black/30 italic">
            REELYWOOD STUDIO • SECURE CREATOR ENVIRONMENT • VER 4.2.0-STABLE
          </p>
          <div className="flex items-center space-x-8 opacity-40">
             <div className="h-[2px] w-12 bg-black"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption Enabled</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
