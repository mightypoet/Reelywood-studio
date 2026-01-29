
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
  ShieldAlert, Fingerprint, RefreshCcw
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

// --- Shared Locked UI Component ---
const LockedSection = ({ title, status }: { title: string, status: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60dvh] py-8 px-4 animate-in zoom-in-95 duration-500">
    <div className="bg-[#ffde59] border-[6px] border-black p-8 sm:p-12 text-center shadow-[12px_12px_0px_0px_#000] w-full max-w-md mx-auto relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
      
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-white border-[4px] border-black flex items-center justify-center mx-auto shadow-[6px_6px_0px_0px_#000] group-hover:rotate-6 transition-transform">
          <ShieldAlert size={48} className="text-black" strokeWidth={2.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-black text-[#ffde59] p-2 border-2 border-black rotate-12">
          <Lock size={16} strokeWidth={3} />
        </div>
      </div>

      <h3 className="text-3xl font-black uppercase italic font-display text-black mb-4 tracking-tighter">
        ACCESS RESTRICTED
      </h3>
      
      <div className="space-y-4">
        <div className="bg-black text-white py-2 px-4 border-2 border-black font-black text-[10px] uppercase tracking-[0.3em] inline-block">
          MODULE: {title}
        </div>
        
        <p className="text-xs font-bold text-black/60 uppercase tracking-widest leading-relaxed max-w-xs mx-auto italic">
          This operational node is encrypted. Identity verification is required to authorize transmission.
        </p>

        <div className="pt-6 border-t-2 border-black/10 mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              STATUS: {status === 'pending' ? 'PENDING_REVIEW' : 'UNVERIFIED_NODE'}
            </span>
          </div>
          {status === 'pending' ? (
             <p className="text-[9px] font-black uppercase text-black/30">Estimated Authorization: 24h</p>
          ) : (
             <p className="text-[9px] font-black uppercase text-[#834bf1]">Submit Identity via SYNC tab</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// --- Incoming Follow Requests Component ---
const IncomingRequests = ({ requests, onAccept, onReject }: { 
  requests: any[], 
  onAccept: (id: number) => void, 
  onReject: (id: number) => void 
}) => {
  if (requests.length === 0) return null;
  return (
    <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_#834bf1] animate-in slide-in-from-top-4 duration-500">
      <h4 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2 mb-6">
        <Fingerprint className="text-[#834bf1]" size={16} /> Link Requests
      </h4>
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-slate-50 border-[3px] border-black p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shrink-0 shadow-[2px_2px_0px_0px_#000]">
                  <img src={req.profiles.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${req.sender_id}`} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase truncate text-black">{req.profiles.display_name}</p>
                  <p className="text-[8px] font-bold text-[#834bf1] uppercase tracking-widest">@{req.profiles.handle}</p>
                </div>
             </div>
             <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => onReject(req.id)}
                  className="bg-white text-black p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <X size={14} strokeWidth={4} />
                </button>
                <button 
                  onClick={() => onAccept(req.id)}
                  className="bg-[#ffde59] text-black p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Check size={14} strokeWidth={4} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Agent Dossier Modal ---
const AgentDossierModal = ({ agent, isFollowing, isPending, onFollow, onClose, onShowConnections }: { 
  agent: any, 
  isFollowing: boolean, 
  isPending: boolean,
  onFollow: () => void, 
  onClose: () => void,
  onShowConnections: (type: 'followers' | 'following', uid: string) => void
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
               className="bg-slate-50 border-[3px] border-black p-4 text-center active:scale-95 transition-transform"
             >
                <span className="block text-2xl font-black italic font-display">{agent.followers || "0"}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Followers</span>
             </button>
             <button 
               onClick={() => onShowConnections('following', agent.firebase_uid)}
               className="bg-slate-50 border-[3px] border-black p-4 text-center active:scale-95 transition-transform"
             >
                <span className="block text-2xl font-black italic font-display text-[#834bf1]">{agent.following || "0"}</span>
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
            disabled={isPending}
            className={`w-full py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 ${isFollowing ? 'bg-white text-black' : isPending ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-[#ffde59] text-black'}`}
          >
            {isFollowing ? (
              <><UserMinus size={24} strokeWidth={3} /> UNLINK NODE</>
            ) : isPending ? (
              <><Clock size={24} className="animate-pulse" /> REQUEST SENT</>
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
  const isApproved = profile?.card_status === 'approved';
  
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<string[]>([]);
  
  // Follow System States
  const [otherCreators, setOtherCreators] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [outgoingPendingIds, setOutgoingPendingIds] = useState<Set<string>>(new Set());
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  
  const [viewingAgent, setViewingAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const { playSound } = useSoundNotification();
  const { rewardAmount, clearReward } = useRCBalanceWatcher({
    currentBalance: profile?.reelcoins,
    storageKey: 'user_last_rc_balance'
  });

  const fetchCreatorNetwork = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;
    try {
      // 1. Fetch other active creators
      const { data: others } = await supabase
        .from('profiles')
        .select('*')
        .neq('firebase_uid', user.uid)
        .order('reelcoins', { ascending: false })
        .limit(12);
      
      if (others) setOtherCreators(others);

      // 2. Fetch established relationships
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.uid);
      
      if (following) setFollowingIds(new Set(following.map(f => f.following_id)));

      // 3. Fetch outgoing pending requests
      const { data: outgoing } = await supabase
        .from('follow_requests')
        .select('receiver_id')
        .eq('sender_id', user.uid);
      
      if (outgoing) setOutgoingPendingIds(new Set(outgoing.map(r => r.receiver_id)));

      // 4. Fetch incoming requests with profiles
      const { data: incoming } = await supabase
        .from('follow_requests')
        .select('*, profiles:sender_id(*)')
        .eq('receiver_id', user.uid);
      
      if (incoming) setIncomingRequests(incoming);

    } catch (err) {
      console.error("NETWORK_SYNC_FAILURE:", err);
    }
  }, []);

  const handleFollowAction = async (targetUid: string) => {
    if (!supabase || !currentUser) return;
    
    const isFollowing = followingIds.has(targetUid);
    const isRequested = outgoingPendingIds.has(targetUid);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase.from('follows').delete().eq('follower_id', currentUser.uid).eq('following_id', targetUid);
        if (error) throw error;
        setFollowingIds(prev => { const n = new Set(prev); n.delete(targetUid); return n; });
      } else if (!isRequested) {
        // Send Follow Request
        const { error } = await supabase.from('follow_requests').insert([{ sender_id: currentUser.uid, receiver_id: targetUid }]);
        if (error) throw error;
        setOutgoingPendingIds(prev => { const n = new Set(prev); n.add(targetUid); return n; });
        playSound();
      }

      // Refresh profiles
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('firebase_uid', currentUser.uid).single();
      if (updatedProfile) setProfile(updatedProfile);

      if (viewingAgent && viewingAgent.firebase_uid === targetUid) {
        const { data: updatedAgent } = await supabase.from('profiles').select('*').eq('firebase_uid', targetUid).single();
        if (updatedAgent) setViewingAgent(updatedAgent);
      }
    } catch (err: any) {
      alert("HANDSHAKE_ERROR: " + err.message);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!supabase || !currentUser) return;
    try {
      const { data, error } = await supabase.rpc('accept_follow_request', { request_id_param: requestId });
      if (error) throw error;
      if (data.success) {
        playSound();
        fetchCreatorNetwork(currentUser);
        // Refresh local profile
        const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('firebase_uid', currentUser.uid).single();
        if (updatedProfile) setProfile(updatedProfile);
      }
    } catch (err: any) {
       alert("ACCEPT_SYNC_FAILURE: " + err.message);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('follow_requests').delete().eq('id', requestId);
      if (error) throw error;
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      alert("PURGE_ERROR: " + err.message);
    }
  };

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;
    try {
      const { data: profileData, error: pError } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single();
      if (pError) throw pError;
      setProfile(profileData);

      const { data: allMissions } = await supabase.from('missions').select('*, partner_brands(*)');
      if (allMissions) {
        const currentMissions = allMissions.filter(m => {
          if (m.assigned_to?.includes('DRAFT')) return false;
          const isGlobal = !m.assigned_to || (Array.isArray(m.assigned_to) && m.assigned_to.length === 0);
          const isAssigned = Array.isArray(m.assigned_to) && (m.assigned_to.includes(user.uid) || m.assigned_to.includes(profileData?.id));
          return isGlobal || isAssigned;
        });
        setMissions(currentMissions);
      }

      const [rRes, sRes, redRes] = await Promise.all([
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('mission_id, status, created_at').eq('user_id', user.uid),
        supabase.from('user_rewards').select('reward_id').eq('user_id', user.uid)
      ]);

      if (rRes.data) setRewards(rRes.data);
      if (sRes.data) setUserSubmissions(sRes.data);
      if (redRes.data) setMyRedemptions(redRes.data.map((r: any) => String(r.reward_id)));

      fetchCreatorNetwork(user);
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

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="bg-white border-[4px] border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] border-black overflow-hidden shadow-[4px_4px_0px_0px_#834bf1] bg-slate-100">
            <img src={profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#ffde59] border-2 border-black p-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
            {isApproved ? <CheckCircle2 size={16} /> : <Clock size={16} className="animate-pulse" />}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-4 w-full">
           <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic font-display text-black truncate max-w-[200px]">
              {profile?.handle || "AGENT"}
            </h2>
            <button onClick={() => setActiveTab('sync')} className="bg-white border-[3px] border-black px-6 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#ffde59] shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all">
              Edit Node
            </button>
          </div>
          
          <div className="flex justify-center sm:justify-start gap-8 border-y-2 border-black/5 py-4">
            <div className="text-center">
              <span className="block font-black text-xl text-black leading-none">{profile?.followers || "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">followers</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-xl text-black leading-none">{profile?.following || "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">following</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-xl text-black leading-none">{missions.length}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">ops</span>
            </div>
          </div>

          <p className="font-black text-base uppercase text-black">{profile?.display_name || "Agent Node"}</p>
        </div>
      </div>

      <IncomingRequests requests={incomingRequests} onAccept={handleAcceptRequest} onReject={handleRejectRequest} />

      <div className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <UsersIcon size={14} className="text-[#834bf1]" /> Agent Grid (Global)
          </h4>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
          {otherCreators.map((agent) => (
            <div key={agent.firebase_uid} className="flex-shrink-0 w-32 bg-slate-50 border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000] snap-start flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden mb-3 bg-white shadow-[2px_2px_0px_0px_#834bf1] cursor-pointer" onClick={() => setViewingAgent(agent)}>
                <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
              </div>
              <h5 className="text-[10px] font-black uppercase truncate w-full mb-0.5">{agent.display_name}</h5>
              <p className="text-[7px] font-bold text-black/40 uppercase tracking-widest mb-3">@{agent.handle}</p>
              
              <div className="flex gap-1 w-full mt-auto">
                <button 
                  onClick={() => handleFollowAction(agent.firebase_uid)}
                  className={`flex-1 p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all ${followingIds.has(agent.firebase_uid) ? 'bg-white' : outgoingPendingIds.has(agent.firebase_uid) ? 'bg-slate-200 cursor-not-allowed' : 'bg-[#ffde59]'}`}
                >
                  {followingIds.has(agent.firebase_uid) ? <UserMinus size={12} /> : outgoingPendingIds.has(agent.firebase_uid) ? <Clock size={12} /> : <UserPlus size={12} />}
                </button>
                <button 
                  onClick={() => setViewingAgent(agent)}
                  className="p-1.5 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#834bf1] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Eye size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-lexend text-black">
      {rewardAmount !== null && <RCNotificationModal amount={rewardAmount} onClose={clearReward} />}
      
      {viewingAgent && (
        <AgentDossierModal 
          agent={viewingAgent} 
          isFollowing={followingIds.has(viewingAgent.firebase_uid)}
          isPending={outgoingPendingIds.has(viewingAgent.firebase_uid)}
          onFollow={() => handleFollowAction(viewingAgent.firebase_uid)}
          onClose={() => setViewingAgent(null)}
          onShowConnections={() => {}}
        />
      )}

      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] rotate-3 shrink-0">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <h1 className="text-lg font-black italic uppercase font-display leading-none">REELYWOOD<span className="text-[#834bf1]">HUB</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"><Bell size={18} /></button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto w-full">
        {activeTab === 'hub' && renderHub()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black border-[3px] border-white p-1 flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'CARD' },
          { id: 'missions', icon: Zap, label: 'MISSIONS' },
          { id: 'perks', icon: Gift, label: 'PERKS' },
          { id: 'sync', icon: User, label: 'SYNC' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}
          >
            <tab.icon size={18} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[6px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
