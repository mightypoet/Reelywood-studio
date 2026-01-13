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
  
  // Custom Modal State
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

      // Restore revealed codes from transaction history
      if (txRes.data) {
        const revealed: Record<string, string> = {};
        txRes.data.forEach((tx: any) => {
          // If we can match the transaction description to a voucher title
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
    if (revealedCodes[reward.id]) return; // Interaction Lock
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
              <h1 className="text-3xl font-black italic uppercase font-display">Hub Access Required</h1>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Verify identity node to continue</p>
           </div>
           <button 
             onClick={() => signInWithPopup(auth, googleProvider)}
             className="w-full bg-white border-[4px] border-black py-5 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
           >
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
             <span>Continue with Google</span>
           </button>
           <button onClick={onBack} className="w-full text-[10px] font-black uppercase text-black/30 hover:text-black">Return to Studio</button>
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

      <NewAlertModal 
        notification={urgentAlert} 
        onClose={dismissUrgentAlert} 
      />

      <RedeemConfirmationModal 
        isOpen={!!pendingRedeem}
        onClose={() => setPendingRedeem(null)}
        onConfirm={executeRedemption}
        reward={pendingRedeem}
        isProcessing={!!isProcessing}
      />

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[50] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-[#ffde59] transition-all">
              <ArrowLeft size={20} strokeWidth={4} />
            </button>
            <h1 className="text-xl md:text-3xl font-black uppercase italic font-display">Creator <span className="text-[#834bf1]">Hub</span></h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <NotificationBell userId={currentUser.uid} />

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
               <div className="absolute top-4 right-4 bg-[#ffde59] border-[3px] border-black px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#000]">
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
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex border-[6px] border-black bg-white p-2 shadow-[10px_10px_0px_0px_#000]">
              <button 
                onClick={() => setActiveTab('missions')} 
                className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100'}`}
              >
                Mission Grid
              </button>
              <button 
                onClick={() => setActiveTab('rewards')} 
                className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100'}`}
              >
                Reward Node
              </button>
            </div>

            {isApproved && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {missions.map((m) => {
                        const submission = userSubmissions.find(s => s.mission_id === m.id);
                        const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                        const isPending = submission?.status === 'pending' || submission?.status === 'verifying' || submission?.status === 'review';
                        const isRejected = submission?.status === 'rejected';
                        const brand = m.partner_brands;

                        const cardStyles = isDone 
                          ? 'bg-emerald-50 border-emerald-400 shadow-emerald-200' 
                          : isPending 
                            ? 'bg-yellow-50 border-yellow-400 shadow-yellow-200' 
                            : isRejected
                              ? 'bg-rose-50 border-rose-400 shadow-rose-200'
                              : 'bg-white border-black shadow-black';

                        return (
                          <div key={m.id} className={`border-[4px] p-8 shadow-[8px_8px_0px_0px] group hover:-translate-y-1 transition-all flex flex-col ${cardStyles}`}>
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center p-2 shadow-[3px_3px_0px_0px_#000]">
                                   {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Building2 size={24} className="text-[#834bf1]" />}
                                </div>
                                <div className={`px-3 py-1 font-black text-[10px] italic border-[2px] flex items-center gap-1.5 ${isDone ? 'bg-emerald-500 text-white' : isPending ? 'bg-yellow-400 text-black' : isRejected ? 'bg-rose-500 text-white' : 'bg-black text-[#ffde59]'}`}>
                                  {isDone ? 'COMPLETED' : isPending ? 'VERIFYING' : isRejected ? 'REJECTED' : `+${m.reward_amount} RC`}
                                </div>
                             </div>
                             <h3 className="text-xl font-black uppercase italic font-display leading-tight mb-8">{m.title}</h3>
                             <button 
                                onClick={() => setSelectedMission(m)}
                                disabled={isDone || isPending}
                                className="w-full py-4 border-[3px] border-black bg-black text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#834bf1] disabled:opacity-50"
                              >
                                {isDone ? 'PROTOCOL FINALIZED' : isPending ? 'REVIEW IN PROGRESS' : 'INITIALIZE MISSION'}
                              </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {rewards.map((r) => {
                      const isRedeemed = !!revealedCodes[r.id];
                      const brand = r.partner_brands;
                      
                      return (
                        <div key={r.id} className={`bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${isRedeemed ? 'opacity-90 border-emerald-500 bg-emerald-50/30' : 'hover:shadow-[12px_12px_0px_0px_#ffde59]'}`}>
                           <div className="flex items-center gap-8 flex-1">
                              <div className="relative">
                                <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] overflow-hidden p-2">
                                  {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" /> : <Gift size={28} className="text-[#ffde59]" strokeWidth={3} />}
                                </div>
                                {isRedeemed && (
                                  <div className="absolute -top-3 -left-3 bg-emerald-500 text-white border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] rotate-[-12deg]">REDEEMED</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-2xl font-black uppercase italic font-display truncate">{r.title}</h4>
                                 <p className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.3em]">{brand?.name || 'Reelywood'}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-8 shrink-0">
                              {isRedeemed ? (
                                <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                                   <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1">
                                     <CheckCircle2 size={12}/> VOUCHER ACTIVE
                                   </p>
                                   <div className="flex items-center gap-2">
                                      <div className="bg-white border-[3px] border-black border-dashed px-6 py-3 font-mono font-black text-sm shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]">
                                         {revealedCodes[r.id]}
                                      </div>
                                      <button 
                                        onClick={() => handleCopyCode(revealedCodes[r.id], r.id)}
                                        className="p-3 border-[3px] border-black bg-black text-white hover:bg-emerald-600 transition-colors"
                                      >
                                        {copyStatus === r.id ? <Check size={18} className="text-[#39ff14]"/> : <Copy size={18}/>}
                                      </button>
                                   </div>
                                </div>
                              ) : (
                                <>
                                  <div className="text-right">
                                     <span className="text-3xl font-black italic font-display text-[#834bf1]">{r.cost}</span>
                                     <span className="text-xs font-black ml-2 uppercase italic opacity-40">RC</span>
                                  </div>
                                  <button 
                                    onClick={() => handleRedeemClick(r)}
                                    disabled={isProcessing === r.id}
                                    className="px-8 py-4 border-[3px] border-black bg-black text-white font-black uppercase text-[10px] tracking-[0.4em] shadow-[5px_5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                                  >
                                    {isProcessing === r.id ? <Loader2 className="animate-spin" /> : 'EXECUTE REDEEM'}
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
};