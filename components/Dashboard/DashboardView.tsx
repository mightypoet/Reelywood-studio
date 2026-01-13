
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, 
  User, 
  Wallet, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Lock,
  X,
  Bell,
  Fingerprint,
  Clock,
  Zap,
  Sparkles,
  Gift,
  Target,
  Info,
  MapPin,
  TrendingUp,
  Maximize2,
  RefreshCw,
  Building2,
  Link as LinkIcon,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { RedeemConfirmationModal } from './RedeemConfirmationModal';
import { NotificationBell } from './NotificationBell';
import { NewAlertModal } from './NewAlertModal';

interface DashboardViewProps {
  onBack: () => void;
}

const CountdownTimer: React.FC<{ expiresAt: string | null }> = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculate = () => {
      const target = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setIsExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setIsUrgent(diff < 24 * 60 * 60 * 1000);
      setTimeLeft(`⏳ ${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m`);
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return null;

  return (
    <div className={`px-2 py-0.5 border-[1.5px] border-black text-[7px] font-black uppercase tracking-widest bg-white shadow-[2px_2px_0px_0px_#000] ${isExpired ? 'text-rose-600' : isUrgent ? 'text-rose-600 animate-pulse' : 'text-black'}`}>
      {timeLeft}
    </div>
  );
};

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
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  const [pendingRedeem, setPendingRedeem] = useState<any>(null);
  const [urgentAlert, setUrgentAlert] = useState<any>(null);

  const fetchOperationalGrid = async (user: FirebaseUser, isInitial = false) => {
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
          const isGlobal = !m.assigned_to || m.assigned_to.length === 0;
          const isAssigned = m.assigned_to?.includes(user.uid) || m.assigned_to?.includes(profileData?.id);
          return isGlobal || isAssigned;
        });
        setMissions(filtered);
      }

      const [rRes, sRes, nRes, txRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('*').eq('user_id', user.uid),
        isInitial ? supabase.from('notifications')
          .select('*')
          .eq('user_id', user.uid)
          .eq('is_read', false)
          .in('type', ['MISSION_DEPLOYED', 'VOUCHER_ADDED'])
          .order('created_at', { ascending: false })
          .limit(1) : Promise.resolve({ data: null }),
        supabase.from('transactions').select('*').eq('user_uid', user.uid).filter('description', 'ilike', '%voucher%')
      ]);

      if (rRes.data) setRewards(rRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);
      if (nRes.data && nRes.data.length > 0) {
        setUrgentAlert(nRes.data[0]);
      }

      if (txRes.data) {
        const revealed: Record<string, string> = {};
        txRes.data.forEach((tx: any) => {
          const reward = rRes.data?.find(r => tx.description.includes(r.title));
          if (reward) revealed[reward.id] = reward.code || 'ACTIVE_DECRYPTED';
        });
        setRevealedCodes(prev => ({ ...prev, ...revealed }));
      }

    } catch (err) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    let pollInterval: number;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchOperationalGrid(user, true);
        pollInterval = window.setInterval(() => {
          fetchOperationalGrid(user, false);
        }, 8000);
      } else {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const handleRedeemClick = (reward: any) => {
    if (revealedCodes[reward.id]) return;
    if (reward.expires_at && new Date(reward.expires_at).getTime() < new Date().getTime()) return;
    if (!profile || profile.reelcoins < reward.cost) {
      return alert("⛔ INSUFFICIENT RC BAL: " + reward.cost + " required.");
    }
    setPendingRedeem(reward);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const executeRedemption = async () => {
    if (!pendingRedeem || !currentUser) return;
    setIsProcessing(pendingRedeem.id);
    try {
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: pendingRedeem.cost,
        item_title: pendingRedeem.title
      });
      if (error) throw error;
      setRevealedCodes(prev => ({ ...prev, [pendingRedeem.id]: pendingRedeem.code || 'DECRYPTED_HASH' }));
      fetchOperationalGrid(currentUser);
      setPendingRedeem(null);
    } catch (err: any) {
      alert("Redemption Protocol Failure: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const dismissUrgentAlert = async () => {
    if (urgentAlert && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', urgentAlert.id);
    }
    setUrgentAlert(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8 p-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={48} strokeWidth={4} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black animate-pulse text-center">Neural Link Active...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[100svh] bg-[#f0f0f0] flex items-center justify-center p-4">
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10 max-w-md w-full space-y-8">
           <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-[#834bf1] border-[3px] border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <Fingerprint className="text-white" size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black italic uppercase font-display">Hub Access</h1>
              <p className="text-[9px] font-black uppercase text-black/40 tracking-widest">Verify identity node</p>
           </div>
           <button 
             onClick={() => signInWithPopup(auth, googleProvider)}
             className="w-full bg-white border-[3px] border-black py-4 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#834bf1] active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
             <span>Sign in</span>
           </button>
           <button onClick={onBack} className="w-full text-[9px] font-black uppercase text-black/30 hover:text-black">Exit Terminal</button>
        </div>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {selectedMission && (
        <MissionModal 
          mission={selectedMission} 
          user={currentUser} 
          onClose={() => {
            setSelectedMission(null);
            fetchOperationalGrid(currentUser);
          }} 
        />
      )}

      <NewAlertModal notification={urgentAlert} onClose={dismissUrgentAlert} />

      <RedeemConfirmationModal 
        isOpen={!!pendingRedeem}
        onClose={() => setPendingRedeem(null)}
        onConfirm={executeRedemption}
        reward={pendingRedeem}
        isProcessing={!!isProcessing}
      />

      <header className="border-b-[4px] md:border-b-[6px] border-black bg-white sticky top-0 z-[50] px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-6">
            <button onClick={onBack} className="p-2 border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000] bg-white active:scale-90 transition-all">
              <ArrowLeft size={18} strokeWidth={4} />
            </button>
            <h1 className="text-lg md:text-3xl font-black uppercase italic font-display">Hub <span className="text-[#834bf1]">Alpha</span></h1>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            <NotificationBell userId={currentUser.uid} />
            <button onClick={() => auth.signOut()} className="bg-black text-white p-2 border-[2.5px] border-white shadow-[2px_2px_0px_0px_#000] active:scale-90 transition-all">
              <LogOut size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          
          {/* STATS PANEL */}
          <div className="lg:col-span-4 space-y-6 md:space-y-12">
            <div className="bg-white border-[4px] border-black p-6 md:p-10 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden group">
               <div className="absolute top-3 right-3 bg-[#ffde59] border-[2px] border-black px-2 py-0.5 font-black text-[8px] uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                  {isApproved ? 'VERIFIED' : 'SYNCING'}
               </div>
               <div className="w-20 h-20 md:w-32 md:h-32 border-[4px] border-black mx-auto mb-4 bg-slate-100 overflow-hidden shadow-[4px_4px_0px_0px_#834bf1]">
                  <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.uid}`} alt="Agent" className="w-full h-full object-cover" />
               </div>
               <div className="text-center space-y-1">
                  <h2 className="text-xl md:text-3xl font-black uppercase italic font-display truncate">{profile?.display_name || "Agent " + currentUser.uid.slice(0,4)}</h2>
                  <p className="text-[#834bf1] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] italic">@{profile?.handle || "unlinked"}</p>
               </div>
            </div>

            <div className="bg-[#834bf1] border-[4px] border-black p-6 md:p-10 shadow-[6px_6px_0px_0px_#000] text-white">
               <div className="flex items-center gap-2 mb-4 opacity-60">
                  <Wallet size={16} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Credits</span>
               </div>
               <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-7xl font-black italic font-display tracking-tighter">{profile?.reelcoins?.toLocaleString() || "0"}</span>
                  <span className="text-lg md:text-2xl font-black text-[#ffde59]">RC</span>
               </div>
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div className="lg:col-span-8 space-y-6 md:space-y-10">
            <div className="flex border-[4px] md:border-[6px] border-black bg-white p-1 md:p-2 shadow-[6px_6px_0px_0px_#000]">
              <button 
                onClick={() => setActiveTab('missions')} 
                className={`flex-1 py-3 md:py-5 font-black uppercase text-[10px] md:text-sm italic tracking-[0.1em] md:tracking-[0.2em] transition-all active:scale-95 ${activeTab === 'missions' ? 'bg-[#ffde59] border-[2px] md:border-[4px] border-black shadow-[2px_2px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100'}`}
              >
                Missions
              </button>
              <button 
                onClick={() => setActiveTab('rewards')} 
                className={`flex-1 py-3 md:py-5 font-black uppercase text-[10px] md:text-sm italic tracking-[0.1em] md:tracking-[0.2em] transition-all active:scale-95 ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[2px] md:border-[4px] border-black shadow-[2px_2px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100'}`}
              >
                Rewards
              </button>
            </div>

            {isApproved ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {missions.map((m) => {
                        const submission = userSubmissions.find(s => s.mission_id === m.id);
                        const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                        const isPending = submission?.status === 'pending' || submission?.status === 'verifying' || submission?.status === 'review';
                        const isRejected = submission?.status === 'rejected';
                        const brand = m.partner_brands;
                        const isExpired = m.expires_at && new Date(m.expires_at).getTime() < new Date().getTime();

                        const cardStyles = isDone 
                          ? 'bg-emerald-50 border-emerald-400 shadow-emerald-100' 
                          : isPending 
                            ? 'bg-yellow-50 border-yellow-400 shadow-yellow-100' 
                            : isRejected
                              ? 'bg-rose-50 border-rose-400 shadow-rose-100'
                              : 'bg-white border-black shadow-black';

                        return (
                          <div key={m.id} className={`border-[3px] md:border-[4px] p-5 md:p-8 shadow-[6px_6px_0px_0px] active:scale-[0.98] md:hover:-translate-y-1 transition-all flex flex-col relative ${cardStyles} ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
                             {isExpired && (
                               <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                  <div className="bg-rose-600 text-white font-black text-2xl px-6 py-2 border-4 border-black rotate-[-12deg] shadow-[4px_4px_0px_0px_#000]">EXPIRED</div>
                               </div>
                             )}
                             <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="w-10 h-10 md:w-14 md:h-14 bg-white border-[2px] md:border-[3px] border-black flex items-center justify-center p-1.5 md:p-2 shadow-[2px_2px_0px_0px_#000]">
                                   {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Building2 size={18} className="text-[#834bf1]" />}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className={`px-2 py-0.5 md:px-3 md:py-1 font-black text-[8px] md:text-[10px] italic border-[2px] flex items-center gap-1 ${isDone ? 'bg-emerald-500 text-white' : isPending ? 'bg-yellow-400 text-black' : isRejected ? 'bg-rose-500 text-white' : 'bg-black text-[#ffde59]'}`}>
                                    {isDone ? 'DONE' : isPending ? 'VERIFY' : isRejected ? 'FAIL' : `+${m.reward_amount} RC`}
                                  </div>
                                  <CountdownTimer expiresAt={m.expires_at} />
                                </div>
                             </div>
                             <h3 className="text-lg md:text-xl font-black uppercase italic font-display leading-tight mb-6 md:mb-8 truncate">{m.title}</h3>
                             <button 
                                onClick={() => setSelectedMission(m)}
                                disabled={isDone || isPending || isExpired}
                                className="w-full py-3 md:py-4 border-[2.5px] md:border-[3px] border-black bg-black text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#834bf1] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                              >
                                {isDone ? 'PROTOCOL FINALIZED' : isPending ? 'REVIEWING' : isExpired ? 'MISSION TERMINATED' : 'INIT MISSION'}
                              </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {rewards.map((r) => {
                      const isRedeemed = !!revealedCodes[r.id];
                      const brand = r.partner_brands;
                      const isExpired = r.expires_at && new Date(r.expires_at).getTime() < new Date().getTime();
                      
                      return (
                        <div key={r.id} className={`bg-white border-[4px] border-black p-5 md:p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 transition-all relative ${isRedeemed ? 'opacity-90 border-emerald-500 bg-emerald-50/30' : 'md:hover:shadow-[10px_10px_0px_0px_#ffde59] active:scale-[0.99]'} ${isExpired && !isRedeemed ? 'opacity-50 pointer-events-none' : ''}`}>
                           {isExpired && !isRedeemed && (
                               <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                  <div className="bg-rose-600 text-white font-black text-2xl px-6 py-2 border-4 border-black rotate-[-12deg] shadow-[4px_4px_0px_0px_#000]">EXPIRED</div>
                               </div>
                           )}
                           <div className="flex items-center gap-4 md:gap-8 w-full md:flex-1">
                              <div className="relative shrink-0">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-[3px] md:border-[4px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] overflow-hidden p-1.5">
                                  {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Gift size={20} className="text-[#ffde59]" strokeWidth={3} />}
                                </div>
                                {isRedeemed && (
                                  <div className="absolute -top-2 -left-2 bg-emerald-500 text-white border-2 border-black px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest shadow-[1px_1px_0px_0px_#000] rotate-[-12deg]">CLAIMED</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-lg md:text-2xl font-black uppercase italic font-display truncate">{r.title}</h4>
                                 <div className="flex items-center gap-3">
                                   <p className="text-[8px] md:text-[10px] font-black uppercase text-[#834bf1] tracking-[0.2em]">{brand?.name || 'Reelywood'}</p>
                                   {!isRedeemed && <CountdownTimer expiresAt={r.expires_at} />}
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto shrink-0 border-t md:border-t-0 border-black/5 pt-4 md:pt-0">
                              {isRedeemed ? (
                                <div className="flex flex-col items-end gap-1.5 animate-in fade-in slide-in-from-right-2 duration-500 w-full md:w-auto">
                                   <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1">
                                     <CheckCircle2 size={10}/> VOUCHER ACTIVE
                                   </p>
                                   <div className="flex items-center gap-2 w-full md:w-auto">
                                      <div className="flex-1 md:flex-none bg-white border-[2.5px] border-black border-dashed px-4 py-2 font-mono font-black text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(16,185,129,0.3)]">
                                         {revealedCodes[r.id]}
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(revealedCodes[r.id], r.id)}
                                        className="p-2.5 border-[2.5px] border-black bg-black text-white active:scale-90 transition-all"
                                      >
                                        {copyStatus === r.id ? <Check size={16} className="text-[#39ff14]"/> : <Copy size={16}/>}
                                      </button>
                                   </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-left md:text-right">
                                     <span className="text-2xl md:text-3xl font-black italic font-display text-[#834bf1]">{r.cost}</span>
                                     <span className="text-[10px] font-black ml-1 md:ml-2 uppercase italic opacity-40">RC</span>
                                  </div>
                                  <button 
                                    onClick={() => handleRedeemClick(r)}
                                    disabled={isProcessing === r.id || isExpired}
                                    className="px-6 py-3 md:px-8 md:py-4 border-[2.5px] md:border-[3px] border-black bg-black text-white font-black uppercase text-[8px] md:text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                                  >
                                    {isProcessing === r.id ? <Loader2 className="animate-spin h-3 w-3" /> : isExpired ? 'UNAVAILABLE' : 'REDEEM'}
                                  </button>
                                </>
                              )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#ffde59] border-[4px] border-black p-8 md:p-12 text-center shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center space-y-4">
                <Lock size={40} className="text-black/30" />
                <h3 className="text-xl md:text-2xl font-black text-black uppercase italic font-display">Hub Encrypted</h3>
                <p className="text-[10px] md:text-xs font-bold uppercase text-black/60 max-w-xs leading-relaxed">Identity node sync required for operation authorization.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
