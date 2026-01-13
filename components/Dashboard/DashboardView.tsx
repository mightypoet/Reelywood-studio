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
  AlertOctagon
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { RedeemConfirmationModal } from './RedeemConfirmationModal';
import { NotificationBell } from './NotificationBell';
import { NewAlertModal } from './NewAlertModal';
import { CountdownTimer } from './CountdownTimer';

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
  
  const [pendingRedeem, setPendingRedeem] = useState<any>(null);
  const [urgentAlert, setUrgentAlert] = useState<any>(null);

  const fetchOperationalGrid = async (user: FirebaseUser, isInitial = false) => {
    if (!supabase) return;
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single();
      setProfile(profileData);

      const [mRes, rRes, sRes, txRes] = await Promise.all([
        supabase.from('missions').select('*, partner_brands(*)'),
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('*').eq('user_id', user.uid),
        supabase.from('transactions').select('*').eq('user_uid', user.uid).filter('description', 'ilike', '%voucher%')
      ]);

      if (mRes.data) {
        setMissions(mRes.data.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          return !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(user.uid);
        }));
      }
      if (rRes.data) setRewards(rRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);

      if (txRes.data && rRes.data) {
        const revealed: Record<string, string> = {};
        txRes.data.forEach((tx: any) => {
          const reward = rRes.data?.find(r => tx.description.includes(r.title));
          if (reward) revealed[reward.id] = reward.code || 'ACTIVE_DECRYPTED';
        });
        setRevealedCodes(prev => ({ ...prev, ...revealed }));
      }
    } catch (err) { console.error(err); } finally { if (isInitial) setLoading(false); }
  };

  useEffect(() => {
    // Fixed: onAuthStateChanged is correctly imported from firebase/auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setCurrentUser(user); fetchOperationalGrid(user, true); } 
      else { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const handleRedeemClick = (reward: any) => {
    const isExpired = reward.expires_at && new Date(reward.expires_at) < new Date();
    if (isExpired || revealedCodes[reward.id]) return; 
    
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
      const { data, error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: pendingRedeem.cost,
        item_title: pendingRedeem.title
      });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.message);
      
      setRevealedCodes(prev => ({ ...prev, [pendingRedeem.id]: pendingRedeem.code || 'DECRYPTED' }));
      fetchOperationalGrid(currentUser);
      setPendingRedeem(null);
    } catch (err: any) { alert("Redemption Failed: " + err.message); } finally { setIsProcessing(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
      <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black">Establishing Neural Link...</p>
    </div>
  );

  const isApproved = profile?.card_status === 'approved';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {selectedMission && (
        <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />
      )}
      <NewAlertModal notification={urgentAlert} onClose={() => setUrgentAlert(null)} />
      <RedeemConfirmationModal isOpen={!!pendingRedeem} onClose={() => setPendingRedeem(null)} onConfirm={executeRedemption} reward={pendingRedeem} isProcessing={!!isProcessing} />

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[50] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[3px] border-black shadow-[3px_3px_0px_0px_#000] bg-white hover:bg-[#ffde59] transition-all"><ArrowLeft size={20} strokeWidth={4} /></button>
            <h1 className="text-xl md:text-3xl font-black uppercase italic font-display">Creator <span className="text-[#834bf1]">Hub</span></h1>
          </div>
          <div className="flex items-center space-x-6">
            <NotificationBell userId={currentUser?.uid || ''} />
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Identity Node</span>
               <span className="text-xs font-bold uppercase">{currentUser?.email}</span>
            </div>
            <button onClick={() => auth.signOut()} className="bg-black text-white p-2 border-[3px] border-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"><LogOut size={20} strokeWidth={3} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] text-white">
               <div className="flex items-center gap-3 mb-6 opacity-60"><Wallet size={18} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Liquid Assets</span></div>
               <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-black italic font-display tracking-tighter">{profile?.reelcoins?.toLocaleString() || "0"}</span>
                  <span className="text-2xl font-black text-[#ffde59]">RC</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex border-[6px] border-black bg-white p-2 shadow-[10px_10px_0px_0px_#000]">
              <button onClick={() => setActiveTab('missions')} className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Mission Grid</button>
              <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Reward Node</button>
            </div>

            {isApproved && (
              <div className="space-y-8">
                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {missions.map((m) => {
                        const sub = userSubmissions.find(s => s.mission_id === m.id);
                        const isDone = sub?.status === 'approved' || sub?.status === 'completed';
                        const isPending = sub?.status === 'pending' || sub?.status === 'verifying';
                        const isExpired = m.expires_at && new Date(m.expires_at) < new Date();

                        return (
                          <div key={m.id} className={`border-[4px] p-8 shadow-[8px_8px_0px_0px] relative transition-all group ${isExpired && !isDone ? 'opacity-50 grayscale' : 'bg-white border-black shadow-black'}`}>
                             {isExpired && !isDone && (
                               <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                  <div className="bg-rose-600 text-white border-4 border-black px-8 py-3 font-black text-4xl uppercase -rotate-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">EXPIRED</div>
                               </div>
                             )}
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
                                   {m.partner_brands?.logo_url ? <img src={m.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Building2 size={24}/>}
                                </div>
                                <CountdownTimer expiry={isDone ? null : m.expires_at} />
                             </div>
                             <h3 className="text-xl font-black uppercase italic font-display mb-8">{m.title}</h3>
                             <button 
                                onClick={() => setSelectedMission(m)} 
                                disabled={isDone || isPending || (isExpired && !isDone)}
                                className="w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-widest border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] disabled:opacity-30 disabled:cursor-not-allowed"
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
                      const isExpired = r.expires_at && new Date(r.expires_at) < new Date();
                      
                      return (
                        <div key={r.id} className={`bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-8 relative transition-all ${isExpired && !isRedeemed ? 'opacity-50 grayscale' : isRedeemed ? 'bg-emerald-50/30 border-emerald-500' : 'hover:shadow-[12px_12px_0px_0px_#ffde59]'}`}>
                           {isExpired && !isRedeemed && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                <div className="bg-rose-600 text-white border-4 border-black px-12 py-4 font-black text-5xl uppercase -rotate-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">EXPIRED</div>
                              </div>
                           )}
                           
                           <div className="flex items-center gap-8 flex-1">
                              <div className="relative">
                                <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] p-2">
                                  {r.partner_brands?.logo_url ? <img src={r.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Gift size={28} className="text-[#ffde59]" />}
                                </div>
                                {isRedeemed && (
                                  <div className="absolute -top-3 -left-3 bg-emerald-500 text-white border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rotate-[-12deg] shadow-[2px_2px_0px_0px_#000]">REDEEMED</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                 <h4 className="text-2xl font-black uppercase italic font-display truncate">{r.title}</h4>
                                 <p className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.3em]">{r.partner_brands?.name || 'Reelywood'}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 shrink-0">
                              {!isRedeemed && !isExpired && <CountdownTimer expiry={r.expires_at} />}
                              
                              {isRedeemed ? (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
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
                              ) : (
                                <button 
                                  onClick={() => handleRedeemClick(r)} 
                                  disabled={isProcessing === r.id || isExpired}
                                  className="px-8 py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.4em] border-[3px] border-black shadow-[5px_5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                  {isProcessing === r.id ? <Loader2 className="animate-spin" /> : 'EXECUTE REDEEM'}
                                </button>
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