
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, X, Bell, Fingerprint, Clock, Zap, Sparkles, Gift,
  Target, Info, MapPin, TrendingUp, Maximize2, RefreshCw, Building2, CheckCircle, PartyPopper,
  MessageSquare, Radio
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface DashboardViewProps {
  onBack: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'mission' | 'reward' | 'system';
  timestamp: Date;
  read: boolean;
  data?: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activeIncomingAlert, setActiveIncomingAlert] = useState<NotificationItem | null>(null);
  
  // Balance/Ledger Adjustments
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

      const { data: allMissions } = await supabase
        .from('missions')
        .select('*, partner_brands(*)');

      if (allMissions) {
        const filtered = allMissions.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          const isGlobal = !m.assigned_to || (Array.isArray(m.assigned_to) && m.assigned_to.length === 0);
          const isAssigned = Array.isArray(m.assigned_to) && (m.assigned_to.includes(user.uid) || m.assigned_to.includes(profileData?.id));
          return isGlobal || isAssigned;
        });
        setMissions(filtered);
      }

      const [rRes, sRes, redRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('mission_id, status').eq('user_id', user.uid),
        supabase.from('user_rewards').select('reward_id').eq('user_id', user.uid)
      ]);

      if (rRes.data) {
        const filteredRewards = rRes.data.filter(r => {
          const isGlobal = !r.assigned_to || (Array.isArray(r.assigned_to) && r.assigned_to.length === 0);
          const isAssigned = Array.isArray(r.assigned_to) && r.assigned_to.includes(user.uid);
          return isGlobal || isAssigned;
        });
        setRewards(filteredRewards);
      }
      
      if (sRes.data) setUserSubmissions(sRes.data);
      if (redRes.data) setMyRedemptions(redRes.data.map((r: any) => String(r.reward_id)));

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
    
    // --- CONSOLIDATED REALTIME ENGINE ---
    const channel = client.channel(`dashboard-live-sync-${currentUser.uid}`)
      // 1. Mission/Voucher Detection logic
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'missions' 
      }, (payload) => {
        const newM = payload.new;
        const isGlobal = !newM.assigned_to || (Array.isArray(newM.assigned_to) && newM.assigned_to.length === 0);
        const isAssigned = Array.isArray(newM.assigned_to) && newM.assigned_to.includes(currentUser.uid);
        
        if (isGlobal || isAssigned) {
          const newNotif: NotificationItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Mission Deployed',
            message: newM.title,
            type: 'mission',
            timestamp: new Date(),
            read: false,
            data: newM
          };
          setNotifications(prev => [newNotif, ...prev]);
          setActiveIncomingAlert(newNotif);
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'rewards' 
      }, (payload) => {
        const newR = payload.new;
        const isGlobal = !newR.assigned_to || (Array.isArray(newR.assigned_to) && newR.assigned_to.length === 0);
        const isAssigned = Array.isArray(newR.assigned_to) && newR.assigned_to.includes(currentUser.uid);
        
        if (isGlobal || isAssigned) {
          const newNotif: NotificationItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Reward Node Online',
            message: newR.title,
            type: 'reward',
            timestamp: new Date(),
            read: false,
            data: newR
          };
          setNotifications(prev => [newNotif, ...prev]);
          setActiveIncomingAlert(newNotif);
          try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
          fetchOperationalGrid(currentUser);
        }
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
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `firebase_uid=eq.${currentUser.uid}` 
      }, (payload) => {
        setProfile(payload.new);
        fetchOperationalGrid(currentUser);
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [currentUser, fetchOperationalGrid]);

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

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Synchronizing Node Grid...</p>
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
              <h1 className="text-3xl font-black italic uppercase font-display text-black">Terminal Access Required</h1>
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

      {/* PERSISTENT ALERT MODAL (New Missions/Vouchers) */}
      {activeIncomingAlert && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-[#834bf1] p-10 text-white border-b-[6px] border-black text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Radio size={80} strokeWidth={1} /></div>
                <Zap size={56} className="mx-auto mb-6 text-[#ffde59] animate-bounce" />
                <h3 className="text-4xl font-black italic uppercase font-display leading-tight">{activeIncomingAlert.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-3 text-[#ffde59]">Broadcast Signal Locked</p>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-4">
                   <h4 className="text-2xl font-black uppercase italic font-display">{activeIncomingAlert.message}</h4>
                   <div className="bg-slate-50 border-[3px] border-black p-5 flex justify-between items-center shadow-[4px_4px_0px_0px_#000]">
                      <span className="font-black text-xs uppercase italic text-black/50 tracking-widest">Type</span>
                      <span className="text-lg font-black text-[#834bf1] italic uppercase">{activeIncomingAlert.type}</span>
                   </div>
                </div>
                <button 
                  onClick={() => { 
                    setActiveIncomingAlert(null); 
                    if (activeIncomingAlert.type === 'mission') {
                       setSelectedMission(activeIncomingAlert.data);
                    } else {
                       setActiveTab('rewards');
                    }
                  }} 
                  className="w-full py-6 bg-black text-white border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black uppercase text-xs tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  View Details
                </button>
                <button onClick={() => setActiveIncomingAlert(null)} className="w-full text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">Acknowledge & Close</button>
              </div>
           </div>
        </div>
      )}

      {/* LEDGER ADJUSTMENT MODAL */}
      {adjustmentModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button onClick={() => setAdjustmentModal(null)} className="absolute top-4 right-4 z-10 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors">
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
                 <h3 className="text-3xl font-black italic uppercase font-display">Ledger Reward</h3>
                 <div className="bg-[#834bf1] p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] text-white">
                    <div className="text-5xl font-black italic font-display">{adjustmentModal.amount > 0 ? '+' : ''}{adjustmentModal.amount} RC</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ffde59] mt-2">Node Sync Success</p>
                 </div>
                 <p className="font-bold text-sm uppercase tracking-tight italic">"{adjustmentModal.metadata?.description || "Manual override executed."}"</p>
                 <button onClick={() => setAdjustmentModal(null)} className="w-full bg-black text-white py-5 border-[3px] border-white shadow-[6px_6px_0px_0px_#000] font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Acknowledged</button>
              </div>
           </div>
        </div>
      )}

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-[#ffde59] transition-all">
              <ArrowLeft size={20} strokeWidth={4} />
            </button>
            <h1 className="text-xl md:text-3xl font-black uppercase italic font-display">Creator <span className="text-[#834bf1]">Hub</span></h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`p-3 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] transition-all relative ${unreadCount > 0 ? 'bg-[#ffde59]' : 'bg-white'}`}
              >
                <Bell size={20} strokeWidth={3} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white border-2 border-black w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-none shadow-[2px_2px_0px_0px_#000]">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifDropdown && (
                <div className="absolute top-14 right-0 w-80 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_#000] z-[200] animate-in slide-in-from-top-2">
                  <div className="p-4 border-b-2 border-black bg-slate-50 flex justify-between items-center">
                    <span className="font-black text-[10px] uppercase tracking-widest">Protocol Notifications</span>
                    <button onClick={markAllRead} className="text-[9px] font-black uppercase text-[#834bf1] hover:underline">Mark read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center opacity-30 italic text-xs font-black uppercase">No signals detected.</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-4 border-b-2 border-black/5 flex gap-4 items-start hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/50 border-l-[4px] border-l-[#834bf1]' : ''}`}
                        >
                          <div className={`mt-1 p-1.5 border-[2px] border-black shadow-[2px_2px_0px_0px_#000] ${n.type === 'mission' ? 'bg-[#ffde59]' : 'bg-[#834bf1] text-white'}`}>
                            {n.type === 'mission' ? <Zap size={14} /> : <Gift size={14} />}
                          </div>
                          <div>
                            <p className="font-black text-[10px] uppercase leading-tight">{n.title}</p>
                            <p className="text-[11px] font-bold mt-1 text-black/60 truncate w-48">{n.message}</p>
                            <p className="text-[8px] font-black uppercase opacity-30 mt-2">{n.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
                  <h3 className="text-3xl font-black uppercase italic font-display text-black">Identity Syncing</h3>
                  <p className="text-xs font-bold uppercase tracking-tight leading-relaxed max-w-sm mx-auto mt-4 text-black">Your credentials are being reviewed by Reelywood Dispatch. Access will unlock upon node verification.</p>
               </div>
            )}

            {isApproved && (
              <div className="space-y-8 animate-in fade-in duration-500 text-black">
                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {missions.length === 0 ? (
                      <div className="col-span-full py-24 text-center opacity-20 font-black uppercase text-xs tracking-widest italic border-4 border-dashed border-black text-black">Scanning grid...</div>
                    ) : (
                      missions.map((m) => {
                        const submission = userSubmissions.find(s => String(s.mission_id) === String(m.id));
                        const subStatus = (submission?.status || '').toLowerCase();
                        const isDone = ['approved', 'completed'].includes(subStatus);
                        const isPending = ['pending', 'verifying'].includes(subStatus);
                        
                        const brand = m.partner_brands;
                        
                        const cardBg = isDone 
                          ? 'bg-emerald-100 border-emerald-500 shadow-emerald-200' 
                          : isPending 
                            ? 'bg-yellow-100 border-yellow-500 shadow-yellow-200' 
                            : 'bg-white border-black shadow-black';

                        const btnColor = isDone 
                          ? 'bg-emerald-600 border-emerald-700' 
                          : isPending 
                            ? 'bg-yellow-400 border-yellow-600 text-black shadow-[4px_4px_0px_0px_#000]' 
                            : 'bg-[#834bf1] border-black';

                        const btnText = isDone ? 'MISSION COMPLETED' : isPending ? 'PENDING REVIEW' : 'INITIALIZE MISSION';
                        
                        return (
                          <div key={m.id} className={`relative border-[4px] p-8 shadow-[8px_8px_0px_0px] group transition-all flex flex-col overflow-hidden ${cardBg}`}>
                             {isDone && (
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none z-20 opacity-30 select-none">
                                 <div className="border-[8px] border-emerald-700 px-6 py-4 rounded-xl">
                                   <span className="text-4xl font-black uppercase italic tracking-tighter text-emerald-700 font-display whitespace-nowrap">MISSION ACCOMPLISHED</span>
                                 </div>
                               </div>
                             )}
                             
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center p-2 shadow-[3px_3px_0px_0px_#000]">
                                   {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Building2 size={24} className="text-[#834bf1]" />}
                                </div>
                                <div className={`px-3 py-1 font-black text-xs italic border-[2px] ${isDone ? 'bg-emerald-600 text-white border-emerald-700' : isPending ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-black text-[#ffde59] border-black'}`}>
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
                                  className={`w-full py-4 border-[3px] font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white ${btnColor} disabled:cursor-not-allowed`}
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
                      <div className="py-24 text-center border-4 border-dashed border-black/10"><Gift size={48} className="mx-auto mb-4 opacity-10" /><p className="text-xs font-black italic uppercase opacity-20 tracking-widest text-black">Voucher Node Empty</p></div>
                    ) : (
                      rewards.map((r) => {
                        const brand = r.partner_brands;
                        const isRedeemed = myRedemptions.includes(String(r.id)) || !!revealedCodes[r.id];
                        
                        return (
                          <div key={r.id} className={`relative border-[5px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all overflow-hidden ${isRedeemed ? 'bg-gray-100 border-gray-400 opacity-75 pointer-events-none shadow-none' : 'bg-white border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#ffde59]'}`}>
                             
                             {isRedeemed && (
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 z-20 pointer-events-none select-none">
                                 <div className="border-[6px] border-rose-600 px-8 py-4 rounded-xl">
                                   <span className="text-5xl font-black uppercase italic tracking-tighter text-rose-600 font-display">REDEEMED</span>
                                 </div>
                               </div>
                             )}

                             <div className="flex items-center gap-8 flex-1 text-black">
                                <div className={`w-16 h-16 border-[4px] flex items-center justify-center transition-all overflow-hidden p-2 ${isRedeemed ? 'bg-gray-200 border-gray-400 shadow-none' : 'bg-white border-black shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6'}`}>
                                  {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Gift size={28} className={`${isRedeemed ? 'text-gray-400' : 'text-[#ffde59]'}`} strokeWidth={3} />}
                                </div>
                                <div className="min-w-0">
                                   <div className="flex items-center gap-3 mb-1">
                                      <h4 className={`text-2xl font-black uppercase italic font-display truncate ${isRedeemed ? 'text-gray-500' : ''}`}>{r.title}</h4>
                                      {!isRedeemed && <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div>}
                                   </div>
                                   <div className="flex flex-col gap-1">
                                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isRedeemed ? 'text-gray-400' : 'text-[#834bf1]'}`}>{brand?.name || 'Reelywood'}</p>
                                      {brand?.location_text && <p className="text-[8px] font-bold uppercase text-black/40 tracking-widest flex items-center gap-1"><MapPin size={10}/> {brand.location_text}</p>}
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 shrink-0 text-black">
                                <div className="text-right">
                                   <span className={`text-3xl font-black italic font-display ${isRedeemed ? 'text-gray-400' : 'text-[#834bf1]'}`}>{r.cost}</span>
                                   <span className="text-xs font-black ml-2 uppercase italic opacity-40">RC</span>
                                </div>
                                <button 
                                  onClick={() => handleRedeem(r)} 
                                  disabled={isProcessing === r.id || !!revealedCodes[r.id] || isRedeemed} 
                                  className={`px-8 py-4 border-[3px] font-black uppercase text-[10px] tracking-[0.4em] shadow-[5px_5px_0px_0px_#000] transition-all ${isRedeemed ? 'bg-gray-800 text-gray-500 border-gray-900 pointer-events-none' : revealedCodes[r.id] ? 'bg-[#39ff14] text-black border-[#000] hover:translate-x-0.5 hover:translate-y-0.5' : 'bg-black text-white hover:bg-[#834bf1] border-black hover:translate-x-0.5 hover:translate-y-0.5'}`}
                                >
                                  {isProcessing === r.id ? <Loader2 className="animate-spin" /> : revealedCodes[r.id] ? `HASH: ${revealedCodes[r.id]}` : isRedeemed ? 'REDEEMED' : 'EXECUTE REDEEM'}
                                </button>
                             </div>
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
