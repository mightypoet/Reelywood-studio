
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  LogOut, User, Wallet, CheckCircle2, Loader2,
  Lock, X, Bell, Clock, Zap, Gift,
  Building2, CreditCard, Share2, QrCode, Settings,
  ChevronRight, Activity, Terminal, History, Home,
  Camera, Info, AlertCircle, Hash, Users as UsersIcon,
  UserPlus, UserMinus, Eye, ShieldCheck, ShieldAlert, 
  Handshake, Radio, MessageSquare,
  // Fix: Added missing Check import from lucide-react
  Check
} from 'lucide-react';
import { MissionModal } from './MissionModal';
import { ThreeDCard } from '../ThreeDCard';
import { useSoundNotification } from '../../hooks/useSoundNotification';
import { RCNotificationModal } from '../RCNotificationModal';
import { useRCBalanceWatcher } from '../../hooks/useRCBalanceWatcher';
import { ChatWindow } from '../Chat/ChatWindow';

interface DashboardViewProps {
  onBack: () => void;
}

type TabType = 'hub' | 'card' | 'missions' | 'perks' | 'sync';

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
      <h3 className="text-3xl font-black uppercase italic font-display text-black mb-4 tracking-tighter">ACCESS RESTRICTED</h3>
      <div className="space-y-4">
        <div className="bg-black text-white py-2 px-4 border-2 border-black font-black text-[10px] uppercase tracking-[0.3em] inline-block">MODULE: {title}</div>
        <p className="text-xs font-bold text-black/60 uppercase tracking-widest leading-relaxed max-w-xs mx-auto italic">This operational node is encrypted. Identity verification is required to authorize transmission.</p>
        <div className="pt-6 border-t-2 border-black/10 mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">STATUS: {status === 'pending' ? 'PENDING_REVIEW' : 'UNVERIFIED_NODE'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConnectionListModal = ({ type, userId, onClose, onSelectAgent }: { type: 'followers' | 'following' | 'contacts', userId: string, onClose: () => void, onSelectAgent: (agent: any) => void }) => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!supabase) return;
      try {
        if (type === 'contacts') {
           const { data, error } = await supabase.from('follows').select(`follower:profiles!follower_id(*), following:profiles!following_id(*)`).or(`follower_id.eq.${userId},following_id.eq.${userId}`);
           if (error) throw error;
           const agentsMap = new Map();
           data.forEach((item: any) => {
             if (item.follower && item.follower.firebase_uid !== userId) agentsMap.set(item.follower.firebase_uid, item.follower);
             if (item.following && item.following.firebase_uid !== userId) agentsMap.set(item.following.firebase_uid, item.following);
           });
           setList(Array.from(agentsMap.values()));
        } else {
          const profileColumn = type === 'followers' ? 'follower_id' : 'following_id';
          const field = type === 'followers' ? 'following_id' : 'follower_id';
          const { data, error } = await supabase.from('follows').select(`agent:profiles!${profileColumn}(*)`).eq(field, userId);
          if (error) throw error;
          setList(data.map((item: any) => item.agent).filter(Boolean));
        }
      } catch (err) { console.error("CONNECTION_FETCH_ERROR:", err); } finally { setLoading(false); }
    };
    fetchConnections();
  }, [type, userId]);

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 text-black">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] flex flex-col h-[70vh]">
        <header className="p-6 border-b-[4px] border-black flex justify-between items-center bg-slate-50">
          <div><h3 className="text-xl font-black uppercase italic font-display leading-none">{type}</h3><p className="text-[8px] font-black uppercase tracking-widest text-black/40 mt-1">Network Node Grid</p></div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500 transition-colors"><X size={20} strokeWidth={4} /></button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#834bf1]" size={32} /></div> : list.length === 0 ? <div className="h-full flex flex-col items-center justify-center opacity-20 italic"><UsersIcon size={48} className="mb-4" /><p className="font-black uppercase text-xs">Grid Empty</p></div> : <div className="space-y-3">{list.map((agent) => (
            <div key={agent.firebase_uid} onClick={() => onSelectAgent(agent)} className="bg-white border-[3px] border-black p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 active:translate-x-1 active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_#834bf1]"><img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" /></div><div><p className="text-xs font-black uppercase truncate max-w-[150px]">{agent.display_name}</p><p className="text-[8px] font-bold text-black/40 uppercase tracking-widest">@{agent.handle || 'node'}</p></div></div><ChevronRight size={14} className="opacity-20" />
            </div>
          ))}</div>}
        </main>
      </div>
    </div>
  );
};

const AgentDossierModal = ({ agent, isFollowing, isRequested, onFollow, onClose, onShowConnections, onOpenChat }: { agent: any, isFollowing: boolean, isRequested: boolean, onFollow: () => void, onClose: () => void, onShowConnections: (type: 'followers' | 'following', uid: string) => void, onOpenChat: (agent: any) => void }) => (
  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 text-black">
    <div className="absolute inset-0" onClick={onClose} />
    <div className="relative w-full max-w-lg bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
      <header className="bg-[#834bf1] text-white p-6 flex justify-between items-center border-b-[6px] border-black">
        <div className="flex items-center gap-3"><div className="bg-white p-2 border-2 border-black rotate-3"><ShieldCheck className="text-[#834bf1]" size={20} /></div><div><h2 className="text-xl font-black italic uppercase font-display leading-none">Agent Dossier</h2><p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Verified Node Analysis</p></div></div>
        <button onClick={onClose} className="p-2 hover:bg-black transition-colors"><X size={20} strokeWidth={4} /></button>
      </header>
      <main className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
        <div className="flex flex-col items-center text-center space-y-4"><div className="w-24 h-24 rounded-full border-[4px] border-black overflow-hidden shadow-[6px_6px_0px_0px_#ffde59] bg-slate-100"><img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" /></div><div><h3 className="text-3xl font-black uppercase italic font-display">{agent.display_name}</h3><p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest mt-1">@{agent.handle || 'unknown_node'}</p></div></div>
        <div className="grid grid-cols-2 gap-4"><button onClick={() => onShowConnections('followers', agent.firebase_uid)} className="bg-slate-50 border-[3px] border-black p-4 text-center active:scale-95 transition-transform"><span className="block text-2xl font-black italic font-display">{agent.followers || "0"}</span><span className="text-[8px] font-black uppercase tracking-widest opacity-40">Followers</span></button><button onClick={() => onShowConnections('following', agent.firebase_uid)} className="bg-slate-50 border-[3px] border-black p-4 text-center active:scale-95 transition-transform"><span className="block text-2xl font-black italic font-display text-[#834bf1]">{agent.following || "0"}</span><span className="text-[8px] font-black uppercase tracking-widest opacity-40">Following</span></button></div>
        <div className="bg-slate-50 border-[3px] border-black p-5 relative"><p className="text-sm font-bold uppercase leading-relaxed text-black/70 italic">{agent.bio || "No mission bio transmitted."}</p></div>
        <div className="grid grid-cols-5 gap-4"><button onClick={onFollow} disabled={isRequested} className={`col-span-4 py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 ${isFollowing ? 'bg-white text-black' : isRequested ? 'bg-amber-100 text-amber-600 opacity-80' : 'bg-[#ffde59] text-black'}`}>{isFollowing ? <><UserMinus size={24} strokeWidth={3} /> UNLINK NODE</> : isRequested ? <><Clock size={24} strokeWidth={3} className="animate-pulse" /> REQUESTED</> : <><UserPlus size={24} strokeWidth={3} /> LINK IDENTITY</>}</button><button onClick={() => onOpenChat(agent)} className="bg-black text-[#ffde59] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] flex items-center justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"><MessageSquare size={24} strokeWidth={3} /></button></div>
      </main>
    </div>
  </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [otherCreators, setOtherCreators] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [sentRequestUids, setSentRequestUids] = useState<Set<string>>(new Set());
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [viewingAgent, setViewingAgent] = useState<any>(null);
  const [activeChatAgent, setActiveChatAgent] = useState<any | null>(null);
  const [showingConnections, setShowingConnections] = useState<{type: 'followers' | 'following' | 'contacts', uid: string} | null>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);

  const isApproved = profile?.card_status === 'approved';
  const { playSound } = useSoundNotification();
  const { rewardAmount, clearReward } = useRCBalanceWatcher({ currentBalance: profile?.reelcoins, storageKey: 'user_last_rc_balance' });

  const fetchCreatorNetwork = useCallback(async (user: FirebaseUser) => {
    if (!supabase || !user) return;
    try {
      const { data: others } = await supabase.from('profiles').select('*').neq('firebase_uid', user.uid).order('reelcoins', { ascending: false }).limit(10);
      if (others) setOtherCreators(others);
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', user.uid);
      if (following) setFollowingIds(new Set(following.map(f => f.following_id)));
      const { data: sent } = await supabase.from('link_requests').select('receiver_uid').eq('sender_uid', user.uid).eq('status', 'pending');
      if (sent) setSentRequestUids(new Set(sent.map(s => s.receiver_uid)));
      const { data: incoming } = await supabase.from('link_requests').select('*, sender:profiles!sender_uid(*)').eq('receiver_uid', user.uid).eq('status', 'pending');
      if (incoming) setIncomingRequests(incoming.map(i => ({...i, agent: i.sender})));
    } catch (err) { console.error("NETWORK_SYNC_FAILURE:", err); }
  }, []);

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase || !user) return;
    try {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('firebase_uid', user.uid).maybeSingle();
      if (profileData) setProfile(profileData);
      const { data: allMissions } = await supabase.from('missions').select('*, partner_brands(*)');
      if (allMissions) setMissions(allMissions.filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(user.uid)));
      const [rRes, sRes] = await Promise.all([supabase.from('rewards').select('*, partner_brands(*)'), supabase.from('submissions').select('mission_id, status, created_at').eq('user_id', user.uid).order('created_at', { ascending: false })]);
      if (rRes.data) setRewards(rRes.data.filter(r => !r.assigned_to || r.assigned_to.length === 0 || r.assigned_to.includes(user.uid)));
      if (sRes.data) setUserSubmissions(sRes.data);
      fetchCreatorNetwork(user);
    } catch (err) { console.error("GRID_SYNC_FAILURE:", err); } finally { setLoading(false); }
  }, [fetchCreatorNetwork]);

  useEffect(() => {
    if (currentUser) fetchOperationalGrid(currentUser);
    else setLoading(false);
  }, [currentUser, fetchOperationalGrid]);

  const handleFollowToggle = async (targetUid: string) => {
    if (!supabase || !currentUser) return;
    if (followingIds.has(targetUid)) {
      await supabase.from('follows').delete().eq('follower_id', currentUser.uid).eq('following_id', targetUid);
      setFollowingIds(prev => { const n = new Set(prev); n.delete(targetUid); return n; });
    } else if (!sentRequestUids.has(targetUid)) {
      await supabase.from('link_requests').insert([{ sender_uid: currentUser.uid, receiver_uid: targetUid, status: 'pending' }]);
      setSentRequestUids(prev => { const n = new Set(prev); n.add(targetUid); return n; });
      playSound();
      alert("LINK_REQUEST_TRANSMITTED.");
    }
    fetchCreatorNetwork(currentUser);
  };

  const handleAcceptRequest = async (requestId: string, senderUid: string) => {
    if (!supabase || !currentUser) return;
    await supabase.from('follows').insert([{ follower_id: senderUid, following_id: currentUser.uid }]);
    await supabase.from('link_requests').delete().eq('id', requestId);
    playSound(); fetchOperationalGrid(currentUser);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#834bf1]" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-lexend flex flex-col overflow-x-hidden text-black pb-24">
      {rewardAmount !== null && <RCNotificationModal amount={rewardAmount} onClose={clearReward} />}
      {selectedMission && <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />}
      {activeChatAgent && <ChatWindow currentUserId={currentUser!.uid} recipientId={activeChatAgent.firebase_uid} recipientName={activeChatAgent.display_name} recipientPhoto={activeChatAgent.photo_url} onClose={() => setActiveChatAgent(null)} />}
      {viewingAgent && <AgentDossierModal agent={viewingAgent} isFollowing={followingIds.has(viewingAgent.firebase_uid)} isRequested={sentRequestUids.has(viewingAgent.firebase_uid)} onFollow={() => handleFollowToggle(viewingAgent.firebase_uid)} onClose={() => setViewingAgent(null)} onShowConnections={(type, uid) => setShowingConnections({type, uid})} onOpenChat={(agent) => { setViewingAgent(null); setActiveChatAgent(agent); }} />}
      {showingConnections && <ConnectionListModal type={showingConnections.type} userId={showingConnections.uid} onClose={() => setShowingConnections(null)} onSelectAgent={(agent) => { if (showingConnections.type === 'contacts') setActiveChatAgent(agent); else setViewingAgent(agent); setShowingConnections(null); }} />}

      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2"><div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black rotate-3"><Terminal size={18} strokeWidth={3} /></div><div><h1 className="text-lg font-black italic uppercase font-display leading-none">REELYWOOD<span className="text-[#834bf1]">HUB</span></h1><p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30">Agent Node v4.5</p></div></div>
        <div className="flex gap-2"><button onClick={() => setShowingConnections({type: 'contacts', uid: currentUser!.uid})} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#834bf1] text-black"><MessageSquare size={18} /></button><button className="relative p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black"><Bell size={18} />{incomingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black animate-bounce"></span>}</button></div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full">
        {activeTab === 'hub' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white border-4 border-black p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[8px_8px_0px_0px_#000]">
              <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#834bf1]"><img src={profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" /></div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black uppercase italic font-display">{profile?.handle || "AGENT"}</h2>
                <div className="flex justify-center sm:justify-start gap-6 border-y border-black/5 py-3 my-4">
                  <div onClick={() => setShowingConnections({type: 'followers', uid: currentUser!.uid})} className="cursor-pointer"><span className="block font-black text-xl leading-none">{profile?.followers || "0"}</span><span className="text-[9px] font-bold opacity-40 uppercase">followers</span></div>
                  <div onClick={() => setShowingConnections({type: 'following', uid: currentUser!.uid})} className="cursor-pointer"><span className="block font-black text-xl leading-none">{profile?.following || "0"}</span><span className="text-[9px] font-bold opacity-40 uppercase">following</span></div>
                </div>
                <p className="text-[10px] font-black text-[#834bf1] uppercase">{profile?.niche || "CREATOR NODE"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#834bf1] p-6 border-4 border-black shadow-[4px_4px_0px_0px_#000] text-white"><span className="text-[7px] font-black uppercase opacity-50 block">ASSETS</span><h3 className="text-4xl font-black italic font-display leading-none">{profile?.reelcoins?.toLocaleString() || "0"}</h3><p className="text-[9px] font-black uppercase mt-1">ReelCoins</p></div>
              <div className="bg-[#ffde59] p-6 border-4 border-black shadow-[4px_4px_0px_0px_#000] text-black"><span className="text-[7px] font-black uppercase opacity-50 block">OPERATIONS</span><h3 className="text-4xl font-black italic font-display leading-none">{missions.length}</h3><p className="text-[9px] font-black uppercase mt-1">Active</p></div>
            </div>
            <div className="bg-white border-4 border-black p-4 overflow-hidden shadow-[6px_6px_0px_0px_#000]">
              <h4 className="font-black text-xs uppercase mb-4 flex items-center gap-2"><Radio size={14} className="text-[#834bf1] animate-pulse" /> Global Grid</h4>
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {otherCreators.map(agent => (
                  <div key={agent.firebase_uid} onClick={() => setViewingAgent(agent)} className="flex-shrink-0 w-24 bg-slate-50 border-2 border-black p-2 text-center cursor-pointer hover:bg-slate-100"><img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-12 h-12 rounded-full border-2 border-black mx-auto mb-2" /><p className="text-[8px] font-black uppercase truncate">{agent.display_name}</p></div>
                ))}
              </div>
            </div>
            {incomingRequests.length > 0 && (
              <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_#834bf1]">
                <h4 className="font-black text-xs uppercase mb-4 flex items-center gap-2"><Handshake size={14} className="text-[#834bf1]" /> Connection Signals</h4>
                <div className="space-y-3">
                  {incomingRequests.map(req => (
                    <div key={req.id} className="bg-slate-50 border-2 border-black p-3 flex items-center justify-between"><div className="flex items-center gap-3"><img src={req.agent?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${req.sender_uid}`} className="w-8 h-8 rounded-full border border-black" /><div><p className="text-[10px] font-black uppercase">{req.agent?.display_name}</p></div></div><div className="flex gap-2"><button onClick={() => handleAcceptRequest(req.id, req.sender_uid)} className="bg-emerald-500 text-white p-1.5 border-2 border-black"><Check size={14} strokeWidth={3} /></button></div></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'card' && (!isApproved ? <LockedSection title="CREATOR_CARD" status={profile?.card_status} /> : <div className="flex flex-col items-center py-8 space-y-8 animate-in zoom-in-95 duration-500"><div className="w-full max-w-[320px]"><ThreeDCard name={profile?.display_name || "AGENT"} handle={profile?.handle || "unlinked"} /></div><div className="flex gap-4"><button className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:shadow-none"><QrCode size={24} /></button><button className="bg-black text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#834bf1] active:translate-x-1 active:shadow-none"><Share2 size={24} /></button></div></div>)}
        {activeTab === 'missions' && (!isApproved ? <LockedSection title="MISSION_GRID" status={profile?.card_status} /> : <div className="space-y-6"><h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Zap className="text-[#834bf1]" /> Operational Grid</h3><div className="space-y-4">{missions.map(m => <div key={m.id} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 transition-all"><h4 className="text-lg font-black uppercase italic">{m.title}</h4><p className="text-[10px] opacity-40 uppercase font-black mt-1">Reward: {m.reward_amount} RC</p><button onClick={() => setSelectedMission(m)} className="w-full bg-[#834bf1] text-white py-3 mt-4 border-2 border-black font-black uppercase text-[10px]">OPEN BRIEF</button></div>)}</div></div>)}
        {activeTab === 'perks' && (!isApproved ? <LockedSection title="REWARD_NODE" status={profile?.card_status} /> : <div className="space-y-6"><h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Gift className="text-[#ffde59]" /> Reward Node</h3><div className="space-y-4">{rewards.map(r => <div key={r.id} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#ffde59] flex items-center justify-between"><div><h4 className="text-lg font-black uppercase italic">{r.title}</h4><p className="text-[10px] font-black opacity-40">{r.partner_brands?.name}</p></div><div className="text-right"><span className="block font-black text-[#834bf1]">{r.cost} RC</span><button className="bg-black text-white px-4 py-2 border-2 border-black text-[10px] font-black uppercase mt-1">REDEEM</button></div></div>)}</div></div>)}
        {activeTab === 'sync' && <div className="space-y-8 animate-in fade-in duration-500"><div className="bg-white border-4 border-black p-6 flex items-center gap-4 shadow-[6px_6px_0px_0px_#000]"><img src={profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-16 h-16 rounded-full border-2 border-black" /><div className="min-w-0"><h3 className="text-xl font-black uppercase italic truncate">{profile?.display_name || "AGENT"}</h3><p className="text-[10px] font-bold opacity-40">{currentUser?.email}</p></div></div><button className="w-full bg-white border-4 border-black p-5 flex items-center justify-between font-black uppercase text-xs shadow-[4px_4px_0px_0px_#000]"><span>Profile Sync Settings</span><Settings size={18} /></button><button onClick={() => auth.signOut()} className="w-full bg-rose-500 text-white border-4 border-black py-6 shadow-[6px_6px_0px_0px_#000] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3"><LogOut size={18} /><span>TERMINATE SESSION</span></button></div>}
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black border-4 border-white p-2 flex items-center justify-between shadow-2xl z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'CARD' },
          { id: 'missions', icon: Zap, label: 'OPS' },
          { id: 'perks', icon: Gift, label: 'VAULT' },
          { id: 'sync', icon: User, label: 'SYNC' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} /><span className="text-[7px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
