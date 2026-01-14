import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, Fingerprint, Gift, MapPin, Building2, TrendingUp
} from 'lucide-center';
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
      // 1. Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single();
      setProfile(profileData);
      
      const userId = user.uid;
      const profileId = profileData?.id;

      // 2. Fetch & Filter Missions
      const { data: allMissions } = await supabase.from('missions').select('*, partner_brands(*)');
      if (allMissions) {
        const filteredMissions = allMissions.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          const isGlobal = !m.assigned_to || m.assigned_to.length === 0;
          const isAssigned = m.assigned_to?.includes(userId) || m.assigned_to?.includes(profileId);
          return isGlobal || isAssigned;
        });
        setMissions(filteredMissions);
      }

      // 3. Fetch & Filter Rewards (FIXED: Added targeting check)
      const { data: allRewards } = await supabase.from('rewards').select('*, partner_brands(*)');
      if (allRewards) {
        const filteredRewards = allRewards.filter(r => {
            const isGlobal = !r.assigned_to || r.assigned_to.length === 0;
            const isAssigned = r.assigned_to?.includes(userId) || r.assigned_to?.includes(profileId);
            const hasStock = (r.stock || 0) > 0; // Hide out of stock
            return (isGlobal || isAssigned) && hasStock;
        });
        setRewards(filteredRewards);
      }

      // 4. Fetch User Submissions
      const { data: sRes } = await supabase.from('submissions').select('mission_id, status').eq('user_id', user.uid);
      if (sRes) setUserSubmissions(sRes);

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

    return () => { supabase!.removeChannel(channel); };
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
          <h2 className="text-2xl font-black uppercase italic mb-8 text-black">Access Required</h2>
          <button onClick={() => signInWithPopup(auth, googleProvider)} className="w-full bg-black text-white p-4 font-black uppercase tracking-widest border-2 border-black hover:bg-[#ffde59] hover:text-black transition-colors text-black">LOGIN WITH GOOGLE</button>
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
            <button onClick={onBack} className="p-2 border-[3px] border-black hover:bg-[#ffde59] transition-all text-black"><ArrowLeft size={20} strokeWidth={3}/></button>
            <h1 className="text-xl font-black italic uppercase font-display leading-none text-black">CREATOR <span className="text-[#834bf1]">HUB</span></h1>
          </div>
          <div className="flex flex-col items-end text-black">
             <span className="text-[9px] font-black uppercase opacity-40">Identity Ledger</span>
             <span className="text-xl font-black text-[#834bf1] italic">{profile?.reelcoins || 0} RC</span>
          </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
            {!isApproved ? (
               <div className="bg-[#ffde59] border-[6px] border-black p-16 text-center shadow-[16px_16px_0px_0px_#000] animate-in zoom-in text-black">
                  <Lock size={64} className="mx-auto mb-6 animate-pulse" />
                  <h3 className="text-4xl font-black uppercase italic font-display">Identity Syncing</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-60">Production node is verifying your credentials.</p>
               </div>
            ) : (
              <div className="space-y-12">
                <div className="flex border-[6px] border-black bg-white p-2 shadow-[10px_10px_0px_0px_#000]">
                  <button 
                    onClick={() => setActiveTab('missions')} 
                    className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100 text-black'}`}
                  >
                    Mission Grid
                  </button>
                  <button 
                    onClick={() => setActiveTab('rewards')} 
                    className={`flex-1 py-5 font-black uppercase text-sm italic tracking-[0.2em] transition-all ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_#000]' : 'opacity-40 hover:opacity-100 text-black'}`}
                  >
                    Reward Node
                  </button>
                </div>

                {activeTab === 'missions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-black">
                    {missions.map((m) => {
                        const submission = userSubmissions.find(s => s.mission_id === m.id);
                        const isDone = submission?.status === 'approved' || submission?.status === 'completed';
                        const isPending = submission?.status === 'pending' || submission?.status === 'verifying';
                        const brand = m.partner_brands;

                        return (
                          <div key={m.id} className={`border-[4px] p-8 shadow-[8px_8px_0px_0px] transition-all hover:-translate-y-1 flex flex-col ${isDone ? 'bg-emerald-50 border-emerald-500 shadow-emerald-200' : isPending ? 'bg-yellow-50 border-yellow-500 shadow-yellow-200' : 'bg-white border-black shadow-black'}`}>
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 border-[3px] border-black p-1 flex items-center justify-center bg-white shadow-[3px_3px_0px_0px_#000]">
                                   {brand?.logo_url ? <img src={brand.logo_url} alt={brand.name} className="object-contain w-full h-full"/> : <Building2 className="text-black"/>}
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-black border-2 border-black ${isDone ? 'bg-emerald-400 text-black' : 'bg-[#ffde59] text-black'}`}>
                                   {isDone ? 'VERIFIED' : `+${m.reward_amount} RC`}
                                </span>
                             </div>
                             <h3 className="text-xl font-black uppercase italic leading-tight mb-3 font-display text-black">{m.title}</h3>
                             <p className="text-[10px] font-bold uppercase tracking-tight opacity-50 line-clamp-2 mb-8 text-black">{m.description}</p>
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
                      <div className="col-span-full py-32 text-center border-4 border-dashed border-black/10 text-black">
                          <TrendingUp size={48} className="mx-auto mb-4 opacity-10 text-black" />
                          <p className="text-xs font-black uppercase tracking-widest opacity-20 italic text-black">No missions detected on grid.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 text-black">
                    {rewards.length === 0 ? (
                      <div className="py-24 text-center border-4 border-dashed border-black/10 text-black">
                        <Gift size={48} className="mx-auto mb-4 opacity-10 text-black" />
                        <p className="text-xs font-black italic uppercase opacity-20 tracking-widest text-black">Voucher Node Empty</p>
                      </div>
                    ) : (
                      rewards.map((r) => {
                        const brand = r.partner_brands;
                        return (
                          <div key={r.id} className="bg-white border-[5px] border-black p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-[12px_12px_0px_0px_#ffde59] transition-all">
                             <div className="flex items-center gap-8 flex-1">
                                <div className="w-16 h-16 bg-white border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-all overflow-hidden p-2">
                                  {brand?.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <Gift size={28} className="text-[#ffde59]" strokeWidth={3} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                   <div className="flex items-center gap-3 mb-1 text-black">
                                     <h4 className="text-2xl font-black uppercase italic font-display truncate">{r.title}</h4>
                                     <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div>
                                   </div>
                                   <div className="flex flex-col gap-1 text-black">
                                      <p className="text-[10px] font-black uppercase text-[#834bf1] tracking-[0.3em]">{brand?.name || 'Reelywood'}</p>
                                      {brand?.location_text && (
                                        <p className="text-[8px] font-bold uppercase text-black/40 tracking-widest flex items-center gap-1 text-black">
                                          <MapPin size={10}/> {brand.location_text}
                                        </p>
                                      )}
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-8 shrink-0 text-black">
                                <div className="text-right">
                                   <span className="text-3xl font-black italic font-display text-[#834bf1]">{r.cost}</span>
                                   <span className="text-xs font-black ml-2 uppercase italic opacity-40">RC</span>
                                </div>
                                <button 
                                  onClick={() => handleRedeem(r)}
                                  disabled={isProcessing === r.id || !!revealedCodes[r.id]}
                                  className={`px-8 py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-[0.4em] shadow-[5px_5px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all ${revealedCodes[r.id] ? 'bg-[#39ff14] text-black border-[#000]' : 'bg-black text-white hover:bg-[#834bf1]'}`}
                                >
                                  {isProcessing === r.id ? <Loader2 className="animate-spin" /> : revealedCodes[r.id] ? `HASH: ${revealedCodes[r.id]}` : 'EXECUTE REDEEM'}
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
      </main>
    </div>
  );
};