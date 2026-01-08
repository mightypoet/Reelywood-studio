
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, 
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
  X,
  History,
  Ticket,
  Bell,
  Info,
  Megaphone,
  Fingerprint,
  ShieldCheck,
  // Added Clock to the imports from lucide-react to fix the reference error on line 337
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  
  // Wallet & Redemption State
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchDashboardData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async (user: FirebaseUser) => {
    if (!supabase) {
      console.error("Supabase client not initialized");
      setLoading(false);
      return;
    }

    try {
      console.log("🔥 Syncing Operational Grid for:", user.email);

      const [profileRes, missionsRes, rewardsRes, transRes, notifRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single(),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_uid', user.uid).order('created_at', { ascending: false }),
        supabase.from('notifications')
          .select('*')
          .or(`user_id.eq.${user.uid},user_id.eq.global`)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
      if (profileRes.data) setProfile(profileRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (notifRes.data) setNotifications(notifRes.data);

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
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });

      if (error) throw error;

      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'REDEEMED' }));
      alert(`✅ MISSION SUCCESS: ${reward.title} Unlocked!`);
      
      if (currentUser) await fetchDashboardData(currentUser);
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

  const markNotificationsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await supabase!
        .from('notifications')
        .update({ is_read: true })
        .match({ user_id: currentUser.uid, is_read: false });
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  // --- GATEKEEPER: UNAUTHENTICATED GUEST OVERLAY ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white text-black font-lexend flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
        
        <div className="w-full max-w-lg relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center space-x-3 bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000] px-5 py-2.5 mb-10 font-black uppercase text-[11px] tracking-[0.2em] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={3} />
            <span>Return to Studio</span>
          </button>

          <div className="bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_#834bf1] p-10 md:p-16 text-center space-y-10 relative">
            <div className="absolute -top-8 -right-8 bg-[#ffde59] border-[4px] border-black p-4 rotate-12 shadow-[4px_4px_0px_0px_#000]">
              <Lock size={32} strokeWidth={3} />
            </div>

            <div className="space-y-4">
              <div className="w-24 h-24 bg-black text-[#ffde59] mx-auto flex items-center justify-center shadow-[8px_8px_0px_0px_#834bf1]">
                <Fingerprint size={56} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none font-display pt-4">Identification Required</h2>
              <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.4em]">Security Protocol v4.8</p>
            </div>

            <p className="text-sm font-bold uppercase leading-relaxed text-black/60 border-y-[3px] border-black/10 py-6">
              Access to the Reelywood Creator Network is restricted. Verify your identity to proceed to the Operational Hub.
            </p>

            <button 
              onClick={handleLogin}
              className="w-full bg-black text-white border-[4px] border-black py-6 font-black uppercase text-xs tracking-[0.4em] shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-[#834bf1] flex items-center justify-center space-x-4 group"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Verify with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD CONTENT ---
  const isApproved = profile?.card_status === 'approved';
  const userDisplayName = profile?.display_name || currentUser?.displayName || "Agent";
  const userHandle = profile?.handle || "@reelywood_agent";
  const userNiche = profile?.niche || "Creative Strategy";
  const coinBalance = profile?.reelcoins || 0;
  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[100] px-6 py-5">
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
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  if (!showNotifs) markNotificationsRead();
                }}
                className={`w-12 h-12 flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none bg-white relative ${showNotifs ? 'bg-[#ffde59]' : ''}`}
              >
                <Bell size={20} strokeWidth={3} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 border-black rounded-none animate-bounce">
                    {unreadCount}
                  </div>
                )}
              </button>

              {showNotifs && (
                <div className="absolute top-full right-0 mt-6 w-80 bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] z-[110] animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-black text-white flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Broadcast Center</span>
                    <button onClick={() => setShowNotifs(false)}><X size={14} strokeWidth={3}/></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-black/20 font-black uppercase text-[10px] tracking-widest italic">No new alerts.</div>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className={`p-5 border-b-2 border-black last:border-0 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-[#834bf1]/5' : ''}`}>
                          <div className="flex items-center space-x-2 mb-1">
                            {n.user_id === 'global' ? <Megaphone size={12} className="text-[#834bf1]" /> : <Info size={12} className="text-[#ffde59]" />}
                            <span className="font-black uppercase text-[9px] tracking-tight">{n.title}</span>
                          </div>
                          <p className="text-[10px] font-bold text-black/70 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
                  {profile?.photo_url || currentUser?.photoURL ? (
                    <img src={profile?.photo_url || currentUser?.photoURL} alt="Profile" className="w-full h-full object-cover" />
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
                  <p className="text-[#ffde59] font-black text-[10px] uppercase tracking-[0.4em]">Liquid Assets</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowHistory(true)}
                className="w-full mt-10 bg-black text-white border-[3px] border-white py-5 font-black uppercase text-[12px] tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_#ffde59] transition-all flex items-center justify-center space-x-3"
              >
                <span>📜 Vault History</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10 relative">
            {!isApproved && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-12">
                <div className="bg-[#ffde59] border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] text-center space-y-6 pointer-events-auto transform -rotate-2">
                  <div className="w-20 h-20 bg-black border-[4px] border-[#ffde59] mx-auto flex items-center justify-center shadow-[6px_6px_0px_0px_#000]">
                    <Lock size={40} className="text-[#ffde59]" strokeWidth={3} />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic font-display tracking-tight leading-none text-black">Approval Pending</h3>
                  <p className="text-black text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto border-t-[3px] border-black/10 pt-6">
                    Our team is reviewing your digital authority node. Missions and Rewards will unlock shortly.
                  </p>
                </div>
              </div>
            )}

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
                          <h3 className="text-3xl font-black uppercase italic tracking-tighter font-display text-black">{mission.title}</h3>
                          <p className="text-sm font-bold text-black/60 leading-relaxed uppercase tracking-tight line-clamp-2">{mission.description}</p>
                        </div>
                        <div className="bg-black text-white px-8 py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1]">
                          <p className="text-4xl font-black text-[#ffde59] italic font-display tracking-tighter">+{mission.reward_amount || 500} RC</p>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                rewards.map((reward) => {
                  const isRevealed = !!revealedCodes[reward.id];
                  return (
                    <div key={reward.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center space-x-8 flex-1">
                          <div className="w-20 h-20 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white">
                            <Gift size={32} strokeWidth={3} />
                          </div>
                          <h3 className="text-2xl font-black uppercase italic font-display tracking-tight text-black">{reward.title}</h3>
                        </div>
                        <div className="flex items-center space-x-10">
                          <p className="text-3xl font-black text-[#834bf1] italic tracking-tighter">{reward.cost} RC</p>
                          <button 
                            disabled={isRevealed || isProcessing === reward.id}
                            onClick={() => handleRedeem(reward)}
                            className={`px-8 py-4 border-[4px] border-black font-black uppercase text-[12px] tracking-[0.4em] shadow-[6px_6px_0px_0px_#000] transition-all active:scale-95 ${isRevealed ? 'bg-[#ffde59] text-black cursor-default' : 'bg-black text-white'}`}
                          >
                            {isProcessing === reward.id ? <Loader2 className="animate-spin" size={18} /> : isRevealed ? `CODE: ${revealedCodes[reward.id]}` : 'Redeem'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
