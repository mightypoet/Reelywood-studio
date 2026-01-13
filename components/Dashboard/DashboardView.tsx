
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
  Check,
  ChevronDown,
  ChevronUp
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

const FlashRevealTimer: React.FC<{ revealedAt: string; onTimeout: () => void }> = ({ revealedAt, onTimeout }) => {
  const [displayTime, setDisplayTime] = useState('');
  
  useEffect(() => {
    const calculate = () => {
      const start = new Date(revealedAt).getTime();
      const now = new Date().getTime();
      const elapsed = now - start;
      const limit = 15 * 60 * 1000;
      
      if (elapsed >= limit) {
        onTimeout();
        return;
      }
      
      const remaining = limit - elapsed;
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setDisplayTime(`VALID: ${minutes}m ${seconds}s`);
    };
    
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [revealedAt, onTimeout]);

  return (
    <div className="bg-emerald-500 text-white border-[2px] border-black px-3 py-1 font-black text-[8px] uppercase tracking-widest animate-pulse shadow-[2px_2px_0px_0px_#000]">
      {displayTime}
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
  const [revealedData, setRevealedData] = useState<Record<string, { code: string; revealed_at: string }>>({});
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [pendingRedeem, setPendingRedeem] = useState<any>(null);
  const [urgentAlert, setUrgentAlert] = useState<any>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

  const fetchOperationalGrid = async (user: FirebaseUser, isInitial = false) => {
    if (!supabase) return;
    try {
      const { data: profileData, error: pError } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single();
      if (pError && pError.code !== 'PGRST116') throw pError;
      setProfile(profileData);

      const { data: allMissions } = await supabase.from('missions').select('*, partner_brands(*)');
      if (allMissions) {
        const filtered = allMissions.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          const isGlobal = !m.assigned_to || m.assigned_to.length === 0;
          const isAssigned = m.assigned_to?.includes(user.uid) || m.assigned_to?.includes(profileData?.id);
          return isGlobal || isAssigned;
        });
        setMissions(filtered);
      }

      const [rRes, sRes, nRes, uvRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('*').eq('user_id', user.uid),
        isInitial ? supabase.from('notifications').select('*').eq('user_id', user.uid).eq('is_read', false).in('type', ['MISSION_DEPLOYED', 'VOUCHER_ADDED']).order('created_at', { ascending: false }).limit(1) : Promise.resolve({ data: null }),
        supabase.from('user_vouchers').select('voucher_id, revealed_at, voucher_code').eq('user_uid', user.uid)
      ]);

      if (rRes.data) setRewards(rRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);
      if (nRes.data && nRes.data.length > 0) setUrgentAlert(nRes.data[0]);

      if (uvRes.data) {
        const rev: Record<string, { code: string; revealed_at: string }> = {};
        uvRes.data.forEach(uv => {
          rev[uv.voucher_id] = { code: uv.voucher_code, revealed_at: uv.revealed_at };
        });
        setRevealedData(rev);
      }
    } catch (err) { console.error("GRID_SYNC_FAILURE:", err); }
    finally { if (isInitial) setLoading(false); }
  };

  useEffect(() => {
    let pollInterval: number;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchOperationalGrid(user, true);
        pollInterval = window.setInterval(() => fetchOperationalGrid(user, false), 8000);
      } else { setLoading(false); }
    });
    return () => { unsubscribe(); if (pollInterval) clearInterval(pollInterval); };
  }, []);

  const handleRedeemClick = (reward: any) => {
    if (revealedData[reward.id]) return;
    if (reward.expires_at && new Date(reward.expires_at).getTime() < new Date().getTime()) return;
    if (!profile || profile.reelcoins < reward.cost) return alert("⛔ INSUFFICIENT RC BAL: " + reward.cost + " required.");
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
      // 1. Transaction to deduct RC and create reveal timestamp
      const { data, error } = await supabase!.rpc('redeem_voucher_flash', {
        user_uid_param: currentUser.uid,
        voucher_id_param: pendingRedeem.id,
        cost_param: pendingRedeem.cost,
        code_param: pendingRedeem.code
      });
      if (error) throw error;
      await fetchOperationalGrid(currentUser);
      setPendingRedeem(null);
    } catch (err: any) { alert("Redemption Protocol Failure: " + err.message); }
    finally { setIsProcessing(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8 p-6">
      <Loader2 className="animate-spin text-[#834bf1]" size={48} strokeWidth={4} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black animate-pulse text-center">Neural Link Active...</p>
    </div>
  );

  if (!currentUser) return (
    <div className="min-h-[100svh] bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10 max-w-md w-full space-y-8">
         <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-[#834bf1] border-[3px] border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
              <Fingerprint className="text-white" size={24} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black italic uppercase font-display">Hub Access</h1>
         </div>
         <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-white border-[3px] border-black py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_#834bf1] active:scale-95 transition-all flex items-center justify-center gap-3">Sign in with Google</button>
         <button onClick={onBack} className="w-full text-[9px] font-black uppercase text-black/30 hover:text-black">Exit Terminal</button>
      </div>
    </div>
  );

  const isApproved = profile?.card_status === 'approved';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {selectedMission && <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser); }} />}
      <NewAlertModal notification={urgentAlert} onClose={async () => { if (urgentAlert && supabase) await supabase.from('notifications').update({ is_read: true }).eq('id', urgentAlert.id); setUrgentAlert(null); }} />
      <RedeemConfirmationModal isOpen={!!pendingRedeem} onClose={() => setPendingRedeem(null)} onConfirm={executeRedemption} reward={pendingRedeem} isProcessing={!!isProcessing} />

      <header className="border-b-[4px] border-black bg-white sticky top-0 z-[50] px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[2.5px] border-black shadow-[2px_2px_0px_0px_#000] bg-white active:scale-90 transition-all"><ArrowLeft size={18} strokeWidth={4} /></button>
            <h1 className="text-lg md:text-3xl font-black uppercase italic font-display">Hub <span className="text-[#834bf1]">Alpha</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell userId={currentUser.uid} />
            <button onClick={() => auth.signOut()} className="bg-black text-white p-2 border-[2.5px] border-white active:scale-90"><LogOut size={18} strokeWidth={3} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-[4px] border-black p-8 shadow-[6px_6px_0px_0px_#000] relative overflow-hidden text-center">
               <div className="w-24 h-24 border-[4px] border-black mx-auto mb-4 overflow-hidden shadow-[4px_4px_0px_0px_#834bf1]">
                  <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.uid}`} className="w-full h-full object-cover" />
               </div>
               <h2 className="text-2xl font-black uppercase italic font-display truncate">{profile?.display_name || "Agent"}</h2>
               <p className="text-[#834bf1] font-black text-[10px] uppercase tracking-[0.2em] italic">@{profile?.handle || "unlinked"}</p>
            </div>
            <div className="bg-[#834bf1] border-[4px] border-black p-8 shadow-[6px_6px_0px_0px_#000] text-white">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Credits</span>
               <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl font-black italic font-display tracking-tighter">{profile?.reelcoins?.toLocaleString() || "0"}</span>
                  <span className="text-xl font-black text-[#ffde59]">RC</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex border-[4px] border-black bg-white p-1 shadow-[6px_6px_0px_0px_#000]">
              <button onClick={() => setActiveTab('missions')} className={`flex-1 py-4 font-black uppercase text-xs italic tracking-widest transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-2 border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Missions</button>
              <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-4 font-black uppercase text-xs italic tracking-widest transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-2 border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Vouchers</button>
            </div>

            {isApproved ? (
              <div className="space-y-6">
                {activeTab === 'missions' ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {missions.map((m) => {
                      const submission = userSubmissions.find(s => s.mission_id === m.id);
                      const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                      const isPending = submission?.status === 'pending' || submission?.status === 'verifying';
                      const isExpired = m.expires_at && new Date(m.expires_at).getTime() < new Date().getTime();
                      return (
                        <div key={m.id} className={`bg-white border-[4px] border-black p-8 shadow-[6px_6px_0px_0px_#000] flex flex-col relative ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
                           {isExpired && <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"><div className="bg-rose-600 text-white font-black text-2xl px-6 py-2 border-4 border-black rotate-[-12deg] shadow-[4px_4px_0px_0px_#000]">EXPIRED</div></div>}
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center p-2 shadow-[2px_2px_0px_0px_#000]">{m.partner_brands?.logo_url ? <img src={m.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Building2 size={24} />}</div>
                              <div className="flex flex-col items-end gap-2">
                                <div className={`px-2 py-1 font-black text-[9px] border-2 border-black ${isDone ? 'bg-emerald-500 text-white' : isPending ? 'bg-yellow-400 text-black' : 'bg-black text-[#ffde59]'}`}>{isDone ? 'DONE' : isPending ? 'VERIFY' : `+${m.reward_amount} RC`}</div>
                                <CountdownTimer expiresAt={m.expires_at} />
                              </div>
                           </div>
                           <h3 className="text-xl font-black uppercase italic font-display mb-4 truncate">{m.title}</h3>
                           <button onClick={() => setSelectedMission(m)} disabled={isDone || isPending || isExpired} className="w-full py-4 border-[3px] border-black bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#834bf1] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
                              {isDone ? 'COMPLETED' : isPending ? 'REVIEWING' : 'INIT MISSION'}
                           </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {rewards.map((r) => {
                      const data = revealedData[r.id];
                      const isExpired = r.expires_at && new Date(r.expires_at).getTime() < new Date().getTime();
                      
                      // Calculate 15-minute timeout
                      let isTimedOut = false;
                      let isRecentlyRevealed = false;
                      if (data?.revealed_at) {
                        const elapsed = new Date().getTime() - new Date(data.revealed_at).getTime();
                        isTimedOut = elapsed > 15 * 60 * 1000;
                        isRecentlyRevealed = !isTimedOut;
                      }

                      return (
                        <div key={r.id} className={`bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden ${ (isExpired || isTimedOut) ? 'opacity-50 grayscale' : isRecentlyRevealed ? 'border-emerald-500 bg-emerald-50/20' : ''}`}>
                           
                           {/* Stamping Logic */}
                           {isExpired ? (
                             <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                               <div className="bg-rose-600 text-white font-black text-3xl px-10 py-4 border-[6px] border-black rotate-[-12deg] shadow-[6px_6px_0px_0px_#000]">EXPIRED</div>
                             </div>
                           ) : isTimedOut ? (
                             <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                               <div className="bg-black text-[#ffde59] font-black text-3xl px-10 py-4 border-[6px] border-white rotate-[12deg] shadow-[6px_6px_0px_0px_#000]">USED</div>
                             </div>
                           ) : null}

                           <div className="flex items-center gap-6 w-full md:flex-1">
                              <div className="w-20 h-20 bg-white border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] p-2">
                                 {r.partner_brands?.logo_url ? <img src={r.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Gift size={32} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <h4 className="text-2xl font-black uppercase italic font-display truncate">{r.title}</h4>
                                 <div className="flex flex-wrap items-center gap-3 mt-1">
                                   <p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest">{r.partner_brands?.name || 'Reelywood'}</p>
                                   {!data && <CountdownTimer expiresAt={r.expires_at} />}
                                   {isRecentlyRevealed && <FlashRevealTimer revealedAt={data.revealed_at} onTimeout={() => fetchOperationalGrid(currentUser)} />}
                                 </div>
                                 <div className="mt-4">
                                   <p className={`text-[10px] font-bold uppercase text-black/50 leading-relaxed ${expandedDesc === r.id ? '' : 'line-clamp-1'}`}>{r.description}</p>
                                   {r.description?.length > 50 && (
                                     <button onClick={() => setExpandedDesc(expandedDesc === r.id ? null : r.id)} className="text-[8px] font-black uppercase text-[#834bf1] mt-1 flex items-center gap-1">
                                       {expandedDesc === r.id ? <><ChevronUp size={10}/> Hide</> : <><ChevronDown size={10}/> Full Details</>}
                                     </button>
                                   )}
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-black/5">
                              {isRecentlyRevealed ? (
                                <div className="flex flex-col items-end gap-2 w-full">
                                   <div className="flex items-center gap-2 w-full md:w-auto">
                                      <div className="flex-1 md:flex-none bg-white border-[3px] border-black border-dashed px-5 py-3 font-mono font-black text-sm shadow-[3px_3px_0px_0px_#10b981]">
                                         {data.code}
                                      </div>
                                      <button onClick={() => handleCopyCode(data.code, r.id)} className="p-3.5 border-[3px] border-black bg-black text-white active:scale-90 transition-all">
                                        {copyStatus === r.id ? <Check size={20} className="text-[#39ff14]"/> : <Copy size={20}/>}
                                      </button>
                                   </div>
                                   <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Active Reveal Mode</p>
                                </div>
                              ) : (
                                <>
                                  <div className="text-right">
                                     <span className="text-3xl font-black italic font-display text-[#834bf1]">{r.cost}</span>
                                     <span className="text-[10px] font-black ml-1 uppercase opacity-40">RC</span>
                                  </div>
                                  <button onClick={() => handleRedeemClick(r)} disabled={isProcessing === r.id || isExpired || isTimedOut} className="px-10 py-4 border-[3px] border-black bg-black text-white font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#ffde59] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
                                    {isProcessing === r.id ? <Loader2 className="animate-spin h-4 w-4" /> : (isExpired || isTimedOut) ? 'TERMINATED' : 'REDEEM'}
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
              <div className="bg-[#ffde59] border-[4px] border-black p-12 text-center shadow-[12px_12px_0px_0px_#000] flex flex-col items-center gap-4">
                <Lock size={48} className="text-black/30" />
                <h3 className="text-3xl font-black italic uppercase font-display">Hub Encrypted</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-black/60 max-w-sm">Verification node sync required for authorization.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
