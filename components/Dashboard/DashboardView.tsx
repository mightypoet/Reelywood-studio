
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, Fingerprint, Loader2, Lock, ArrowLeft,
  Bell, Zap, Gift, Copy, Check, ChevronDown, ChevronUp,
  Building2, ExternalLink
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { RedeemConfirmationModal } from './RedeemConfirmationModal';
import { NotificationBell } from './NotificationBell';
import { NewAlertModal } from './NewAlertModal';

interface DashboardViewProps {
  onBack: () => void;
}

// --- HELPER COMPONENTS ---

const CountdownTimer: React.FC<{ expiresAt: string | null }> = ({ expiresAt }) => {
  const [display, setDisplay] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setDisplay("EXPIRED");
      } else {
        const d = Math.floor(diff / (86400000));
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setDisplay(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m`);
      }
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!display) return null;
  return (
    <span className={`px-2 py-0.5 border-[1.5px] border-black text-[8px] font-black uppercase tracking-widest bg-white shadow-[2px_2px_0px_0px_#000] ${expired ? 'text-rose-600' : 'text-black'}`}>
      {expired ? 'EXPIRED' : `⏳ ${display}`}
    </span>
  );
};

// --- MAIN COMPONENT ---

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Data State
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]); 
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [revealedData, setRevealedData] = useState<Record<string, { code: string; revealed_at: string }>>({});
  
  // UI State
  const [activeTab, setActiveTab] = useState<'missions' | 'vouchers'>('missions');
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [pendingRedeem, setPendingRedeem] = useState<any>(null);
  const [urgentAlert, setUrgentAlert] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const fetchData = async (currentUser: FirebaseUser) => {
    if (!supabase) return;
    try {
      // 1. Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('firebase_uid', currentUser.uid).single();
      setProfile(profileData);

      // 2. Missions
      const { data: allMissions } = await supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false });
      if (allMissions) {
        const relevantMissions = allMissions.filter(m => {
          const assigned = m.assigned_to;
          const isGlobal = !assigned || assigned.length === 0 || (assigned.length === 1 && assigned[0] === 'DRAFT');
          const isAssignedToMe = Array.isArray(assigned) && assigned.includes(currentUser.uid);
          if (assigned && assigned.includes('DRAFT')) return false;
          return isGlobal || isAssignedToMe;
        });
        setMissions(relevantMissions);
      }

      // 3. Vouchers
      const { data: allVouchers } = await supabase.from('vouchers').select('*, partner_brands(*)').order('created_at', { ascending: false });
      if (allVouchers) {
        const relevantVouchers = allVouchers.filter(v => {
           const assigned = v.assigned_to;
           const isGlobal = !assigned || assigned.length === 0;
           const isAssignedToMe = Array.isArray(assigned) && assigned.includes(currentUser.uid);
           return isGlobal || isAssignedToMe;
        });
        setVouchers(relevantVouchers);
      }

      // 4. User Data (Submissions & Redeemed Vouchers)
      const { data: subs } = await supabase.from('submissions').select('*').eq('user_id', currentUser.uid);
      if (subs) setSubmissions(subs);

      const { data: revealed } = await supabase.from('user_vouchers').select('*').eq('user_uid', currentUser.uid);
      if (revealed) {
        const revMap: any = {};
        revealed.forEach((r: any) => {
          revMap[r.voucher_id] = { code: r.voucher_code, revealed_at: r.revealed_at };
        });
        setRevealedData(revMap);
      }

    } catch (e) {
      console.error("DATA_SYNC_ERROR", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchData(u);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleRedeem = async () => {
    if (!pendingRedeem || !user || !profile) return;
    setIsProcessing(pendingRedeem.id);
    
    try {
      if (profile.reelcoins < pendingRedeem.cost) throw new Error("Insufficient Balance");

      const { error: balError } = await supabase!.from('profiles').update({ reelcoins: profile.reelcoins - pendingRedeem.cost }).eq('id', profile.id);
      if (balError) throw balError;

      const { error: uvError } = await supabase!.from('user_vouchers').insert([{
        user_uid: user.uid,
        voucher_id: pendingRedeem.id,
        voucher_code: pendingRedeem.code,
        revealed_at: new Date().toISOString()
      }]);
      if (uvError) throw uvError;

      await supabase!.from('transactions').insert([{
         user_uid: user.uid,
         amount: -pendingRedeem.cost,
         type: 'redemption',
         description: `Redeemed: ${pendingRedeem.title}`
      }]);

      await fetchData(user);
      setPendingRedeem(null);
    } catch (e: any) {
      alert("Redemption Failed: " + e.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#834bf1]" size={40}/></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000] text-center max-w-sm w-full">
         <div className="w-16 h-16 bg-[#834bf1] border-[3px] border-black mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
            <Fingerprint className="text-white" size={32} />
         </div>
         <h1 className="text-3xl font-black uppercase italic font-display mb-8">Hub Access</h1>
         <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full py-4 bg-white border-[3px] border-black font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
           Sign in with Google
         </button>
      </div>
    </div>
  );

  const isApproved = profile?.card_status === 'approved';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black pb-20">
      {selectedMission && <MissionModal mission={selectedMission} user={user} onClose={() => { setSelectedMission(null); fetchData(user); }} />}
      <RedeemConfirmationModal isOpen={!!pendingRedeem} onClose={() => setPendingRedeem(null)} onConfirm={handleRedeem} reward={pendingRedeem} isProcessing={!!isProcessing} />

      <header className="sticky top-0 z-50 bg-white border-b-[4px] border-black px-4 py-3 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 border-2 border-black bg-white active:scale-95"><ArrowLeft size={18} strokeWidth={3}/></button>
          <h1 className="text-xl font-black uppercase italic font-display">Hub <span className="text-[#834bf1]">Alpha</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell userId={user.uid} />
          <img src={user.photoURL || ''} className="w-10 h-10 border-2 border-black object-cover bg-gray-200" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border-[4px] border-black p-8 text-center shadow-[8px_8px_0px_0px_#000]">
              <div className="w-24 h-24 border-[4px] border-black mx-auto mb-4 overflow-hidden shadow-[4px_4px_0px_0px_#834bf1]">
                <img src={user.photoURL || ''} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-black uppercase italic font-display truncate">{profile?.display_name}</h2>
              <div className={`mt-2 inline-block px-3 py-1 border-[2px] border-black text-[9px] font-black uppercase tracking-widest ${isApproved ? 'bg-emerald-400' : 'bg-yellow-400'}`}>
                {isApproved ? 'Verified Agent' : 'Pending Verification'}
              </div>
           </div>
           
           <div className="bg-[#834bf1] text-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_#000]">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Assets</div>
              <div className="text-6xl font-black italic font-display tracking-tighter">
                {profile?.reelcoins || 0} <span className="text-2xl text-[#ffde59]">RC</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="flex border-[4px] border-black bg-white p-1 shadow-[8px_8px_0px_0px_#000]">
             <button onClick={() => setActiveTab('missions')} className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-2 border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Missions</button>
             <button onClick={() => setActiveTab('vouchers')} className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'vouchers' ? 'bg-[#834bf1] text-white border-2 border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40'}`}>Vouchers</button>
          </div>

          {!isApproved ? (
            <div className="bg-yellow-400 border-[4px] border-black p-12 text-center shadow-[12px_12px_0px_0px_#000]">
               <Lock size={48} className="mx-auto mb-4 opacity-20"/>
               <h3 className="text-2xl font-black uppercase italic font-display">Hub Encrypted</h3>
               <p className="text-xs font-bold mt-2">Verification node sync required for authorization.</p>
            </div>
          ) : (
             <div className="space-y-6">
               {activeTab === 'missions' && (
                 missions.length === 0 ? <div className="p-12 text-center border-2 border-dashed border-black/10 font-black uppercase opacity-20">No active signals</div> :
                 missions.map(m => {
                   const sub = submissions.find(s => s.mission_id === m.id);
                   const status = sub?.status;
                   return (
                     <div key={m.id} className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000]">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 border-[3px] border-black p-1 flex items-center justify-center">
                                {m.partner_brands?.logo_url ? <img src={m.partner_brands.logo_url} className="w-full h-full object-contain"/> : <Building2 size={20}/>}
                             </div>
                             <div>
                                <h3 className="text-lg font-black uppercase italic leading-none">{m.title}</h3>
                                <p className="text-[9px] font-bold text-[#834bf1] uppercase tracking-widest mt-1">{m.partner_brands?.name}</p>
                             </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xl font-black italic">+{m.reward_amount} RC</div>
                              <CountdownTimer expiresAt={m.expires_at} />
                           </div>
                        </div>
                        <button onClick={() => setSelectedMission(m)} disabled={status === 'approved' || status === 'pending'} className={`w-full py-4 border-[3px] border-black font-black uppercase text-xs ${status === 'approved' ? 'bg-emerald-400' : status === 'pending' ? 'bg-yellow-400' : 'bg-black text-white shadow-[4px_4px_0px_0px_#834bf1] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'}`}>
                           {status === 'approved' ? 'COMPLETED' : status === 'pending' ? 'VERIFYING' : 'INIT MISSION'}
                        </button>
                     </div>
                   );
                 })
               )}

               {activeTab === 'vouchers' && (
                 vouchers.length === 0 ? <div className="p-12 text-center border-2 border-dashed border-black/10 font-black uppercase opacity-20">No rewards available</div> :
                 vouchers.map(v => {
                   const reveal = revealedData[v.id];
                   const isExpired = v.expires_at && new Date(v.expires_at).getTime() < Date.now();
                   return (
                     <div key={v.id} className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000]">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 border-[3px] border-black flex items-center justify-center p-2 shadow-[3px_3px_0px_0px_#000]">
                              {v.partner_brands?.logo_url ? <img src={v.partner_brands.logo_url} className="w-full h-full object-contain"/> : <Gift size={24}/>}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                 <h3 className="text-xl font-black uppercase italic truncate pr-4">{v.title}</h3>
                                 <span className="text-xl font-black text-[#834bf1]">{v.cost} RC</span>
                              </div>
                              <p className="text-[10px] font-bold text-black/50 uppercase line-clamp-1 mb-4">{v.description}</p>
                              {reveal ? (
                                <div className="flex items-center gap-2">
                                   <div className="flex-1 bg-emerald-400 border-[2px] border-black p-2 font-mono font-black text-center tracking-widest uppercase">{reveal.code}</div>
                                   <button onClick={() => copyToClipboard(reveal.code, v.id)} className="p-2 border-[2px] border-black bg-white active:scale-90">{copyStatus === v.id ? <Check size={16}/> : <Copy size={16}/>}</button>
                                </div>
                              ) : (
                                <button onClick={() => setPendingRedeem(v)} disabled={isExpired} className="w-full py-3 bg-black text-white font-black uppercase text-[10px] border-[2px] border-black shadow-[4px_4px_0px_0px_#ffde59] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                                   {isExpired ? 'EXPIRED' : 'REDEEM'}
                                </button>
                              )}
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};
