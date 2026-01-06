import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Gift, 
  Wallet, 
  User as UserIcon, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (!supabase) return;

        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', user.uid)
          .single();
        
        if (profileData) setProfile(profileData);

        // 2. Fetch Missions
        const { data: missionsData } = await supabase
          .from('missions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (missionsData) setMissions(missionsData);

        // 3. Fetch Rewards (assuming table exists)
        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*');
        
        if (rewardsData) setRewards(rewardsData);

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Syncing Network Nodes...</p>
      </div>
    );
  }

  const userDisplayName = profile?.display_name || auth.currentUser?.displayName || "Agent";
  const userHandle = profile?.handle || "@reelywood_agent";
  const userNiche = profile?.niche || "Creative Strategy";
  const coinBalance = profile?.reelcoins || 0;

  return (
    <div className="min-h-screen bg-white text-black font-lexend selection:bg-[#ffde59]">
      {/* Header */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={onBack}
              className="p-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter font-display">
              Creator <span className="text-[#834bf1]">Dashboard</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center space-x-4 bg-[#ffde59] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Network Online</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: Identity & Wallet */}
          <div className="lg:col-span-4 space-y-10">
            {/* Creator Card */}
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="bg-[#4ade80] border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2">
                  <CheckCircle2 size={12} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified Creator</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-6 mt-4">
                <div className="w-32 h-32 border-4 border-black shadow-[6px_6px_0px_0px_#834bf1] bg-[#ffde59] overflow-hidden">
                  {auth.currentUser?.photoURL ? (
                    <img src={auth.currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon size={48} strokeWidth={3} />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{userDisplayName}</h2>
                  <p className="text-[#834bf1] font-black text-sm uppercase italic tracking-wide">{userHandle}</p>
                </div>

                <div className="w-full pt-6 border-t-2 border-black/10">
                  <p className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em] mb-2">Primary Niche</p>
                  <div className="inline-block bg-black text-white px-4 py-1 border-2 border-black text-xs font-black uppercase italic">
                    {userNiche}
                  </div>
                </div>
              </div>
            </div>

            {/* Reelcoin Wallet */}
            <div className="bg-[#834bf1] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Wallet size={20} strokeWidth={3} className="text-[#ffde59]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Reelcoin Node</span>
                </div>
                <TrendingUp size={20} />
              </div>
              
              <div className="space-y-1">
                <p className="text-6xl font-black tracking-tighter italic font-display">{coinBalance.toLocaleString()}</p>
                <p className="text-[#ffde59] font-black text-xs uppercase tracking-[0.4em]">Available RC</p>
              </div>
              
              <button className="w-full mt-8 bg-black text-white border-2 border-white py-3 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                Withdraw Assets
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabbed Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tabs Navigation */}
            <div className="flex border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-2">
              <button 
                onClick={() => setActiveTab('missions')}
                className={`flex-1 flex items-center justify-center space-x-3 py-4 font-black uppercase text-xs tracking-[0.2em] transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-2 border-black' : 'hover:bg-slate-50'}`}
              >
                <Zap size={18} fill={activeTab === 'missions' ? "black" : "none"} />
                <span>Missions</span>
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`flex-1 flex items-center justify-center space-x-3 py-4 font-black uppercase text-xs tracking-[0.2em] transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-2 border-black' : 'hover:bg-slate-50'}`}
              >
                <Gift size={18} fill={activeTab === 'rewards' ? "white" : "none"} />
                <span>Rewards</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="space-y-6 min-h-[500px]">
              {activeTab === 'missions' ? (
                missions.length === 0 ? (
                  <div className="bg-white border-4 border-black p-20 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <Star size={48} className="mx-auto mb-6 text-slate-200" strokeWidth={3} />
                    <p className="text-[12px] font-black uppercase tracking-widest text-black/30">Scanning for brand transmissions...</p>
                  </div>
                ) : (
                  missions.map((mission) => (
                    <div key={mission.id} className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="bg-[#ffde59] border-2 border-black px-3 py-0.5 text-[9px] font-black uppercase tracking-widest">New Mission</span>
                            <span className="text-[9px] font-black uppercase text-[#834bf1] tracking-widest italic">{new Date(mission.created_at).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-2xl font-black uppercase italic tracking-tight">{mission.title}</h3>
                          <p className="text-sm font-medium text-black/60 leading-relaxed uppercase tracking-tight">{mission.description}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4 shrink-0">
                          <div className="bg-black text-white px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_#834bf1]">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 leading-none">Reward</p>
                            <p className="text-2xl font-black text-[#ffde59] italic">+{mission.reward_amount} RC</p>
                          </div>
                          <button className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-[#834bf1] transition-colors">
                            <span>Start Mission</span>
                            <ChevronRight size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                rewards.length === 0 ? (
                  <div className="bg-white border-4 border-black p-20 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <Gift size={48} className="mx-auto mb-6 text-slate-200" strokeWidth={3} />
                    <p className="text-[12px] font-black uppercase tracking-widest text-black/30">Rewards vault locked.</p>
                  </div>
                ) : (
                  rewards.map((reward) => (
                    <div key={reward.id} className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="w-16 h-16 bg-[#834bf1] border-4 border-black flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000]">
                            <Gift size={24} strokeWidth={3} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase italic">{reward.title}</h3>
                            <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Premium Redeemable</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cost</p>
                             <p className="text-xl font-black text-[#834bf1] italic">{reward.cost} RC</p>
                          </div>
                          <button className="bg-black text-white px-8 py-4 border-4 border-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#ffde59] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
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

      <footer className="mt-20 border-t-4 border-black p-8 text-center bg-slate-50">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20">
          REELYWOOD STUDIO • SECURE CREATOR ENVIRONMENT • VER 4.2.0
        </p>
      </footer>
    </div>
  );
};
