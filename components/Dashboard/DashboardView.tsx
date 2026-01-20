
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, X, Bell, Fingerprint, Clock, Zap, Sparkles, Gift,
  Target, MapPin, TrendingUp, Maximize2, Building2, PartyPopper,
  Radio, LayoutDashboard, CreditCard, Share2, QrCode, Settings,
  ChevronRight, Activity
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { ThreeDCard } from '../ThreeDCard';

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

type TabType = 'feeds' | 'card' | 'missions' | 'vouchers' | 'profile';

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('feeds');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [activeIncomingAlert, setActiveIncomingAlert] = useState<NotificationItem | null>(null);
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
    
    const channel = client.channel(`dashboard-live-sync-${currentUser.uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'missions' }, (payload) => {
        const newM = payload.new;
        const isGlobal = !newM.assigned_to || (Array.isArray(newM.assigned_to) && newM.assigned_to.length === 0);
        const isAssigned = Array.isArray(newM.assigned_to) && newM.assigned_to.includes(currentUser.uid);
        if (isAssigned || isGlobal) {
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
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rewards' }, (payload) => {
        const newR = payload.new;
        const isGlobal = !newR.assigned_to || (Array.isArray(newR.assigned_to) && newR.assigned_to.length === 0);
        const isAssigned = Array.isArray(newR.assigned_to) && newR.assigned_to.includes(currentUser.uid);
        if (isAssigned || isGlobal) {
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
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${currentUser.uid}` }, (payload) => {
        fetchOperationalGrid(currentUser);
        if (payload.new.metadata?.description) {
           setAdjustmentModal(payload.new);
        }
      })
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [currentUser, fetchOperationalGrid]);

  const handleRedeem = async (reward: any) => {
    const isAlreadyRedeemed = myRedemptions.includes(String(reward.id));
    if (isAlreadyRedeemed) return alert("⛔ PROTOCOL DENIED: Reward already claimed.");
    if (!profile || profile.reelcoins < reward.cost) return alert("⛔ INSUFFICIENT RC BAL");
    if (!confirm(`Redeem "${reward.title}" for ${reward.cost} RC?`)) return;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Syncing Hub...</p>
      </div>
    );
  }

  if (!currentUser) return null; // Logic in App.tsx handles login redirect

  const isApproved = profile?.card_status === 'approved';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend flex flex-col max-w-2xl mx-auto border-x-0 md:border-x-[4px] border-black pb-20 shadow-2xl">
      {/* Modals remain same for logical consistency */}
      {selectedMission && (
        <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser); }} />
      )}

      {activeIncomingAlert && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] max-w-lg w-full relative overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#834bf1] p-10 text-white border-b-[6px] border-black text-center">
                <Zap size={56} className="mx-auto mb-6 text-[#ffde59] animate-bounce" />
                <h3 className="text-4xl font-black italic uppercase font-display leading-tight">{activeIncomingAlert.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-3 text-[#ffde59]">Broadcast Signal Locked</p>
              </div>
              <div className="p-10 space-y-8">
                <h4 className="text-2xl font-black uppercase italic font-display">{activeIncomingAlert.message}</h4>
                <button 
                  onClick={() => { 
                    const targetData = activeIncomingAlert.data;
                    const type = activeIncomingAlert.type;
                    setActiveIncomingAlert(null); 
                    if (type === 'mission') setSelectedMission(targetData);
                    else setActiveTab('vouchers');
                  }} 
                  className="w-full py-6 bg-black text-white border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black uppercase text-xs tracking-[0.3em]"
                >
                  Authorize Brief
                </button>
              </div>
           </div>
        </div>
      )}

      {/* FIXED HEADER */}
      <header className="sticky top-0 z-[100] bg-white border-b-[4px] border-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 border-[2px] border-black bg-white hover:bg-[#ffde59] transition-all">
            <ArrowLeft size={18} strokeWidth={4} />
          </button>
          <span className="font-black uppercase italic font-display text-lg tracking-tighter">REELYWOOD<span className="text-[#834bf1]">HUB</span></span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`p-2.5 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] relative ${unreadCount > 0 ? 'bg-[#ffde59]' : 'bg-white'}`}
          >
            <Bell size={20} strokeWidth={3} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white border-2 border-black w-5 h-5 flex items-center justify-center text-[9px] font-black shadow-[1px_1px_0px_0px_#000]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activeTab === 'feeds' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Wallet Card */}
            <div className="bg-[#834bf1] border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_#000] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={100} /></div>
               <div className="flex items-center gap-3 mb-4 opacity-70">
                  <Wallet size={16} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Liquid Assets</span>
               </div>
               <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-black italic font-display tracking-tighter">{profile?.reelcoins?.toLocaleString() || "0"}</span>
                  <span className="text-xl font-black text-[#ffde59]">RC</span>
               </div>
            </div>

            {/* Feed Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black/40 flex items-center gap-2">
                <LayoutDashboard size={14} /> Global Transmission Feed
              </h3>
              {notifications.length === 0 ? (
                <div className="bg-white border-[3px] border-black p-10 text-center italic opacity-20 font-black text-[10px] uppercase">Waiting for signals...</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="bg-white border-[3px] border-black p-4 flex gap-4 items-start shadow-[4px_4px_0px_0px_#000]">
                    <div className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${n.type === 'mission' ? 'bg-[#ffde59]' : 'bg-[#834bf1] text-white'}`}>
                      {n.type === 'mission' ? <Zap size={16} /> : <Gift size={16} />}
                    </div>
                    <div>
                      <p className="font-black text-[10px] uppercase">{n.title}</p>
                      <p className="text-[11px] font-bold mt-1 text-black/60">{n.message}</p>
                      <p className="text-[8px] font-black text-black/20 uppercase mt-2">{new Date(n.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-in zoom-in-95 duration-500">
            {!isApproved ? (
               <div className="bg-[#ffde59] border-[5px] border-black p-10 text-center shadow-[10px_10px_0px_0px_#000] w-full">
                  <Lock size={48} className="mx-auto mb-6" strokeWidth={3} />
                  <h3 className="text-2xl font-black uppercase italic font-display">Identity Syncing</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-4">Node verification in progress. estimated time: 24h.</p>
               </div>
            ) : (
              <>
                <div className="w-full max-w-[340px] aspect-[4/5]">
                  <ThreeDCard name={profile?.display_name || "AGENT"} handle={profile?.handle || "unlinked"} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button className="bg-white border-[3px] border-black p-4 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                    <QrCode size={24} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Show QR Node</span>
                  </button>
                  <button className="bg-black text-white border-[3px] border-black p-4 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                    <Share2 size={24} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#ffde59]">Share ID</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-2">
              <Zap size={20} className="text-[#834bf1]" /> Operational Grid
            </h3>
            <div className="space-y-6">
              {missions.length === 0 ? (
                <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">GRID_SILENT</div>
              ) : (
                missions.map(m => {
                  const submission = userSubmissions.find(s => String(s.mission_id) === String(m.id));
                  const isDone = ['approved', 'completed'].includes(submission?.status || '');
                  const isPending = ['pending', 'verifying'].includes(submission?.status || '');
                  const brand = m.partner_brands;

                  return (
                    <div key={m.id} className={`border-[4px] p-6 shadow-[6px_6px_0px_0px] relative overflow-hidden flex flex-col ${isDone ? 'bg-emerald-50 border-emerald-500 shadow-emerald-200' : isPending ? 'bg-yellow-50 border-yellow-500 shadow-yellow-200' : 'bg-white border-black shadow-black'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-white border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_#000]">
                          {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" /> : <Building2 size={20} />}
                        </div>
                        <div className={`px-2 py-1 font-black text-[9px] border-[2px] ${isDone ? 'bg-emerald-600 text-white border-emerald-700' : isPending ? 'bg-yellow-400 text-black border-yellow-600' : 'bg-black text-[#ffde59] border-black'}`}>
                          {isDone ? 'VERIFIED' : isPending ? 'PENDING' : `+${m.reward_amount} RC`}
                        </div>
                      </div>
                      <h4 className="text-lg font-black uppercase italic font-display leading-tight">{m.title}</h4>
                      <p className="text-[10px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2">{m.description}</p>
                      <button 
                        onClick={() => setSelectedMission(m)}
                        disabled={isDone || isPending}
                        className={`w-full py-4 mt-6 border-[3px] font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px] text-white ${isDone ? 'bg-emerald-600 border-emerald-700' : isPending ? 'bg-yellow-400 border-yellow-600 text-black' : 'bg-[#834bf1] border-black'}`}
                      >
                        {isDone ? 'COMPLETED' : isPending ? 'REVIEWING' : 'OPEN BRIEF'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-2">
              <Gift size={20} className="text-[#ffde59] fill-current stroke-black stroke-2" /> Reward Node
            </h3>
            <div className="space-y-4">
              {rewards.length === 0 ? (
                <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">VAULT_EMPTY</div>
              ) : (
                rewards.map(r => {
                  const isRedeemed = myRedemptions.includes(String(r.id)) || !!revealedCodes[r.id];
                  const brand = r.partner_brands;
                  return (
                    <div key={r.id} className={`border-[4px] p-5 flex items-center justify-between gap-4 shadow-[5px_5px_0px_0px] relative overflow-hidden ${isRedeemed ? 'bg-slate-200 border-slate-400 shadow-none' : 'bg-white border-black shadow-[#ffde59]'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_#000]">
                           {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" /> : <Gift size={20} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-black uppercase italic truncate ${isRedeemed ? 'line-through text-slate-400' : ''}`}>{r.title}</h4>
                          <p className="text-[9px] font-black uppercase text-black/30 tracking-widest">{brand?.name || 'Reelywood'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-lg font-black italic ${isRedeemed ? 'text-slate-400' : 'text-[#834bf1]'}`}>{r.cost} RC</span>
                        <button 
                          onClick={() => handleRedeem(r)}
                          disabled={isProcessing === r.id || isRedeemed}
                          className={`px-4 py-2 border-[2px] font-black uppercase text-[8px] tracking-[0.2em] shadow-[3px_3px_0px_0px_#000] ${revealedCodes[r.id] ? 'bg-[#39ff14]' : isRedeemed ? 'bg-slate-700 text-slate-500 border-slate-800' : 'bg-black text-white'}`}
                        >
                          {revealedCodes[r.id] ? revealedCodes[r.id] : isRedeemed ? 'CLAIMED' : 'REDEEM'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
             <div className="bg-white border-[4px] border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_#000]">
                <div className="w-16 h-16 bg-slate-100 border-[3px] border-black overflow-hidden shadow-[3px_3px_0px_0px_#834bf1]">
                  <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`} className="w-full h-full object-cover" />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase italic">{profile?.display_name || "AGENT"}</h3>
                   <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{currentUser.email}</p>
                </div>
             </div>

             <div className="space-y-4">
                <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group">
                   <div className="flex items-center gap-4">
                     <Settings size={18} /> Edit Sync Profile
                   </div>
                   <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group">
                   <div className="flex items-center gap-4">
                     <Target size={18} /> Support Transmission
                   </div>
                   <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>

             <button 
                onClick={() => auth.signOut()}
                className="w-full bg-rose-500 text-white border-[4px] border-black py-6 shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xs tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4"
              >
                <LogOut size={20} strokeWidth={3} />
                <span>TERMINATE SESSION</span>
              </button>

              <div className="text-center pt-10 opacity-10">
                 <p className="text-[8px] font-black uppercase tracking-[0.6em]">PRODUCTION_NODE_v4.2.0 • END_TO_END_ENCRYPTED</p>
              </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-[200] max-w-2xl mx-auto bg-white border-t-[5px] border-black h-20 flex items-center justify-around px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {[
          { id: 'feeds', icon: LayoutDashboard, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'ID CARD' },
          { id: 'missions', icon: Zap, label: 'MISSIONS' },
          { id: 'vouchers', icon: Gift, label: 'PERKS' },
          { id: 'profile', icon: User, label: 'SYNC' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${isActive ? 'bg-[#ffde59] border-x-[2px] border-black' : 'opacity-30 hover:opacity-60'}`}
            >
              <tab.icon size={22} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-black' : 'text-black'} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'scale-110' : ''}`}>{tab.label}</span>
              {isActive && <div className="absolute bottom-0 w-8 h-1 bg-black"></div>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
