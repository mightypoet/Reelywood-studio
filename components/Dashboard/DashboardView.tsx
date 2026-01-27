import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, ArrowLeft, Loader2,
  Lock, X, Bell, Clock, Zap, Gift,
  Target, TrendingUp, Maximize2, Building2,
  LayoutDashboard, CreditCard, Share2, QrCode, Settings,
  ChevronRight, Activity, Terminal, History, Home, Menu,
  Camera, Save, Pencil, Ticket, MapPin, ExternalLink, Info,
  AlertCircle, Copy, Check, Hash, Users as UsersIcon,
  UserPlus, UserMinus, Eye, Award, ShieldCheck, ChevronLeft,
  Heart, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { ThreeDCard } from '../ThreeDCard';
import { useSoundNotification } from '../../hooks/useSoundNotification';
import { RCNotificationModal } from '../RCNotificationModal';
import { useRCBalanceWatcher } from '../../hooks/useRCBalanceWatcher';

interface DashboardViewProps {
  onBack: () => void;
}

type TabType = 'hub' | 'card' | 'missions' | 'perks' | 'sync';

// --- Connection List Modal (Instagram style list) ---
const ConnectionListModal = ({ 
  type, 
  userId, 
  onClose, 
  onSelectAgent 
}: { 
  type: 'followers' | 'following', 
  userId: string, 
  onClose: () => void, 
  onSelectAgent: (agent: any) => void 
}) => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!supabase) return;
      try {
        const isFollowers = type === 'followers';
        // We select the profile linked to the follower_id if we want to see WHO follows US
        const joinField = isFollowers ? 'follower_id' : 'following_id';
        const filterField = isFollowers ? 'following_id' : 'follower_id';
        
        const { data, error } = await supabase
          .from('follows')
          .select(`profiles!follows_${joinField}_fkey(*)`)
          .eq(filterField, userId);

        if (error) throw error;
        // Data structure flattened to profile objects
        const profiles = data?.map((item: any) => item.profiles).filter(Boolean) || [];
        setList(profiles);
      } catch (err) {
        console.error("CONNECTION_FETCH_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [type, userId]);

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 text-black">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_#000] flex flex-col h-[60vh] overflow-hidden">
        <header className="p-4 border-b-[4px] border-black flex justify-between items-center bg-[#ffde59]">
          <h3 className="text-sm font-black uppercase tracking-widest">{type}</h3>
          <button onClick={onClose} className="p-1 border-2 border-black hover:bg-black hover:text-white transition-colors">
            <X size={16} strokeWidth={4} />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#834bf1]" size={24} />
            </div>
          ) : list.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 italic p-10 text-center">
               <UsersIcon size={32} className="mb-4" />
               <p className="font-black uppercase text-[10px]">No Node Connections</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black/5">
              {list.map((agent) => (
                <div 
                  key={agent.firebase_uid}
                  onClick={() => onSelectAgent(agent)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_#834bf1] group-hover:scale-105 transition-transform">
                      <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase truncate">{agent.display_name}</p>
                      <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest">@{agent.handle || 'node'}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Agent Dossier Modal (View Other Profile) ---
const AgentDossierModal = ({ agent, isFollowing, onFollow, onClose, onShowConnections, isFollowLoading }: { 
  agent: any, 
  isFollowing: boolean, 
  onFollow: () => void, 
  onClose: () => void,
  onShowConnections: (type: 'followers' | 'following', uid: string) => void,
  isFollowLoading: boolean
}) => {
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 text-black">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        <header className="bg-[#834bf1] text-white p-6 flex justify-between items-center border-b-[6px] border-black">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black rotate-3">
              <ShieldCheck className="text-[#834bf1]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase font-display leading-none">Agent Dossier</h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Verified Node Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black transition-colors">
            <X size={20} strokeWidth={4} />
          </button>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full border-[4px] border-black overflow-hidden shadow-[6px_6px_0px_0px_#ffde59] bg-slate-100">
              <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase italic font-display">{agent.display_name}</h3>
              <p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest mt-1">@{agent.handle || 'unknown_node'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => onShowConnections('followers', agent.firebase_uid)}
               className="bg-slate-50 border-[3px] border-black p-4 text-center hover:bg-[#ffde59]/10 transition-colors active:scale-95"
             >
                <span className="block text-2xl font-black italic font-display">{agent.followers || 0}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Followers</span>
             </button>
             <button 
               onClick={() => onShowConnections('following', agent.firebase_uid)}
               className="bg-slate-50 border-[3px] border-black p-4 text-center hover:bg-[#834bf1]/10 transition-colors active:scale-95"
             >
                <span className="block text-2xl font-black italic font-display text-[#834bf1]">{agent.following || 0}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Following</span>
             </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-black/30">
              <Info size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Parameters</span>
            </div>
            <div className="bg-slate-50 border-[3px] border-black p-5 relative">
               <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-white">BIO_INTEL</div>
               <p className="text-sm font-bold uppercase leading-relaxed text-black/70 italic mt-2">
                 {agent.bio || "No mission bio transmitted. Agent is operating in stealth mode."}
               </p>
            </div>
          </div>

          <button 
            onClick={onFollow}
            disabled={isFollowLoading}
            className={`w-full py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 ${isFollowing ? 'bg-white text-black' : 'bg-[#ffde59] text-black'}`}
          >
            {isFollowLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isFollowing ? (
              <><UserMinus size={24} strokeWidth={3} /> UNLINK NODE</>
            ) : (
              <><UserPlus size={24} strokeWidth={3} /> LINK IDENTITY</>
            )}
          </button>
        </main>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [latestTxMetadata, setLatestTxMetadata] = useState<{reason: string | null, image: string | null}>({reason: null, image: null});
  
  // Social States
  const [otherCreators, setOtherCreators] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [viewingAgent, setViewingAgent] = useState<any>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showingConnections, setShowingConnections] = useState<{type: 'followers' | 'following', uid: string} | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const { playSound } = useSoundNotification();
  const { rewardAmount, clearReward } = useRCBalanceWatcher({
    currentBalance: profile?.reelcoins,
    storageKey: 'user_last_rc_balance'
  });

  // Added handleSelectConnectionAgent function to fix the reference error on line 458
  const handleSelectConnectionAgent = (agent: any) => {
    setViewingAgent(agent);
    setShowingConnections(null);
  };

  const fetchCreatorNetwork = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;
    try {
      const { data: others } = await supabase
        .from('profiles')
        .select('*')
        .neq('firebase_uid', user.uid)
        .order('followers', { ascending: false })
        .limit(20);
      
      if (others) setOtherCreators(others);

      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.uid);
      
      if (following) setFollowingIds(new Set(following.map(f => f.following_id)));
    } catch (err) {
      console.error("NETWORK_SYNC_FAILURE:", err);
    }
  }, []);

  const handleFollowToggle = async (targetUid: string) => {
    if (!supabase || !currentUser || isFollowLoading) return;
    
    const isCurrentlyFollowing = followingIds.has(targetUid);
    setIsFollowLoading(true);
    
    try {
      if (isCurrentlyFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.uid).eq('following_id', targetUid);
        setFollowingIds(prev => { const next = new Set(prev); next.delete(targetUid); return next; });
      } else {
        await supabase.from('follows').insert([{ follower_id: currentUser.uid, following_id: targetUid }]);
        setFollowingIds(prev => { const next = new Set(prev); next.add(targetUid); return next; });
        playSound();
      }

      // Refresh both profile and the targeted agent
      const [pRes, aRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('firebase_uid', currentUser.uid).single(),
        supabase.from('profiles').select('*').eq('firebase_uid', targetUid).single()
      ]);

      if (pRes.data) setProfile(pRes.data);
      if (aRes.data && viewingAgent?.firebase_uid === targetUid) setViewingAgent(aRes.data);
      
      // Refresh list to show updated counts
      fetchCreatorNetwork(currentUser);
    } catch (err: any) {
      alert("FOLLOW_SYNC_FAILURE: " + err.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;

    try {
      const { data: profileData, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

      if (pError) throw pError;
      setProfile(profileData);

      const [mRes, sRes] = await Promise.all([
        supabase.from('missions').select('*, partner_brands(*)'),
        supabase.from('submissions').select('mission_id, status, created_at').eq('user_id', user.uid)
      ]);

      if (mRes.data) setMissions(mRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);

      await fetchCreatorNetwork(user);
    } catch (err: any) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCreatorNetwork]);

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

  const renderAgentGrid = () => (
    <div className="bg-white border-[3px] border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
          <UsersIcon size={14} className="text-[#834bf1]" /> Agent Grid
        </h4>
        <span className="text-[7px] font-black uppercase text-emerald-500 animate-pulse">Live_Sync</span>
      </div>
      
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
        {otherCreators.map((agent) => (
          <div key={agent.firebase_uid} className="flex-shrink-0 w-36 bg-slate-50 border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_#000] snap-start flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden mb-3 bg-white cursor-pointer"
                 onClick={() => setViewingAgent(agent)}>
              <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
            </div>
            <h5 className="text-[10px] font-black uppercase truncate w-full">{agent.display_name}</h5>
            <p className="text-[7px] font-bold text-black/40 uppercase tracking-widest mb-3">@{agent.handle || 'node'}</p>
            <button 
              onClick={() => handleFollowToggle(agent.firebase_uid)}
              className={`w-full py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black uppercase text-[8px] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${followingIds.has(agent.firebase_uid) ? 'bg-white text-black' : 'bg-[#ffde59] text-black'}`}
            >
              {followingIds.has(agent.firebase_uid) ? 'UNLINK' : 'LINK'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header - Instagram Style */}
      <div className="bg-white border-[4px] border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] border-black overflow-hidden shadow-[4px_4px_0px_0px_#834bf1] shrink-0">
          <img src={profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl font-black uppercase italic font-display">{profile?.handle || "AGENT"}</h2>
            <button onClick={() => setActiveTab('sync')} className="bg-white border-[3px] border-black px-8 py-2 font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#000] active:scale-95 transition-all">
              Edit Profile
            </button>
          </div>

          <div className="flex justify-center sm:justify-start gap-8 border-y-2 border-black/5 py-4">
            <div className="text-center sm:text-left">
              <span className="block font-black text-xl leading-none">{missions.length}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Missions</span>
            </div>
            <button onClick={() => setShowingConnections({type: 'followers', uid: currentUser!.uid})} className="text-center sm:text-left active:opacity-50">
              <span className="block font-black text-xl leading-none">{profile?.followers || 0}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Followers</span>
            </button>
            <button onClick={() => setShowingConnections({type: 'following', uid: currentUser!.uid})} className="text-center sm:text-left active:opacity-50">
              <span className="block font-black text-xl leading-none">{profile?.following || 0}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Following</span>
            </button>
          </div>

          <div className="space-y-1">
             <p className="font-black text-sm uppercase">{profile?.display_name}</p>
             <p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest">{profile?.niche || "CREATOR NODE"}</p>
             <p className="text-[11px] font-bold text-black/60 uppercase tracking-tight italic leading-relaxed pt-2">
               {profile?.bio || "No mission brief set for this node."}
             </p>
          </div>
        </div>
      </div>

      {/* Asset Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#834bf1] p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-white">
          <p className="text-[7px] font-black uppercase tracking-widest opacity-50 mb-2">LIQUID ASSETS</p>
          <h3 className="text-4xl font-black italic font-display leading-none">{profile?.reelcoins?.toLocaleString() || "0"}</h3>
          <p className="text-[8px] font-black uppercase tracking-widest mt-1">ReelCoins</p>
        </div>
        <div className="bg-[#ffde59] p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] text-black">
          <p className="text-[7px] font-black uppercase tracking-widest opacity-50 mb-2">DEPLOYMENTS</p>
          <h3 className="text-4xl font-black italic font-display leading-none">{missions.length}</h3>
          <p className="text-[8px] font-black uppercase tracking-widest mt-1">Active Ops</p>
        </div>
      </div>

      {renderAgentGrid()}

      {/* Instagram style Recent Content Grid */}
      <div className="bg-white border-[3px] border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000]">
         <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
           <ImageIcon size={14} className="text-[#834bf1]" /> TRANSMISSIONS
         </h4>
         <div className="grid grid-cols-3 gap-2">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-square bg-slate-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center relative group overflow-hidden">
                <ImageIcon size={20} className="text-black/10" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                   <div className="flex items-center gap-1"><Heart size={12} fill="white"/> <span className="text-[10px] font-black">0</span></div>
                   <div className="flex items-center gap-1"><MessageSquare size={12} fill="white"/> <span className="text-[10px] font-black">0</span></div>
                </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-lexend flex flex-col overflow-x-hidden text-black pb-40">
      {rewardAmount !== null && <RCNotificationModal amount={rewardAmount} onClose={clearReward} subtitle={latestTxMetadata.reason || "Loot sync authorized."} />}
      {selectedMission && <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />}
      
      {viewingAgent && (
        <AgentDossierModal 
          agent={viewingAgent} 
          isFollowing={followingIds.has(viewingAgent.firebase_uid)}
          isFollowLoading={isFollowLoading}
          onFollow={() => handleFollowToggle(viewingAgent.firebase_uid)}
          onClose={() => setViewingAgent(null)}
          onShowConnections={(type, uid) => setShowingConnections({type, uid})}
        />
      )}

      {showingConnections && (
        <ConnectionListModal 
          type={showingConnections.type}
          userId={showingConnections.uid}
          onClose={() => setShowingConnections(null)}
          onSelectAgent={handleSelectConnectionAgent}
        />
      )}

      <header className="bg-white border-b-[3px] border-black p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md text-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] rotate-3 shrink-0">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase font-display leading-none text-black">REELYWOOD<span className="text-[#834bf1]">HUB</span></h1>
            <p className="text-[6px] font-black uppercase tracking-[0.3em] opacity-30">Agent Node v4.5</p>
          </div>
        </div>
        <button onClick={() => setShowingConnections({type: 'followers', uid: currentUser!.uid})} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black">
          <Bell size={18} />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full overflow-y-auto">
        {activeTab === 'hub' && renderHub()}
        {activeTab === 'card' && <div className="flex flex-col items-center justify-start min-h-[60dvh] py-8 space-y-8 animate-in zoom-in-95 duration-500">{profile?.card_status !== 'approved' ? <div className="bg-[#ffde59] border-[4px] border-black p-8 text-center shadow-[8px_8px_0px_0px_#000] w-full max-w-md mx-auto"><Lock size={40} className="mx-auto mb-6" /><h3 className="text-xl font-black uppercase italic font-display">Identity Syncing</h3><p className="text-[9px] font-black uppercase tracking-widest mt-4">Node verification in progress.</p></div> : <><div className="w-full max-w-[320px] flex justify-center"><div className="w-full relative h-[480px]"><ThreeDCard name={profile?.display_name || "AGENT"} handle={profile?.handle || "unlinked"} /></div></div></>}</div>}
        {activeTab === 'missions' && <div className="space-y-6 animate-in fade-in duration-500"><h3 className="text-lg font-black uppercase italic font-display flex items-center gap-3 text-black"><Zap className="text-[#834bf1]" size={18} /> Operational Grid</h3><div className="space-y-4">{missions.map(m => <div key={m.id} className="border-[4px] p-5 shadow-[4px_4px_0px_0px] relative overflow-hidden flex flex-col bg-white border-black shadow-black"><div className="flex justify-between items-start mb-4"><div className="w-10 h-10 bg-white border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_#000]">{m.partner_brands?.logo_url ? <img src={m.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Building2 size={18} />}</div><div className="px-2 py-1 font-black text-[7px] border-[2px] shadow-[2px_2px_0px_0px_#000] bg-black text-white border-black">+{m.reward_amount} RC</div></div><h4 className="text-base font-black uppercase italic font-display leading-tight">{m.title}</h4><p className="text-[9px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2">{m.description}</p><button onClick={() => setSelectedMission(m)} className="w-full py-4 mt-6 border-[3px] border-black font-black uppercase text-[9px] tracking-widest bg-[#834bf1] text-white hover:translate-x-0.5 hover:translate-y-0.5 transition-all">OPEN BRIEF</button></div>)}</div></div>}
        {activeTab === 'sync' && <div className="space-y-6"><button onClick={() => auth.signOut()} className="w-full bg-rose-500 text-white border-[4px] border-black py-6 shadow-[6px_6px_0px_0px_#000] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-3"><LogOut size={18} /><span>TERMINATE SESSION</span></button></div>}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black border-[3px] border-white p-1 flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'CARD' },
          { id: 'missions', icon: Zap, label: 'MISSIONS' },
          { id: 'perks', icon: Gift, label: 'PERKS' },
          { id: 'sync', icon: User, label: 'SYNC' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={18} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[6px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};