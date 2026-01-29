
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
  ShieldAlert, Fingerprint, Handshake, Search, Radio
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

// --- Connection List Modal ---
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
        const field = type === 'followers' ? 'following_id' : 'follower_id';
        const joinField = type === 'followers' ? 'follower_id' : 'following_id';
        
        const { data, error } = await supabase
          .from('follows')
          .select(`profiles!follows_${joinField}_fkey(*)`)
          .eq(field, userId);

        if (error) throw error;
        setList(data.map((item: any) => item.profiles).filter(Boolean) || []);
      } catch (err) {
        console.error("CONNECTION_FETCH_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [type, userId]);

  return (
    <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 text-black">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] flex flex-col h-[70vh]">
        <header className="p-6 border-b-[4px] border-black flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black uppercase italic font-display leading-none">{type}</h3>
            <p className="text-[8px] font-black uppercase tracking-widest text-black/40 mt-1">Network Node Grid</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-500 transition-colors">
            <X size={20} strokeWidth={4} />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#834bf1]" size={32} />
            </div>
          ) : list.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
               <UsersIcon size={48} className="mb-4" />
               <p className="font-black uppercase text-xs">Grid Empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((agent) => (
                <div 
                  key={agent.firebase_uid}
                  onClick={() => onSelectAgent(agent)}
                  className="bg-white border-[3px] border-black p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 active:translate-x-1 active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white shadow-[2px_2px_0px_0px_#834bf1]">
                      <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase truncate max-w-[150px]">{agent.display_name}</p>
                      <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest">@{agent.handle || 'node'}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="opacity-20" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Agent Dossier Modal ---
const AgentDossierModal = ({ agent, isFollowing, isRequested, onFollow, onClose, onShowConnections }: { 
  agent: any, 
  isFollowing: boolean, 
  isRequested: boolean,
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
               <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[#ffde59] border-2 border-black text-[8px] font-black uppercase tracking-widest">{agent.niche || 'GENERALIST'}</span>
                  <span className="px-2 py-1 bg-white border-2 border-black text-[8px] font-black uppercase tracking-widest">LVL 0{Math.floor(Math.random() * 9) + 1} NODE</span>
               </div>
            </div>
          </div>

          <button 
            onClick={onFollow}
            disabled={isRequested}
            className={`w-full py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 ${isFollowing ? 'bg-white text-black' : isRequested ? 'bg-amber-100 text-amber-600 opacity-80' : 'bg-[#ffde59] text-black'}`}
          >
            {isFollowing ? (
              <><UserMinus size={24} strokeWidth={3} /> UNLINK NODE</>
            ) : isRequested ? (
              <><Clock size={24} strokeWidth={3} className="animate-pulse" /> REQUESTED</>
            ) : (
              <><UserPlus size={24} strokeWidth={3} /> LINK IDENTITY</>
            )}
          </button>
        </main>

        <footer className="p-4 bg-slate-100 border-t-[4px] border-black text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 italic">Encryption Standard v4.5.1 • Dossier Ref: {agent.firebase_uid?.slice(0,8)}</p>
        </footer>
      </div>
    </div>
  );
};

const VoucherModal = ({ voucher, onClose, onRedeem, isRedeeming, userBalance, isSuccess }: { 
  voucher: any, 
  onClose: () => void, 
  onRedeem: (v: any) => void,
  isRedeeming: boolean,
  userBalance: number,
  isSuccess: boolean
}) => {
  const brand = voucher.partner_brands;
  const canAfford = userBalance >= voucher.cost;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code || 'RW-EXPIRED');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 text-black">
      <div className="absolute inset-0" onClick={isRedeeming ? undefined : onClose} />
      <div className="relative w-full max-lg bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        <header className="bg-black text-white p-6 flex justify-between items-center border-b-[6px] border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#ffde59] p-2 border-2 border-black rotate-3">
              <Gift className="text-black" size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase font-display leading-none">
                {isSuccess ? 'Redemption Success' : 'Voucher Detail'}
              </h2>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-50 mt-1">Reward Node v4.5</p>
            </div>
          </div>
          {!isRedeeming && (
            <button onClick={onClose} className="p-2 hover:bg-rose-500 transition-colors">
              <X size={20} strokeWidth={4} />
            </button>
          )}
        </header>

        <main className="p-8 space-y-8 bg-[#fdfdfd]">
          {isSuccess ? (
            <div className="text-center space-y-8 py-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-500 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] mx-auto flex items-center justify-center -rotate-6">
                <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase italic font-display">Authorized</h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-relaxed">
                  Your assets have been exchanged. <br/> Present this code to the merchant.
                </p>
              </div>

              <div className="bg-slate-50 border-[4px] border-black p-6 relative group">
                <p className="text-[8px] font-black uppercase text-black/30 mb-2 tracking-widest text-left">Coupon Code</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-3xl font-black tracking-[0.2em] font-mono text-[#834bf1] uppercase">
                    {voucher.code || 'RW-AUTO'}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-3 bg-black text-white border-2 border-black hover:bg-[#834bf1] transition-all active:scale-90"
                  >
                    {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-black text-white py-5 border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59] font-black uppercase text-sm tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Close Protocol
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_#000] p-2 flex items-center justify-center shrink-0">
                  {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" /> : <Building2 size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic font-display text-black leading-tight">{voucher.title}</h3>
                  <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest">{brand?.name || 'Partner Alliance'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-black/30">
                  <Info size={16} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Redemption Logic</span>
                </div>
                <p className="text-sm font-bold uppercase leading-relaxed text-black/70 border-l-[6px] border-[#ffde59] pl-6 py-1">
                  {voucher.description || "Valid at all authorized partner outlets. Show this digital node to the merchant to redeem."}
                </p>
              </div>

              <div className="bg-slate-50 border-[3px] border-black p-6 flex justify-between items-center shadow-[6px_6px_0px_0px_#000]">
                 <div>
                   <p className="text-[8px] font-black uppercase text-black/30 mb-1">Required Assets</p>
                   <p className="text-3xl font-black italic font-display text-[#834bf1]">{voucher.cost} RC</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black uppercase text-black/30 mb-1">Your Balance</p>
                    <p className={`text-xl font-black italic ${canAfford ? 'text-emerald-500' : 'text-rose-500'}`}>{userBalance} RC</p>
                 </div>
              </div>

              {!canAfford && (
                <div className="bg-rose-50 border-[2px] border-rose-500 p-4 flex items-center gap-3 text-rose-600">
                   <AlertCircle size={18} strokeWidth={3} />
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none">INSUFFICIENT FUNDS: TRANSMISSION BLOCKED</span>
                </div>
              )}

              <button 
                onClick={() => onRedeem(voucher)}
                disabled={isRedeeming || !canAfford}
                className="w-full bg-black text-white py-6 border-[6px] border-black shadow-[8px_8px_0px_0px_#ffde59] font-black uppercase text-lg tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30 disabled:grayscale"
              >
                {isRedeeming ? <Loader2 className="animate-spin" /> : (
                  <>
                    AUTHORIZE REDEMPTION
                    <Zap fill="currentColor" size={20} />
                  </>
                )}
              </button>
            </>
          )}
        </main>

        <footer className="p-4 bg-slate-100 border-t-[4px] border-black text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/30 italic">Secure Redemption Protocol v4.5.1</p>
        </footer>
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
  const [latestTxMetadata, setLatestTxMetadata] = useState<{reason: string | null, image: string | null}>({reason: null, image: null});
  
  // Follow & Request System States
  const [otherCreators, setOtherCreators] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [sentRequestUids, setSentRequestUids] = useState<Set<string>>(new Set());
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  
  const [viewingAgent, setViewingAgent] = useState<any>(null);
  const [showingConnections, setShowingConnections] = useState<{type: 'followers' | 'following', uid: string} | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [redemptionSuccessId, setRedemptionSuccessId] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editNiche, setEditNiche] = useState('');
  const [editFollowers, setEditFollowers] = useState<number>(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        .limit(10);
      
      if (others) setOtherCreators(others);

      // 2. Fetch following relationships
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.uid);
      
      if (following) {
        setFollowingIds(new Set(following.map(f => f.following_id)));
      }

      // 3. Fetch Sent Requests (Handle missing table gracefully)
      const { data: sent, error: sentError } = await supabase
        .from('link_requests')
        .select('receiver_uid')
        .eq('sender_uid', user.uid)
        .eq('status', 'pending');
      
      if (!sentError && sent) setSentRequestUids(new Set(sent.map(s => s.receiver_uid)));

      // 4. Fetch Incoming Requests
      const { data: incoming, error: inError } = await supabase
        .from('link_requests')
        .select('*, profiles!link_requests_sender_uid_fkey(*)')
        .eq('receiver_uid', user.uid)
        .eq('status', 'pending');
      
      if (!inError && incoming) setIncomingRequests(incoming.map(i => ({...i, agent: i.profiles})));

    } catch (err) {
      console.error("NETWORK_SYNC_FAILURE:", err);
    }
  }, []);

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

      const { data: latestTx } = await supabase
        .from('transactions')
        .select('description, amount, meta_image')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestTx && latestTx.amount > 0) {
        setLatestTxMetadata({
          reason: latestTx.description,
          image: latestTx.meta_image
        });
      }

      const { data: allMissions } = await supabase
        .from('missions')
        .select('*, partner_brands(*)');

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
        supabase.from('submissions').select('mission_id, status, created_at').eq('user_id', user.uid).order('created_at', { ascending: false }),
        supabase.from('user_rewards').select('reward_id').eq('user_id', user.uid)
      ]);

      if (rRes.data) {
        const currentRewards = rRes.data.filter(r => {
          const isGlobal = !r.assigned_to || (Array.isArray(r.assigned_to) && r.assigned_to.length === 0);
          const isAssigned = Array.isArray(r.assigned_to) && (r.assigned_to.includes(user.uid));
          return isGlobal || isAssigned;
        });
        setRewards(currentRewards);
      }
      
      if (sRes.data) setUserSubmissions(sRes.data);
      if (redRes.data) setMyRedemptions(redRes.data.map((r: any) => String(r.reward_id)));

      // Trigger network fetch
      fetchCreatorNetwork(user);

    } catch (err: any) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCreatorNetwork]);

  const handleFollowToggle = async (targetUid: string) => {
    if (!supabase || !currentUser) return;
    
    const isCurrentlyFollowing = followingIds.has(targetUid);
    const isAlreadyRequested = sentRequestUids.has(targetUid);
    
    try {
      if (isCurrentlyFollowing) {
        // Unfollow (Unlink Node)
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.uid)
          .eq('following_id', targetUid);
        if (error) throw error;
        
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetUid);
          return next;
        });
      } else if (!isAlreadyRequested) {
        // Send Link Request (Instagram Style)
        const { error } = await supabase
          .from('link_requests')
          .insert([{ sender_uid: currentUser.uid, receiver_uid: targetUid, status: 'pending' }]);
        
        if (error) {
          if (error.message.includes('link_requests')) {
            throw new Error("Table 'link_requests' not found. Admin must run setup SQL.");
          }
          throw error;
        }
        
        setSentRequestUids(prev => {
          const next = new Set(prev);
          next.add(targetUid);
          return next;
        });
        playSound();
        alert("LINK_REQUEST_TRANSMITTED: Awaiting Agent Authorization.");
      }

      // SOCIAL_SYNC: Refresh local counts
      await new Promise(r => setTimeout(r, 150));
      if (currentUser) {
        const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('firebase_uid', currentUser.uid).single();
        if (updatedProfile) setProfile(updatedProfile);
        if (viewingAgent && viewingAgent.firebase_uid === targetUid) {
          const { data: updatedAgent } = await supabase.from('profiles').select('*').eq('firebase_uid', targetUid).single();
          if (updatedAgent) setViewingAgent(updatedAgent);
        }
        fetchCreatorNetwork(currentUser);
      }
    } catch (err: any) {
      alert("FOLLOW_SYNC_FAILURE: " + err.message);
    }
  };

  const handleAcceptRequest = async (requestId: string, senderUid: string) => {
    if (!supabase || !currentUser) return;
    try {
      // 1. AUTHORIZE LINK (Insert into follows)
      const { error: followError } = await supabase
        .from('follows')
        .insert([{ follower_id: senderUid, following_id: currentUser.uid }]);
      
      if (followError) throw followError;

      // 2. PURGE REQUEST (Delete from link_requests)
      const { error: deleteError } = await supabase
        .from('link_requests')
        .delete()
        .eq('id', requestId);
      
      if (deleteError) throw deleteError;

      playSound();
      alert("TRANSMISSION_AUTHORIZED: Agent node linked successfully.");
      fetchOperationalGrid(currentUser);
    } catch (err: any) {
      alert("AUTHORIZATION_FAILURE: " + err.message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!supabase || !currentUser) return;
    try {
      const { error } = await supabase.from('link_requests').delete().eq('id', requestId);
      if (error) throw error;
      fetchOperationalGrid(currentUser);
    } catch (err: any) {
      alert("REJECTION_SYNC_FAILURE: " + err.message);
    }
  };

  useEffect(() => {
    if (!supabase || !currentUser) return;
    const client = supabase;
    const syncChannel = client.channel(`user-sync-${currentUser.uid}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `firebase_uid=eq.${currentUser.uid}` }, () => fetchOperationalGrid(currentUser))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'link_requests', filter: `receiver_uid=eq.${currentUser.uid}` }, () => fetchOperationalGrid(currentUser))
      .subscribe();
    return () => { client.removeChannel(syncChannel); };
  }, [currentUser, fetchOperationalGrid]);

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

  const handleRedeemReward = async (reward: any) => {
    if (!supabase) return;
    setIsProcessing(reward.id);
    try {
      const { error: rpcError } = await supabase.rpc('redeem_reward', { user_uid: currentUser?.uid, cost: reward.cost, item_title: reward.title });
      if (rpcError) throw rpcError;
      await supabase.from('rewards').update({ status: 'redeemed' }).eq('id', reward.id);
      setRedemptionSuccessId(reward.id);
      setMyRedemptions(prev => [...prev, String(reward.id)]);
      if (currentUser) fetchOperationalGrid(currentUser);
    } catch (err: any) {
      alert("Redemption Failed: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(null);
    }
  };

  const startEditing = () => {
    setEditName(profile?.display_name || '');
    setEditHandle(profile?.handle || '');
    setEditBio(profile?.bio || '');
    setEditNiche(profile?.niche || 'CREATOR NODE');
    setEditFollowers(profile?.followers || 0);
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!supabase || !currentUser) return;
    setIsUploading(true);
    try {
      let photoUrl = profile?.photo_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${currentUser.uid}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('brand-assets').upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(filePath);
        photoUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: editName,
          handle: editHandle,
          bio: editBio || '',
          niche: editNiche,
          followers: editFollowers,
          photo_url: photoUrl
        })
        .eq('firebase_uid', currentUser.uid);

      if (updateError) throw updateError;
      
      await fetchOperationalGrid(currentUser);
      setIsEditing(false);
      setAvatarFile(null);
      setPreviewUrl(null);
      alert("PROFILE_SYNCED: Identity node updated successfully.");
    } catch (err: any) {
      alert("SYNC_FAILURE: " + (err.message || "Identity update protocol failed."));
    } finally {
      setIsUploading(false);
    }
  };

  const getBioFontSize = (text: string) => {
    const length = text?.length || 0;
    if (length > 200) return 'text-[9px]';
    if (length > 100) return 'text-[11px]';
    return 'text-[12px]';
  };

  const handleSelectConnectionAgent = async (agent: any) => {
    setViewingAgent(agent);
    setShowingConnections(null);
  };

  const renderCreatorNetwork = () => (
    <div className="space-y-6">
      {/* 1. SECTION: EXPLORE GLOBAL NODES */}
      <div className="bg-white border-[3px] sm:border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 text-black">
            <Radio size={14} className="text-[#834bf1] animate-pulse" /> Personnel Exploration
          </h4>
          <span className="text-[7px] font-black uppercase text-black/30 italic">Global_Grid_v4.5</span>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
          {otherCreators.map((agent) => (
            <div key={agent.firebase_uid} className="flex-shrink-0 w-32 bg-slate-50 border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_#000] snap-start flex flex-col items-center text-center group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#834bf1] opacity-0 group-hover:opacity-5 transition-opacity" />
              
              <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden mb-3 bg-white shadow-[2px_2px_0px_0px_#834bf1] group-hover:scale-105 transition-transform cursor-pointer"
                   onClick={() => setViewingAgent(agent)}>
                <img src={agent.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.firebase_uid}`} className="w-full h-full object-cover" />
              </div>
              
              <h5 className="text-[10px] font-black uppercase truncate w-full mb-0.5">{agent.display_name}</h5>
              <p className="text-[7px] font-bold text-black/40 uppercase tracking-widest mb-3 truncate w-full">@{agent.handle || 'node'}</p>
              
              <div className="flex gap-1 w-full mt-auto">
                 <button 
                  onClick={() => handleFollowToggle(agent.firebase_uid)}
                  disabled={sentRequestUids.has(agent.firebase_uid)}
                  className={`flex-1 p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${followingIds.has(agent.firebase_uid) ? 'bg-white text-black' : sentRequestUids.has(agent.firebase_uid) ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-[#ffde59] text-black'}`}
                >
                  {followingIds.has(agent.firebase_uid) ? <UserMinus size={12} strokeWidth={3} className="mx-auto" /> : <UserPlus size={12} strokeWidth={3} className="mx-auto" />}
                </button>
                <button 
                  onClick={() => setViewingAgent(agent)}
                  className="p-1.5 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#834bf1] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  <Eye size={12} strokeWidth={3} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SECTION: IDENTITY HANDSHAKES (REQUESTS) */}
      <div className="bg-white border-[3px] sm:border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#834bf1] animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 text-black">
            <Handshake size={14} className="text-[#834bf1]" /> Identity Handshakes
          </h4>
          <div className="flex items-center gap-2">
            <span className={`text-[7px] font-black uppercase px-2 py-0.5 border-2 border-black ${incomingRequests.length > 0 ? 'bg-rose-500 text-white border-black animate-pulse' : 'bg-slate-100 text-black/30 border-slate-200'}`}>
              {incomingRequests.length} Signals
            </span>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="py-8 text-center border-4 border-dashed border-slate-100 flex flex-col items-center gap-3 opacity-20">
            <Radio size={24} className="text-black/30" />
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">Grid Silent: No pending links.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div key={req.id} className="bg-slate-50 border-[3px] border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 border-2 border-black bg-white overflow-hidden shadow-[3px_3px_0px_0px_#834bf1]">
                     <img src={req.agent?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${req.sender_uid}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase truncate text-black leading-none">{req.agent?.display_name}</p>
                    <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest mt-1">wants to link identity</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                   <button 
                     onClick={() => handleRejectRequest(req.id)}
                     className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-black bg-white text-rose-500 font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 transition-all active:translate-y-0.5 shadow-[2px_2px_0px_0px_#000] active:shadow-none"
                   >
                      Reject
                   </button>
                   <button 
                     onClick={() => handleAcceptRequest(req.id, req.sender_uid)}
                     className="flex-1 sm:flex-none px-5 py-2.5 border-2 border-black bg-[#4ade80] text-black font-black text-[9px] uppercase tracking-widest hover:bg-[#39e075] transition-all active:translate-y-0.5 shadow-[4px_4px_0px_0px_#000] active:shadow-none"
                   >
                      Accept
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border-[4px] border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[4px] border-black overflow-hidden shadow-[4px_4px_0px_0px_#834bf1] bg-slate-100">
            <img src={profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#ffde59] border-2 border-black p-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
            {isApproved ? <CheckCircle2 size={16} className="text-black" /> : <Clock size={16} className="text-black animate-pulse" />}
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic font-display text-black truncate max-w-[200px] sm:max-w-none">
              {profile?.handle || "AGENT"}
            </h2>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button onClick={() => setActiveTab('sync')} className="bg-white border-[3px] border-black px-6 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#ffde59] transition-all active:scale-95 shadow-[3px_3px_0px_0px_#000]">
                Edit Profile
              </button>
              <button onClick={() => setActiveTab('sync')} className="bg-white border-[3px] border-black px-3 py-2 font-black hover:bg-slate-50 transition-all active:scale-95 shadow-[3px_3px_0px_0px_#000]">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="flex justify-center sm:justify-start gap-6 sm:gap-10 border-y-2 border-black/5 py-4">
            <div className="text-center sm:text-left">
              <span className="block font-black text-xl text-black leading-none">{isApproved ? missions.length : "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">missions</span>
            </div>
            <button 
              onClick={() => setShowingConnections({type: 'followers', uid: currentUser!.uid})}
              className="text-center sm:text-left hover:scale-110 active:scale-95 transition-transform"
            >
              <span className="block font-black text-xl text-black leading-none">{profile?.followers || "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">followers</span>
            </button>
            <button 
              onClick={() => setShowingConnections({type: 'following', uid: currentUser!.uid})}
              className="text-center sm:text-left hover:scale-110 active:scale-95 transition-transform"
            >
              <span className="block font-black text-xl text-black leading-none">{profile?.following || "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">following</span>
            </button>
            <div className="text-center sm:text-left hidden xs:block">
              <span className="block font-black text-xl text-black leading-none">{isApproved ? userSubmissions.filter(s => s.status === 'approved').length : "0"}</span>
              <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">vouchers</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
               <p className="font-black text-base uppercase text-black">{profile?.display_name || "Agent Node"}</p>
               <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1">
                 <p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest bg-[#834bf1]/5 inline-block px-3 py-1 border border-[#834bf1]/20">
                   {profile?.niche || "CREATOR NODE"}
                 </p>
                 <p className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-black/10 ${isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                   {isApproved ? 'VERIFIED_NODE' : profile?.card_status === 'pending' ? 'SYNC_IN_PROGRESS' : 'SYNC_REQUIRED'}
                 </p>
               </div>
            </div>
            {profile?.bio && (
              <div className="max-w-md mx-auto sm:mx-0 border-l-[6px] border-[#ffde59] pl-6 py-2 bg-slate-50 shadow-inner">
                <p className={`${getBioFontSize(profile.bio)} font-black text-black/70 uppercase tracking-tight leading-relaxed whitespace-pre-wrap italic`}>
                  {profile.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[#834bf1] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] text-white">
          <div className="flex justify-between items-start mb-2">
            <Wallet size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-white/20 px-1">ASSETS</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{profile?.reelcoins?.toLocaleString() || "0"}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">ReelCoins</p>
        </div>
        <div className="bg-[#ffde59] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] text-black">
          <div className="flex justify-between items-start mb-2">
            <Zap size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-black/10 px-1">OPS</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{isApproved ? missions.length : "0"}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">Active</p>
        </div>
      </div>

      {/* DUAL SECTION CREATOR GRID */}
      {renderCreatorNetwork()}

      <div className="bg-white border-[3px] sm:border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000]">
        <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 flex items-center gap-2 text-black">
          <History size={14} /> Operational Timeline
        </h4>
        <div className="space-y-4">
          {userSubmissions.slice(0, 5).map((sub, i) => (
            <div key={`sub-${i}`} className="flex items-center gap-3 sm:gap-4 border-b-2 border-slate-50 pb-4 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center shrink-0 ${sub.status === 'approved' ? 'bg-emerald-400' : 'bg-[#ffde59]'}`}>
                {sub.status === 'approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase truncate">{missions.find(m => String(m.id) === String(sub.mission_id))?.title || 'Mission Entry'}</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">{new Date(sub.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase ${sub.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'}`}>{sub.status}</span>
            </div>
          ))}

          {userSubmissions.length === 0 && (
            <p className="text-[9px] font-black uppercase opacity-20 text-center py-4 italic">No recent transmissions.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSync = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 text-black pb-20">
       {isEditing ? (
         <div className="bg-white border-[3px] sm:border-[4px] border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] space-y-8">
           <div className="flex flex-col items-center gap-6">
             <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
               <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 border-[4px] border-black overflow-hidden shadow-[4px_4px_0px_0px_#834bf1] relative">
                 <img src={previewUrl || profile?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                   <Camera size={24} />
                 </div>
               </div>
               <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
               <div className="absolute -bottom-2 -right-2 bg-[#ffde59] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_#000]">
                 <Pencil size={14} />
               </div>
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-black/40">Tap Image to Change Node Asset</p>
           </div>

           <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Identity Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" placeholder="AGENT NAME" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Protocol Handle</label>
                  <input value={editHandle} onChange={e => setEditHandle(e.target.value)} className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" placeholder="@handle" />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1] flex items-center gap-2"><Hash size={12}/> Current Niche</label>
                  <input value={editNiche} onChange={e => setEditNiche(e.target.value)} className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" placeholder="e.g. FASHION" />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1] flex items-center gap-2"><UsersIcon size={12}/> Follower Count</label>
                  <input type="number" value={editFollowers} onChange={e => setEditFollowers(parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" placeholder="0" />
                </div>
             </div>

             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Operational Bio</label>
               <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={5} className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm uppercase tracking-tight focus:bg-white transition-all outline-none resize-none text-black leading-relaxed" placeholder="MISSION PARAMETERS & INTEL..." />
               <p className="text-[8px] font-black text-black/30 uppercase mt-2 text-right">{editBio.length} / 500 CHARS</p>
             </div>
           </div>

           <div className="flex gap-4">
             <button onClick={() => setIsEditing(false)} className="flex-1 py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all text-black">
               Abort Sync
             </button>
             <button disabled={isUploading} onClick={handleSaveProfile} className="flex-1 py-4 bg-[#834bf1] text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2">
               {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
               Commit Changes
             </button>
           </div>
         </div>
       ) : (
         <>
           <div className="bg-white border-[3px] sm:border-[4px] border-black p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-[6px_6px_0px_0px_#000]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 border-[2px] sm:border-[3px] border-black overflow-hidden shadow-[2px_2px_0px_0px_#834bf1]">
                <img src={previewUrl || profile?.photo_url || currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                 <h3 className="text-lg sm:text-xl font-black uppercase italic text-black truncate">{profile?.display_name || "AGENT"}</h3>
                 <p className="text-[8px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest truncate">{currentUser?.email}</p>
                 <p className="text-[9px] font-black text-[#834bf1] mt-1">{profile?.handle ? `@${profile.handle}` : 'unlinked'}</p>
              </div>
           </div>

           {profile?.bio && (
             <div className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#ffde59]">
               <h4 className="text-[8px] font-black uppercase tracking-widest text-black/40 mb-2">Operational Bio</h4>
               <p className={`${getBioFontSize(profile.bio)} font-bold uppercase tracking-tight leading-relaxed text-black whitespace-pre-wrap`}>{profile.bio}</p>
             </div>
           )}

           <div className="space-y-3 sm:space-y-4">
              <button onClick={startEditing} className="w-full bg-white border-[3px] border-black p-4 sm:p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[9px] sm:text-[10px] tracking-widest group text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                 <div className="flex items-center gap-3 sm:gap-4">
                   <Settings size={18} /> Edit Sync Profile
                 </div>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
         </>
       )}
       {!isEditing && <button onClick={() => auth.signOut()} className="w-full bg-rose-500 text-white border-[3px] sm:border-[4px] border-black py-5 sm:py-6 shadow-[6px_6px_0px_0px_#000] font-black uppercase text-[10px] tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"><LogOut size={18} /><span>TERMINATE SESSION</span></button>}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-lexend flex flex-col overflow-x-hidden text-black">
      {rewardAmount !== null && <RCNotificationModal amount={rewardAmount} onClose={clearReward} subtitle={latestTxMetadata.reason || "Admin just dropped some loot into your wallet."} coverImage={latestTxMetadata.image || undefined} />}
      {selectedMission && <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />}
      {selectedVoucher && < VoucherModal voucher={selectedVoucher} userBalance={profile?.reelcoins || 0} isRedeeming={isProcessing === selectedVoucher.id} isSuccess={redemptionSuccessId === selectedVoucher.id} onClose={() => { setSelectedVoucher(null); setRedemptionSuccessId(null); }} onRedeem={handleRedeemReward} />}
      
      {viewingAgent && (
        <AgentDossierModal 
          agent={viewingAgent} 
          isFollowing={followingIds.has(viewingAgent.firebase_uid)}
          isRequested={sentRequestUids.has(viewingAgent.firebase_uid)}
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

      <header className="bg-white border-b-[3px] sm:border-b-4 border-black p-3 sm:p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md shrink-0 text-black">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#834bf1] rotate-3 shrink-0">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black italic uppercase font-display leading-none text-black">REELYWOOD<span className="text-[#834bf1]">HUB</span></h1>
            <p className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-30">Agent Node v4.5</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#ffde59] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[8px] font-black uppercase text-black">LIVE_SYNC_OK</span></div>
          <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="relative p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black active:translate-x-0.5 active:translate-y-0.5 transition-all">
            <Bell size={18} />
            {incomingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black animate-bounce"></span>}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full pb-44 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {activeTab === 'hub' && renderHub()}
        
        {activeTab === 'card' && (
          !isApproved 
            ? <LockedSection title="CREATOR_CARD" status={profile?.card_status} />
            : <div className="flex flex-col items-center justify-start min-h-[60dvh] py-4 sm:py-8 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-full max-w-[320px] sm:max-w-[340px] flex justify-center">
                  <div className="w-full relative h-[480px] sm:h-[520px]">
                    <ThreeDCard name={profile?.display_name || "AGENT"} handle={profile?.handle || "unlinked"} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto px-2">
                  <button className="bg-white border-[3px] border-black py-4 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_#000] transition-all group active:scale-95">
                    <QrCode size={24} />
                    <span className="text-[8px] uppercase tracking-widest text-black">QR Node</span>
                  </button>
                  <button className="bg-black text-white border-[3px] border-black py-4 flex flex-col items-center gap-2 shadow-[4px_4px_0px_0px_#834bf1] transition-all group active:scale-95">
                    <Share2 size={24} className="text-[#ffde59]" />
                    <span className="text-[8px] uppercase tracking-widest text-[#ffde59]">Share ID</span>
                  </button>
                </div>
              </div>
        )}

        {activeTab === 'missions' && (
          !isApproved
            ? <LockedSection title="MISSION_GRID" status={profile?.card_status} />
            : <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-black uppercase italic font-display flex items-center gap-3 text-black">
                  <Zap className="text-[#834bf1]" size={18} /> Operational Grid
                </h3>
                <div className="space-y-4">
                  {missions.length === 0 ? (
                    <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">GRID_SILENT</div>
                  ) : (
                    missions.map(m => {
                      const submission = userSubmissions.find(s => String(s.mission_id) === String(m.id));
                      const isApprovedSub = submission?.status === 'approved' || submission?.status === 'completed';
                      const isPendingSub = submission?.status === 'pending' || submission?.status === 'verifying';
                      const isAnySubmitted = isApprovedSub || isPendingSub;
                      
                      return (
                        <div key={m.id} className={`border-[4px] p-5 shadow-[4px_4px_0px_0px] relative overflow-hidden flex flex-col transition-all ${isApprovedSub ? 'bg-[#4ade80] border-black shadow-black' : isPendingSub ? 'bg-[#ffde59] border-black shadow-black' : 'bg-white border-black shadow-black'}`}>
                          {isApprovedSub && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] z-20 pointer-events-none opacity-80">
                              <div className="border-[5px] border-black px-6 py-2 flex items-center justify-center bg-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                <span className="font-display font-black text-3xl text-black uppercase italic">MISSION COMPLETE</span>
                              </div>
                            </div>
                          )}
                          <div className={`flex justify-between items-start mb-4 relative z-10 ${isApprovedSub ? 'opacity-40' : ''}`}>
                            <div className="w-10 h-10 bg-white border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_#000]">{m.partner_brands?.logo_url ? <img src={m.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Building2 size={18} className="text-black" />}</div>
                            <div className="px-2 py-1 font-black text-[7px] border-[2px] shadow-[2px_2px_0px_0px_#000] bg-black text-white border-black">{isApprovedSub ? 'VERIFIED_ENTRY' : isPendingSub ? 'QC_IN_PROGRESS' : `+${m.reward_amount} RC`}</div>
                          </div>
                          <h4 className={`text-base font-black uppercase italic font-display leading-tight text-black relative z-10 ${isApprovedSub ? 'opacity-30 line-through decoration-[3px]' : ''}`}>{m.title}</h4>
                          <p className={`text-[9px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2 relative z-10 ${isApprovedSub ? 'opacity-20' : ''}`}>{m.description}</p>
                          <button 
                            onClick={() => !isAnySubmitted && setSelectedMission(m)} 
                            disabled={isAnySubmitted}
                            className={`w-full py-4 mt-6 border-[3px] font-black uppercase text-[9px] tracking-widest shadow-[3px_3px_0px_0px] text-white transition-all relative z-10 ${isApprovedSub ? 'bg-black/20 border-black/40 text-black/40 cursor-not-allowed shadow-none' : isPendingSub ? 'bg-black/10 border-black/30 text-black/30 cursor-wait shadow-none' : 'bg-[#834bf1] border-black hover:translate-x-0.5 hover:translate-y-0.5'}`}
                          >
                            {isApprovedSub ? 'MISSION COMPLETED' : isPendingSub ? 'TRANSMISSION CACHED' : 'OPEN BRIEF'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
        )}

        {activeTab === 'perks' && (
          !isApproved
            ? <LockedSection title="REWARD_NODE" status={profile?.card_status} />
            : <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-black uppercase italic font-display flex items-center gap-3 text-black">
                  <Gift className="text-[#ffde59] fill-current stroke-black stroke-2" size={18} /> Reward Node
                </h3>
                <div className="space-y-4">
                  {rewards.length === 0 ? (
                    <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">VAULT_EMPTY</div>
                  ) : (
                    rewards.map(r => {
                      const isRedeemed = myRedemptions.includes(String(r.id)) || r.status === 'redeemed';
                      return (
                        <div key={r.id} className={`border-[3px] p-4 flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px] relative overflow-hidden transition-all ${isRedeemed ? 'bg-slate-200 border-slate-400 grayscale opacity-60 pointer-events-none' : 'bg-white border-black shadow-[#ffde59]'}`}>
                          {isRedeemed && (
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                              <div className="border-[8px] border-red-600 px-6 py-2 text-4xl font-black text-red-600 uppercase tracking-widest -rotate-12 opacity-80 font-display italic">REDEEMED</div>
                            </div>
                          )}
                          <div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_#000]">{r.partner_brands?.logo_url ? <img src={r.partner_brands.logo_url} className="w-full h-full object-contain" /> : <Gift size={18} className="text-black" />}</div><div className="min-w-0"><h4 className={`text-xs font-black uppercase italic truncate ${isRedeemed ? 'line-through text-slate-400' : 'text-black'}`}>{r.title}</h4><p className="text-[7px] font-black uppercase text-black/30 tracking-widest">{r.partner_brands?.name || 'Reelywood'}</p></div></div><div className="flex flex-col items-end gap-1 shrink-0"><span className={`text-base font-black italic ${isRedeemed ? 'text-slate-400' : 'text-[#834bf1]'}`}>{r.cost} RC</span><button onClick={() => !isRedeemed && setSelectedVoucher(r)} disabled={isProcessing === r.id || isRedeemed} className={`px-3 py-2 border-[2px] font-black uppercase text-[7px] tracking-widest shadow-[2px_2px_0px_0px_#000] transition-all ${isRedeemed ? 'bg-slate-700 text-slate-500 border-slate-800' : 'bg-black text-white'}`}>{isRedeemed ? 'CLAIMED' : 'REDEEM'}</button></div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
        )}

        {activeTab === 'sync' && renderSync()}
      </main>

      <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-md bg-black border-[3px] border-white p-1 pb-[calc(4px+env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB', locked: false },
          { id: 'card', icon: CreditCard, label: 'CARD', locked: !isApproved },
          { id: 'missions', icon: Zap, label: 'MISSIONS', locked: !isApproved },
          { id: 'perks', icon: Gift, label: 'PERKS', locked: !isApproved },
          { id: 'sync', icon: User, label: 'SYNC', locked: false }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : tab.locked ? 'text-white/20' : 'text-white/40'}`}
          >
            <div className="relative">
              <tab.icon size={18} strokeWidth={tab.id === activeTab ? 3 : 2} />
              {tab.locked && <Lock size={8} className="absolute -top-1 -right-1 text-rose-500" strokeWidth={3} />}
            </div>
            <span className="text-[6px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      <footer className="text-center pt-8 pb-44 opacity-10 shrink-0 text-black">
        <p className="text-[7px] font-black uppercase tracking-[0.4em]">PRODUCTION_NODE_v4.5.0 • ENCRYPTED</p>
      </footer>
    </div>
  );
};
