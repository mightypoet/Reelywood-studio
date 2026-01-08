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
  Lock,
  X,
  History,
  Bell,
  Info,
  Megaphone,
  Fingerprint,
  TrendingUp,
  Clock,
  AlertTriangle,
  ShieldCheck,
  PartyPopper
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
  const [showSyncToast, setShowSyncToast] = useState(false);
  
  // Wallet & Redemption State
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        handlePostLoginSync(user);
        fetchDashboardData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- POST-LOGIN DATA SYNC LOGIC ---
  const handlePostLoginSync = async (user: FirebaseUser) => {
    const cachedApp = localStorage.getItem('pending_application');
    
    if (user && cachedApp && supabase) {
      console.log("⚡ SYNC: Detected cached guest application. Initializing secure upload...");
      try {
        const data = JSON.parse(cachedApp);
        
        // Map cached guest form fields to Supabase profile schema
        const updates = {
          display_name: data.fullName,
          handle: data.handle,
          niche: data.niche,
          city: data.city,
          phone: data.phone,
          followers: data.followers,
          platform: data.platform,
          card_status: 'pending', // This triggers visibility in the Admin Panel
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('firebase_uid', user.uid);

        if (!error) {
          console.log("✅ SYNC: Guest data successfully merged with authenticated node.");
          localStorage.removeItem('pending_application');
          
          // Trigger success UI feedback
          setShowSyncToast(true);
          setTimeout(() => setShowSyncToast(false), 5000);
          
          // Immediately refresh profile data to show 'pending' status in UI
          await fetchDashboardData(user);
        } else {
          throw error;
        }
      } catch (err) {
        console.error("❌ SYNC: Transmission error during data merge:", err);
      }
    }
  };

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
    if (!supabase) return;
    try {
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

      if (profileRes.data) setProfile(profileRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (notifRes.data) setNotifications(notifRes.data);
    } catch (error) {
      console.error("Dashboard Data Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (!profile || profile.reelcoins < reward.cost) {
      alert("⛔ INSUFFICIENT FUNDS");
      return;
    }
    if (!confirm(`REDEEM ${reward.title}?`)) return;
    setIsProcessing(reward.id);
    try {
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });
      if (error) throw error;
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'REDEEMED' }));
      if (currentUser) fetchDashboardData(currentUser);
    } catch (err: any) {
      alert("Redemption Failed: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Scanning Bio-Metrics...</p>
      </div>
    );
  }

  // --- GUEST LOGIN OVERLAY ---
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
        <div className="w-full max-w-md bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_#834bf1] animate-in zoom-in-95 duration-300">
          <div className="bg-[#ffde59] border-b-[4px] border-black p-4 flex items-center space-x-3">
            <AlertTriangle size={24} strokeWidth={3} className="text-black" />
            <span className="font-black uppercase italic tracking-widest text-xs">⚠️ SYSTEM ALERT</span>
          </div>
          
          <div className="p-10 space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase italic leading-none font-display text-black">Unidentified Signal</h2>
              <p className="text-black/60 text-xs font-bold uppercase leading-relaxed tracking-tight">
                Secure your Creator Card and access the Dashboard by verifying your identity.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full bg-black text-white py-6 border-[4px] border-black font-black uppercase text-xs tracking-[0.4em] shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-4 group"
              >
                <Fingerprint size={20} strokeWidth={3} className="text-[#ffde59]" />
                <span>Verify Identity</span>
              </button>
              
              <button 
                onClick={onBack}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 hover:text-black transition-colors"
              >
                Return to Studio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  const isApproved = profile?.card_status === 'approved';
  const coinBalance = profile?.reelcoins || 0;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-white text-black font-lexend selection:bg-[#ffde59] overflow-x-hidden">
      
      {/* SUCCESS TOAST FOR SYNC */}
      {showSyncToast && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-10 duration-500">
          <div className="bg-[#834bf1] text-white px-8 py-5 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-4">
            <PartyPopper className="text-[#ffde59]" />
            <span className="font-black text-xs uppercase tracking-[0.2em]">Application Submitted Successfully</span>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-xl bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000]">
            <div className="p-8 border-b-[4px] border-black flex items-center justify-between bg-[#ffde59]">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Vault History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 border-[3px] border-black bg-white"><X size={20} strokeWidth={4} /></button>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
              {transactions.length === 0 ? (
                <p className="text-center opacity-20 font-black uppercase text-[10px]">No records found.</p>
              ) : (
                transactions.map((tx, i) => (
                  <div key={i} className="border-[3px] border-black p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase italic">{tx.description}</p>
                      <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-lg font-black italic ${tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
            <button onClick={onBack} className="p-2 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter font-display">
              Creator <span className="text-[#834bf1]">Hub</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowNotifs(!showNotifs)} className={`w-12 h-12 flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative ${showNotifs ? 'bg-[#ffde59]' : ''}`}>
              <Bell size={20} strokeWidth={3} />
              {unreadCount > 0 && <div className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 border-black">{unreadCount}</div>}
            </button>

            <button onClick={() => auth.signOut()} className="flex items-center space-x-3 bg-black text-white px-5 py-2.5 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] font-black uppercase tracking-widest italic">
              <LogOut size={16} strokeWidth={3} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden group">
               <div className="absolute top-4 right-4 border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 bg-[#ffde59]">
                  {isApproved ? <CheckCircle2 size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isApproved ? 'Verified' : 'Syncing'}</span>
               </div>
               <div className="w-40 h-40 border-[6px] border-black shadow-[8px_8px_0px_0px_#834bf1] mx-auto bg-[#ffde59] mt-6 overflow-hidden">
                  {profile?.photo_url || currentUser?.photoURL ? (
                    <img src={profile?.photo_url || currentUser?.photoURL} alt="Agent" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User size={64} strokeWidth={3} /></div>
                  )}
               </div>
               <div className="mt-8 space-y-2">
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic font-display">{profile?.display_name || "Agent"}</h2>
                 <p className="text-[#834bf1] font-black text-sm uppercase italic tracking-widest">@{profile?.handle || "unlinked"}</p>
               </div>
            </div>

            <div className="bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Wallet size={24} strokeWidth={3} className="text-[#ffde59]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Liquid Assets</span>
                </div>
              </div>
              <p className="text-7xl font-black tracking-tighter italic font-display">{coinBalance.toLocaleString()} <span className="text-2xl text-[#ffde59]">RC</span></p>
              <button onClick={() => setShowHistory(true)} className="w-full mt-10 bg-black text-white border-[3px] border-white py-5 font-black uppercase text-[10px] tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                📜 Vault Ledger
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10 relative">
            {!isApproved && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-12 bg-white/20 backdrop-blur-[2px]">
                <div className="bg-[#ffde59] border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] text-center space-y-6">
                  <Lock size={40} strokeWidth={3} className="mx-auto" />
                  <h3 className="text-3xl font-black uppercase italic font-display">Node Syncing</h3>
                  <p className="text-black text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto border-t-[3px] border-black/10 pt-6">
                    Our team is reviewing your deployment. Grid modules will unlock shortly.
                  </p>
                </div>
              </div>
            )}

            <div className={`flex border-[6px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2.5 ${!isApproved ? 'grayscale opacity-60' : ''}`}>
              <button onClick={() => setActiveTab('missions')} className={`flex-1 py-5 font-black uppercase text-sm tracking-[0.3em] italic ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>Missions</button>
              <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-5 font-black uppercase text-sm tracking-[0.3em] italic ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>Rewards</button>
            </div>

            <div className={`space-y-8 min-h-[600px] ${!isApproved ? 'blur-[1px] pointer-events-none' : ''}`}>
              {activeTab === 'missions' ? (
                missions.length === 0 ? (
                  <div className="bg-white border-[6px] border-black p-24 text-center opacity-30 font-black uppercase text-xs tracking-widest italic">Scanning operational grid...</div>
                ) : (
                  missions.map((m) => (
                    <div key={m.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-10">
                      <div className="space-y-4 flex-1">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter font-display text-black">{m.title}</h3>
                        <p className="text-xs font-bold text-black/60 uppercase tracking-tight line-clamp-2">{m.description}</p>
                      </div>
                      <div className="bg-black text-[#ffde59] px-8 py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#834bf1] font-black text-4xl italic font-display">+{m.reward_amount} RC</div>
                    </div>
                  ))
                )
              ) : (
                rewards.map((r) => (
                  <div key={r.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center space-x-8 flex-1">
                       <div className="w-16 h-16 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white"><Gift size={24} strokeWidth={3} /></div>
                       <h3 className="text-2xl font-black uppercase italic font-display">{r.title}</h3>
                    </div>
                    <div className="flex items-center space-x-10">
                      <p className="text-3xl font-black text-[#834bf1] italic tracking-tighter">{r.cost} RC</p>
                      <button 
                        disabled={isProcessing === r.id || !!revealedCodes[r.id]} 
                        onClick={() => handleRedeem(r)} 
                        className={`px-8 py-4 border-[4px] border-black font-black uppercase text-[12px] tracking-[0.4em] shadow-[6px_6px_0px_0px_#000] active:scale-95 ${revealedCodes[r.id] ? 'bg-[#ffde59] text-black' : 'bg-black text-white'}`}
                      >
                        {isProcessing === r.id ? <Loader2 className="animate-spin" /> : revealedCodes[r.id] ? `CODE: ${revealedCodes[r.id]}` : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};