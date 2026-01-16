import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, X, Bell, Fingerprint, Clock, Zap, Sparkles, Gift,
  Target, Info, MapPin, TrendingUp, Maximize2, RefreshCw, Building2, CheckCircle, PartyPopper,
  MessageSquare
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface DashboardViewProps {
  onBack: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  type: 'mission' | 'system';
  timestamp: Date;
  read: boolean;
  reward?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  // Real-time Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [newMissionDetails, setNewMissionDetails] = useState<any>(null);
  
  // New Balance Override Modal State
  const [adjustmentModal, setAdjustmentModal] = useState<any>(null);

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;

    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

      if (pError && pError.code !== 'PGRST116') throw pError;
      setProfile(profileData);

      const { data: latestTxs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestTxs?.[0]?.metadata?.description && !localStorage.getItem(`read_tx_${latestTxs[0].id}`)) {
        setAdjustmentModal(latestTxs[0]);
      }

      const { data: allMissions } = await supabase
        .from('missions')
        .select('*, partner_brands(*)');

      if (allMissions) {
        const filtered = allMissions.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          const isGlobal = Array.isArray(m.assigned_to) && m.assigned_to.length === 0;
          const isAssigned = m.assigned_to?.includes(user.uid) || m.assigned_to?.includes(profileData?.id);
          return isGlobal || isAssigned;
        });
        setMissions(filtered);
      }

      const [rRes, sRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('mission_id, status').eq('user_id', user.uid)
      ]);

      if (rRes.data) {
        const filteredRewards = rRes.data.filter(r => {
          const isGlobal = Array.isArray(r.assigned_to) && r.assigned_to.length === 0;
          const isAssigned = Array.isArray(r.assigned_to) && r.assigned_to.includes(user.uid);
          return isGlobal || isAssigned;
        });
        setRewards(filteredRewards);
      }
      
      if (sRes.data) setUserSubmissions(sRes.data);

    } catch (err) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchOperationalGrid(user);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchOperationalGrid]);

  useEffect(() => {
    if (!currentUser || !supabase) return;
    const client = supabase;
    
    const channel = client.channel(`dashboard-live-sync-${currentUser.uid}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `firebase_uid=eq.${currentUser.uid}` 
      }, () => {
        fetchOperationalGrid(currentUser);
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transactions', 
        filter: `user_id=eq.${currentUser.uid}` 
      }, (payload) => {
        fetchOperationalGrid(currentUser);
        if (payload.new.metadata?.description) {
           setAdjustmentModal(payload.new);
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'missions' 
      }, (payload) => {
        // Logic: Check if new mission targets this user
        const newM = payload.new;
        const isGlobal = Array.isArray(newM.assigned_to) && newM.assigned_to.length === 0;
        const isAssigned = newM.assigned_to?.includes(currentUser.uid);
        
        if (isGlobal || isAssigned) {
          // Play Signal Sound
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
          
          setNotifications(prev => [{
            id: newM.id,
            title: `NEW MISSION: ${newM.title}`,
            type: 'mission',
            timestamp: new Date(),
            read: false,
            reward: newM.reward_amount
          }, ...prev]);
          
          setNewMissionDetails(newM);
          setShowNotifModal(true);
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'missions' 
      }, (payload) => {
        if (payload.eventType !== 'INSERT') fetchOperationalGrid(currentUser);
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rewards' 
      }, () => {
        fetchOperationalGrid(currentUser);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'submissions', 
        filter: `user_id=eq.${currentUser.uid}` 
      }, () => {
        fetchOperationalGrid(currentUser);
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [currentUser, fetchOperationalGrid]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleRedeem = async (reward: any) => {
    if (!profile || profile.reelcoins < reward.cost) return alert("⛔ INSUFFICIENT RC BAL");
    if (!confirm(`Redeem "${reward.title}" from ${reward.partner_brands?.name || 'Reelywood'}?`)) return;
    
    setIsProcessing(reward.id);
    try {
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });
      if (error) throw error;
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'DECRYPTED_HASH' }));
      if (currentUser) fetchOperationalGrid(currentUser);
    } catch (err: any) {
      alert("Redemption Protocol Failure: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const closeAdjustmentModal = () => {
    if (adjustmentModal) {
      localStorage.setItem(`read_tx_${adjustmentModal.id}`, 'true');
    }
    setAdjustmentModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Establishing Neural Link...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-6">
        <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_#000] p-10 max-w-md w-full space-y-8">
           <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#834bf1] border-[3px] border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <Fingerprint className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-black italic uppercase font-display text-black">Hub Access Required</h1>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Verify identity node to continue</p>
           </div>
           <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white border-[4px] border-black py-5 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 text-black">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
             <span>Continue with Google</span>
           </button>
           <button onClick={onBack} className="w-full text-[10px] font-black uppercase text-black/30 hover:text-black">Return to Studio</button>
        </div>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {selectedMission && (
        <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser); }} />
      )}

      {/* INSTANT MISSION NOTIFICATION MODAL */}
      {showNotifModal && newMissionDetails && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-[#834bf1] p-8 text-white border-b-[6px] border-black text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_2px,transparent_0)] [background-size:20px_20px]"></div>
                <Zap size={48} className="mx-auto mb-4 text-[#ffde59] animate-pulse" />
                <h3 className="text-3xl font-black italic uppercase font-display leading-tight">Incoming Transmission</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-2 text-[#ffde59]">Primary Mission Uplink Detected</p>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3"><span className="w-2 h-2 bg-[#834bf1] rounded-full animate-ping"></span><span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Objective</span></div>
                   <h4 className="text-2xl font-black uppercase italic font-display">{newMissionDetails.title}</h4>
                   <div className="bg-slate-50 border-[3px] border-black p-4 flex justify-between items-center">
                      <span className="font-black text-xs uppercase italic text-black/50">Allocated Reward</span>
                      <span className="text-xl font-black text-[#834bf1] italic">{newMissionDetails.reward_amount} RC</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowNotifModal(false)} className="py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Dismiss</button>
                  <button onClick={() => { setSelectedMission(newMissionDetails); setShowNotifModal(false); }} className="py-4 bg-black text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] font-black uppercase text-[10px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 transition-all">View Brief</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* BALANCE OVERRIDE MODAL */}
      {adjustmentModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button onClick={closeAdjustmentModal} className="absolute top-4 right-4 z-10 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors">
                <X size={20} strokeWidth={3}/>
              </button>
              {adjustmentModal.metadata?.image && (
                <div className="h-48 w-full border-b-[4px] border-black overflow-hidden bg-slate-100">
                  <img src={adjustmentModal.metadata.image} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-10 text-center space-y-6">
                 <div className="w-20 h-20 bg-[#ffde59] border-[4px] border-black mx-auto flex items-center justify-center -rotate-6 shadow-[6px_6px_0px_0px_#000]">
                    <PartyPopper size={40} className="text-black" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black italic uppercase font-display">Neural Reward Detected</h3>
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-black/40 italic">Inbound Ledger Update</p>
                 </div>
                 <div className="bg-[#834bf1] p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] text-white">
                    <div className="text-5xl font-black italic font-display">{adjustmentModal.amount > 0 ? '+' : ''}{adjustmentModal.amount} RC</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ffde59] mt-2">Ledger Synchronization: Success</p>
                 </div>
                 <p className="font-bold text-sm uppercase tracking-tight leading-relaxed py-4 border-y-2 border-black/5">
                   "{adjustmentModal.metadata?.description || "Manual override executed by dispatch."}"
                 </p>
                 <button onClick={closeAdjustmentModal} className="w-full bg-black text-white py-5 border-[3px] border-white shadow-[6px_6px_0px_0px_#000] font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                   Acknowledged
                 </button>
              </div>
           </div>
        </div>
      )}

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[50] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-[#ffde59] transition-all">
              <ArrowLeft size={20} strokeWidth={4} />
            </button>
            <h1 className="text-xl md:text-3xl font-black uppercase italic font-display">Creator <span className="text-[#834bf1]">Hub</span></h1>
          </div>
          <div className="flex items-center space-x-6">
            {/* NOTIFICATION BELL COMPONENT */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); if(!showNotifDropdown) markAllRead(); }}
                className={`p-2 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] transition-all ${unreadCount > 0 ? 'bg-[#ffde59]' : 'bg-white'} hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none`}
              >
                <Bell size={20} strokeWidth={3} className={unreadCount > 0 ? 'animate-bounce' : ''} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-black text-[8px] font-black flex items-center justify-center text-white">{unreadCount}</span>}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-6 w-80 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] animate-in slide-in-from-top-4 duration-300 z-[100]">
                  <div className="p-4 bg-black text-white flex justify-between items-center border-b-[4px] border-black">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Log</span>
                    <button onClick={() => setShowNotifDropdown(false)}><X size={14} strokeWidth={4} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center opacity-20 font-black text-[10px] uppercase italic">Log Clear... No Signals</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b-2 border-black/5 hover:bg-slate-50 transition-colors cursor-default">
                          <div className="flex items-start gap-3">
                             <div className="w-8 h-8 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#834bf1] shrink-0">
                               <Zap size={14} strokeWidth={3} />
                             </div>
                             <div className="min-w-0">
                               <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{n.title}</p>
                               <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[8px] font-black text-emerald-600">+{n.reward} RC</span>
                                  <span className="text-[8px] font-bold text-black/30 italic">{n.timestamp.toLocaleTimeString()}</span>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 border-t-2 border-black text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30 italic">End of Log</p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-black uppercase opacity-40">Identity Node</span>
               <span className="text-xs font-bold uppercase">{currentUser.email}</span>
            </div>
            <button onClick={() => auth.signOut()} className="bg-black text-white p-2 border-[3px] border-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <LogOut size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] relative overflow-hidden group">
               <div className="absolute top-4 right-4 bg-[#ffde59] border-[3px] border-black px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] text-black">
                  {isApproved ? 'VERIFIED' : 'SYNCING'}
               </div>
               <div className="w-32 h-32 border-[5px] border-black mx-auto mb-6 bg-slate-100 overflow-hidden shadow-[6px_6px_0px_0px_#834bf1]">
                  <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.uid}`} alt="Agent" className="w-full h-full object-cover" />
               </div>
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase italic font-display">{profile?.display_name || "Agent " + currentUser.uid.slice(0,4)}</h2>
                  <p className="text-[#834bf1] font-black text-xs uppercase tracking-[0.2em] italic">@{profile?.handle || "unlinked"}</p>
               </div>
            </div>

            <div className="bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] text-white">
               <div className="flex items-center gap-3 mb-6 opacity-60">
                  <Wallet size={18} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Liquid Assets</span>
               </div>
               <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-black italic font-display tracking-tighter">{profile?.reelcoins?.toLocaleString() || "0"}</span>
                  <span className="text-2xl font-black text-[#ffde59]">RC</span>
               </div>
               <div className="mt-8 pt-8 border-t-[3px] border-white/20">
                  <button className="w-full bg-black text-white py-4 border-[3px] border-white font-black uppercase text-[10px] tracking-[0.4em] shadow-[4px_4px_0px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">Vault Ledger</button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex border-[6px] border-black bg-white p-2 shadow-[10px_10px_0px_0px_#000]">
              <button onClick={() => setActiveTab('missions')} className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100 text-black'}`}>Mission Grid</button>
              <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100 text-black'}`}>Reward Node</button>
            </div>

            {!isApproved && (
               <div className="bg-[#ffde59] border-[6px] border-black p-12 text-center shadow-[16px_16px_0px_0px_#000] animate-in zoom-in duration-300 text-black">
                  <Lock size={48} className="mx-auto mb-6 text-black" strokeWidth={3} />
                  <h3 className="text-3xl font-black uppercase italic font-display">Identity Syncing</h3>
                  <p className="text-xs font-bold uppercase tracking-tight leading-relaxed max-w-sm mx-auto mt-4">Your credentials are being reviewed by the Reelywood Dispatch. Access will unlock upon node verification.</p>
               </div>
            )}

            {isApproved && (
              <div className="space-y-8 animate-in fade-in duration-500 text-black">
                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {missions.length === 0 ? (
                      <div className="col-span-full py-24 text-center opacity-20 font-black uppercase text-xs tracking-widest italic border-4 border-dashed border-black">Scanning grid...</div>
                    ) : (
                      missions.map((m) => {
                        const submission = userSubmissions.find(s => String(s.mission_id) === String(m.id));
                        const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                        const isPending = submission?.status === 'pending' || submission?.status === 'verifying';
                        const brand = m.partner_brands;
                        
                        const cardBg = isDone ? 'bg-emerald-50 border-emerald-500 shadow-emerald-200' : isPending ? 'bg-yellow-50 border-yellow-500 shadow-yellow-200' : 'bg-white border-black shadow-black';
                        const btnColor = isDone ? 'bg-emerald-600 border-emerald-700' : isPending ? 'bg-yellow-400 border-yellow-600 text-black' : 'bg-[#834bf1] border-black';
                        const btnText = isDone ? 'MISSION COMPLETED' : isPending ? 'PENDING REVIEW' : 'INITIALIZE MISSION';
                        
                        return (
                          <div key={m.id} className={`relative border-[4px] p-8 shadow-[8px_8px_0px_0px] group transition-all flex flex-col overflow-hidden ${cardBg}`}>
                             {isDone && (
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none z-20 opacity-30 select-none">
                                 <div className="border-[8px] border-emerald-700 px-6 py-4 rounded-2xl">
                                   <span className="text-4xl font-black uppercase italic tracking-tighter text-emerald-700 font-display whitespace-nowrap">MISSION ACCOMPLISHED</span>
                                 </div>
                               </div>
                             )}
                             
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center p-2 shadow-[3px_3px_0px_0px_#000]">
                                   {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Building2 size={24} className="text-[#834bf1]" />}
                                </div>
                                <div className={`px-3 py-1 font-black text-xs italic border-[2px] ${isDone ? 'bg-emerald-600 text-white' : isPending ? 'bg-yellow-400 text-black' : 'bg-black text-[#ffde59]'}`}>
                                  {isDone ? 'VERIFIED' : isPending ? 'PENDING' : `+${m.reward_amount} RC`}
                                </div>
                             </div>
                             
                             <div className="mb-4">
                               <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isDone ? 'text-emerald-700' : isPending ? 'text-yellow-700' : 'text-[#834bf1]'}`}>{brand?.name || 'Reelywood Labs'}</p>
                               <h3 className="text-xl font-black uppercase italic font-display leading-tight">{m.title}</h3>
                             </div>
                             
                             <p className="text-[10px] font-bold text-black/50 leading-relaxed uppercase mb-8 line-clamp-3 border-l-2 border-slate-100 pl-3">{m.description}</p>
                             
                             <div className="mt-auto">
                                <button 
                                  onClick={() => { 
                                    if (isDone || isPending) return; 
                                    setSelectedMission(m); 
                                  }} 
                                  disabled={isDone || isPending} 
                                  className={`w-full py-4 border-[3px] font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white ${btnColor} disabled:opacity-80 disabled:cursor-not-allowed`}
                                >
                                  {btnText}
                                </button>
                             </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {rewards.length === 0 ? (
                      <div className="py-24 text-center border-4 border-dashed border-black/10"><Gift size={48} className="mx-auto mb-4 opacity-10" /><p className="text-xs font-black italic uppercase opacity-20 tracking-widest">Voucher Node Empty</p></div>
                    ) : (
                      rewards.map((r) => {
                        const brand = r.partner_brands;
                        return (
                          <div key={r.id} className="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-[12px_12px_0px_0px_#ffde59] transition-all">
                             <div className="flex items-center gap-8 flex-1">
                                <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-all overflow-hidden p-2">{brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Gift size={28} className="text-[#ffde59]" strokeWidth={3} />}</div>
                                <div className="min-w-0">
                                   <div className="flex items-center gap-3 mb-1"><h4 className="text-2xl font-black uppercase italic font-display truncate">{r.title}</h4><div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div></div>
                                   <div className="flex flex-col gap-1"><p className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.3em]">{brand?.name || 'Reelywood'}</p>{brand?.location_text && <p className="text-[8px] font-bold uppercase text-black/40 tracking-widest flex items-center gap-1"><MapPin size={10}/> {brand.location_text}</p>}</div>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 shrink-0"><div className="text-right"><span className="text-3xl font-black italic font-display text-[#834bf1]">{r.cost}</span><span className="text-xs font-black ml-2 uppercase italic opacity-40">RC</span></div><button onClick={() => handleRedeem(r)} disabled={isProcessing === r.id || !!revealedCodes[r.id]} className={`px-8 py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-[0.4em] shadow-[5px_5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${revealedCodes[r.id] ? 'bg-[#39ff14] text-black border-[#000]' : 'bg-black text-white hover:bg-[#834bf1]'}`}>{isProcessing === r.id ? <Loader2 className="animate-spin" /> : revealedCodes[r.id] ? `HASH: ${revealedCodes[r.id]}` : 'EXECUTE REDEEM'}</button></div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};