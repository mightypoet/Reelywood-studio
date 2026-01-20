
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, X, Bell, Clock, Zap, Gift,
  Target, TrendingUp, Maximize2, Building2,
  LayoutDashboard, CreditCard, Share2, QrCode, Settings,
  ChevronRight, Activity, Terminal, History, Home, Menu
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { ThreeDCard } from '../ThreeDCard';

interface DashboardViewProps {
  onBack: () => void;
}

type TabType = 'hub' | 'card' | 'missions' | 'perks' | 'sync';

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

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
        supabase.from('submissions').select('mission_id, status, created_at').eq('user_id', user.uid),
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
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'RW-' + Math.random().toString(36).substr(2, 6).toUpperCase() }));
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
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Syncing Node...</p>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#834bf1] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-white">
          <div className="flex justify-between items-start mb-2">
            <Wallet size={20} className="opacity-50" />
            <span className="text-[7px] font-black uppercase tracking-widest bg-white/20 px-1">ASSETS</span>
          </div>
          <h3 className="text-4xl font-black italic font-display leading-none">{profile?.reelcoins?.toLocaleString() || "0"}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1">ReelCoins Available</p>
        </div>
        <div className="bg-[#ffde59] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-black">
          <div className="flex justify-between items-start mb-2">
            <Zap size={20} className="opacity-50" />
            <span className="text-[7px] font-black uppercase tracking-widest bg-black/10 px-1">ACTIVE_OPS</span>
          </div>
          <h3 className="text-4xl font-black italic font-display leading-none">{missions.length}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1">Missions in Grid</p>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
        <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-2 text-black">
          <History size={14} /> Operational Timeline
        </h4>
        <div className="space-y-4">
          {userSubmissions.slice(0, 3).map((sub, i) => (
            <div key={i} className="flex items-center gap-4 border-b-2 border-slate-50 pb-4 last:border-0">
              <div className={`w-10 h-10 border-2 border-black flex items-center justify-center shrink-0 ${sub.status === 'approved' ? 'bg-emerald-400' : 'bg-[#ffde59]'}`}>
                {sub.status === 'approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase truncate">{missions.find(m => m.id === sub.mission_id)?.title || 'Mission Entry'}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{new Date(sub.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[9px] font-black uppercase ${sub.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'}`}>{sub.status}</span>
            </div>
          ))}
          {userSubmissions.length === 0 && <p className="text-[9px] font-black uppercase opacity-20 text-center py-4 italic">No recent transmissions.</p>}
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
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
            <button className="bg-white border-[4px] border-black p-4 flex flex-col items-center gap-2 shadow-[6px_6px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <QrCode size={24} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase tracking-widest">Show QR Node</span>
            </button>
            <button className="bg-black text-white border-[4px] border-black p-4 flex flex-col items-center gap-2 shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <Share2 size={24} strokeWidth={3} />
              <span className="text-[8px] font-black uppercase tracking-widest text-[#ffde59]">Share ID</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
        <Zap className="text-[#834bf1]" /> Operational Grid
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
                <h4 className="text-lg font-black uppercase italic font-display leading-tight text-black">{m.title}</h4>
                <p className="text-[10px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2">{m.description}</p>
                <button 
                  onClick={() => setSelectedMission(m)}
                  disabled={isDone || isPending || !isApproved}
                  className={`w-full py-4 mt-6 border-[3px] font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px] text-white ${isDone ? 'bg-emerald-600 border-emerald-700' : isPending ? 'bg-yellow-400 border-yellow-600 text-black' : !isApproved ? 'bg-slate-300 border-slate-400 cursor-not-allowed' : 'bg-[#834bf1] border-black'}`}
                >
                  {!isApproved ? 'LOCKED (SYNC REQ)' : isDone ? 'COMPLETED' : isPending ? 'REVIEWING' : 'OPEN BRIEF'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderPerks = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
        <Gift className="text-[#ffde59] fill-current stroke-black stroke-2" /> Reward Node
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
                    <h4 className={`text-sm font-black uppercase italic truncate ${isRedeemed ? 'line-through text-slate-400' : 'text-black'}`}>{r.title}</h4>
                    <p className="text-[9px] font-black uppercase text-black/30 tracking-widest">{brand?.name || 'Reelywood'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-lg font-black italic ${isRedeemed ? 'text-slate-400' : 'text-[#834bf1]'}`}>{r.cost} RC</span>
                  <button 
                    onClick={() => handleRedeem(r)}
                    disabled={isProcessing === r.id || isRedeemed || !isApproved}
                    className={`px-4 py-2 border-[2px] font-black uppercase text-[8px] tracking-[0.2em] shadow-[3px_3px_0px_0px_#000] ${revealedCodes[r.id] ? 'bg-[#39ff14]' : isRedeemed ? 'bg-slate-700 text-slate-500 border-slate-800' : 'bg-black text-white'}`}
                  >
                    {revealedCodes[r.id] ? revealedCodes[r.id] : isRedeemed ? 'CLAIMED' : !isApproved ? 'LOCKED' : 'REDEEM'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
       <div className="bg-white border-[4px] border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="w-16 h-16 bg-slate-100 border-[3px] border-black overflow-hidden shadow-[3px_3px_0px_0px_#834bf1]">
            <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
          </div>
          <div>
             <h3 className="text-xl font-black uppercase italic text-black">{profile?.display_name || "AGENT"}</h3>
             <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{currentUser?.email}</p>
          </div>
       </div>

       <div className="space-y-4">
          <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group text-black">
             <div className="flex items-center gap-4">
               <Settings size={18} /> Edit Sync Profile
             </div>
             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group text-black">
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
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-lexend">
      {selectedMission && (
        <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />
      )}

      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] rotate-3">
            <Terminal size={20} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase font-display leading-none text-black">REELYWOOD<span className="text-[#834bf1]">HUB</span></h1>
            <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30">Agent Access Node v4.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#ffde59] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase text-black">LIVE_SYNC_OK</span>
          </div>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black"
          >
            <Bell size={18} />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        {activeTab === 'hub' && renderHub()}
        {activeTab === 'card' && renderCard()}
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'perks' && renderPerks()}
        {activeTab === 'sync' && renderSync()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-black border-4 border-white p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'ID CARD' },
          { id: 'missions', icon: Zap, label: 'MISSIONS' },
          { id: 'perks', icon: Gift, label: 'PERKS' },
          { id: 'sync', icon: User, label: 'SYNC' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={20} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[7px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      <footer className="text-center pt-10 pb-20 opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-black">PRODUCTION_NODE_v4.5.0 • END_TO_END_ENCRYPTED</p>
      </footer>
    </div>
  );
};
