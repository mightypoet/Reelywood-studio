import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, Fingerprint, Gift, MapPin, Building2, TrendingUp
} from 'lucide-react';
import { MissionModal } from './MissionModal';

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
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const fetchOperationalGrid = async (user: FirebaseUser) => {
    if (!supabase) return;

    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single();
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

      const [rRes, sRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('mission_id, status').eq('user_id', user.uid)
      ]);

      if (rRes.data) setRewards(rRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);

    } catch (err) { console.error("GRID_SYNC_FAILURE:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setCurrentUser(user); fetchOperationalGrid(user); } else { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  // --- AUTO REFRESH LISTENER (USER SIDE) ---
  useEffect(() => {
    if (!currentUser || !supabase) return;

    const channel = supabase.channel(`user-node-${currentUser.uid}`)
      // 1. Listen for Balance Updates
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `firebase_uid=eq.${currentUser.uid}` },
        (payload) => setProfile((prev: any) => ({ ...prev, ...payload.new }))
      )
      // 2. Listen for Mission Status Changes (e.g., Admin Approves)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `user_id=eq.${currentUser.uid}` },
        () => fetchOperationalGrid(currentUser) // Re-fetch grid to update status colors
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

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
    } catch (err: any) { alert("Redemption Failed: " + err.message); } 
    finally { setIsProcessing(null); }
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-white"><Loader2 className="animate-spin text-[#834bf1] mb-4" size={48}/><p className="text-[10px] font-black uppercase tracking-widest text-black/40">Syncing Node...</p></div>;
  
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
       <div className="bg-white border-4 border-black p-10 shadow-[8px_8px_0px_0px_#000] text-center max-w-sm">
          <Fingerprint className="mx-auto mb-6 text-[#834bf1]" size={48} />
          <h2 className="text-2xl font-black uppercase italic mb-8">Access Required</h2>
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-black text-white p-4 font-black uppercase tracking-widest border-2 border-black hover:bg-[#ffde59] hover:text-black transition-colors">LOGIN WITH GOOGLE</button>
       </div>
    </div>
  );

  const isApproved = profile?.card_status === 'approved';

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend pb-24">
      {selectedMission && (
        <MissionModal 
          mission={selectedMission} 
          user={currentUser} 
          onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser); }} 
        />
      )}

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[50] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 border-[3px] border-black hover:bg-[#ffde59] transition-all"><ArrowLeft size={20} strokeWidth={3}/></button>
            <h1 className="text-xl font-black italic uppercase font-display leading-none">CREATOR <span className="text-[#834bf1]">HUB</span></h1>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black uppercase opacity-40">Identity Ledger</span>
             <span className="text-xl font-black text-[#834bf1] italic">{profile?.reelcoins || 0} RC</span>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
            {!isApproved ? (
               <div className="bg-[#ffde59] border-[6px] border-black p-16 text-center shadow-[16px_16px_0px_0px_#000] animate-in zoom-in">
                  <Lock size={64} className="mx-auto mb-6 animate-pulse" />
                  <h3 className="text-4xl font-black uppercase italic font-display">Identity Syncing</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-60">Production node is verifying your credentials.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {missions.map((m) => {
                    const submission = userSubmissions.find(s => s.mission_id === m.id);
                    const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                    const isPending = submission?.status === 'pending' || submission?.status === 'verifying';
                    const brand = m.partner_brands;

                    return (
                      <div key={m.id} className={`border-[4px] p-8 shadow-[8px_8px_0px_0px] transition-all hover:-translate-y-1 flex flex-col ${isDone ? 'bg-emerald-50 border-emerald-500' : isPending ? 'bg-yellow-50 border-yellow-500' : 'bg-white border-black'}`}>
                         <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 border-[3px] border-black p-1 flex items-center justify-center bg-white shadow-[3px_3px_0px_0px_#000]">
                               {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="object-contain w-full h-full"/> : <Building2/>}
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-black border-2 border-black ${isDone ? 'bg-emerald-400' : 'bg-[#ffde59]'}`}>
                               {isDone ? 'VERIFIED' : `+${m.reward_amount} RC`}
                            </span>
                         </div>
                         <h3 className="text-xl font-black uppercase italic leading-tight mb-3 font-display">{m.title}</h3>
                         <p className="text-[10px] font-bold uppercase tracking-tight opacity-50 line-clamp-2 mb-8">{m.description}</p>
                         <button 
                           onClick={() => setSelectedMission(m)}
                           disabled={isDone || isPending}
                           className={`mt-auto w-full py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${isDone ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-[#834bf1]'}`}
                         >
                           {isDone ? 'PROTOCOL FINALIZED' : isPending ? 'REVIEW IN PROGRESS' : 'INITIALIZE MISSION'}
                         </button>
                      </div>
                    );
                 })}
                 {missions.length === 0 && (
                   <div className="col-span-full py-32 text-center border-4 border-dashed border-black/10">
                      <TrendingUp size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-widest opacity-20 italic">No missions detected on grid.</p>
                   </div>
                 )}
              </div>
            )}
      </main>
    </div>
  );
};