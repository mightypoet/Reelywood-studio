
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
  AlertCircle, Copy, Check
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

// --- Dedicated Voucher Modal Component ---
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
      <div className="relative w-full max-w-lg bg-white border-[6px] border-black shadow-[24px_24px_0px_0px_#ffde59] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
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
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<string[]>([]);
  const [latestTxReason, setLatestTxReason] = useState<string | null>(null);
  
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sound Notification Integration
  const { playSound } = useSoundNotification();

  // Balance Watcher Hook
  const { rewardAmount, clearReward } = useRCBalanceWatcher({
    currentBalance: profile?.reelcoins,
    storageKey: 'user_last_rc_balance'
  });

  const fetchOperationalGrid = useCallback(async (user: FirebaseUser) => {
    if (!supabase) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', user.uid)
        .single();

      setProfile(profileData);

      // Fetch Latest Transaction to get context/reason for balance changes
      const { data: latestTx } = await supabase
        .from('transactions')
        .select('description, amount')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestTx && latestTx.amount > 0) {
        setLatestTxReason(latestTx.description);
      } else {
        setLatestTxReason(null);
      }

      const { data: allMissions } = await supabase
        .from('missions')
        .select('*, partner_brands(*)');

      let currentMissions: any[] = [];
      if (allMissions) {
        currentMissions = allMissions.filter(m => {
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

      let currentRewards: any[] = [];
      if (rRes.data) {
        currentRewards = rRes.data.filter(r => {
          const isGlobal = !r.assigned_to || (Array.isArray(r.assigned_to) && r.assigned_to.length === 0);
          const isAssigned = Array.isArray(r.assigned_to) && (r.assigned_to.includes(user.uid));
          return isGlobal || isAssigned;
        });
        setRewards(currentRewards);
      }
      
      if (sRes.data) setUserSubmissions(sRes.data);
      if (redRes.data) setMyRedemptions(redRes.data.map((r: any) => String(r.reward_id)));

    } catch (err) {
      console.error("GRID_SYNC_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // REALTIME SYNC HANDLER
  useEffect(() => {
    if (!supabase || !currentUser) return;

    const client = supabase;

    const syncChannel = client.channel(`user-sync-${currentUser.uid}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'missions' 
      }, (payload) => {
        const m = payload.new;
        const isGlobal = !m.assigned_to || (Array.isArray(m.assigned_to) && m.assigned_to.length === 0);
        const isAssigned = Array.isArray(m.assigned_to) && m.assigned_to.includes(currentUser.uid);
        
        if (isGlobal || isAssigned) {
          playSound();
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'rewards' 
      }, (payload) => {
        const r = payload.new;
        const isGlobal = !r.assigned_to || (Array.isArray(r.assigned_to) && r.assigned_to.length === 0);
        const isAssigned = Array.isArray(r.assigned_to) && r.assigned_to.includes(currentUser.uid);
        
        if (isGlobal || isAssigned) {
          playSound();
          fetchOperationalGrid(currentUser);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `firebase_uid=eq.${currentUser.uid}`
      }, (payload) => {
        // Force refresh to trigger watcher and fetch latest transaction reason
        fetchOperationalGrid(currentUser);
      })
      .subscribe();

    return () => {
      client.removeChannel(syncChannel);
    };
  }, [currentUser, playSound, fetchOperationalGrid]);

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
    
    setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, status: 'redeemed' } : r));

    setIsProcessing(reward.id);
    try {
      const { error: rpcError } = await supabase.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });
      if (rpcError) throw rpcError;

      const { error } = await supabase
        .from('rewards')
        .update({ 
          status: 'redeemed'
        })
        .eq('id', reward.id);

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      if ('vibrate' in navigator) navigator.vibrate(200);
      setRedemptionSuccessId(reward.id);
      setMyRedemptions(prev => [...prev, String(reward.id)]);
      
      if (currentUser) fetchOperationalGrid(currentUser);

    } catch (err: any) {
      alert("Redemption Failed: " + (err.message || "Unknown error"));
      setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, status: 'active' } : r));
    } finally {
      setIsProcessing(null);
    }
  };

  const startEditing = () => {
    setEditName(profile?.display_name || '');
    setEditHandle(profile?.handle || '');
    setEditBio(profile?.bio || '');
    setIsEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSaveProfile = async () => {
    if (!supabase || !currentUser) return;
    setIsUploading(true);
    try {
      let photoUrl = profile?.photo_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${currentUser.uid}/${Date.now()}_avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        /* Comment: Fixed variable name from 'fileName' to 'filePath' to match its definition */
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        photoUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: editName,
          handle: editHandle,
          bio: editBio,
          photo_url: photoUrl
        })
        .eq('firebase_uid', currentUser.uid);

      if (updateError) throw updateError;

      await fetchOperationalGrid(currentUser);
      setIsEditing(false);
      setAvatarFile(null);
      setPreviewUrl(null);
      alert("PROFILE_SYNCED: Identity node updated.");
    } catch (err: any) {
      alert("SYNC_FAILURE: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Syncing Node...</p>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[#834bf1] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-white">
          <div className="flex justify-between items-start mb-2">
            <Wallet size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-white/20 px-1">ASSETS</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{profile?.reelcoins?.toLocaleString() || "0"}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">ReelCoins</p>
        </div>
        <div className="bg-[#ffde59] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-black">
          <div className="flex justify-between items-start mb-2">
            <Zap size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-black/10 px-1">OPS</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{missions.length}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">Active</p>
        </div>
      </div>

      <div className="bg-white border-[3px] sm:border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
        <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 flex items-center gap-2 text-black">
          <History size={14} /> Operational Timeline
        </h4>
        <div className="space-y-4">
          {userSubmissions.slice(0, 3).map((sub, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 border-b-2 border-slate-50 pb-4 last:border-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center shrink-0 ${sub.status === 'approved' ? 'bg-emerald-400' : 'bg-[#ffde59]'}`}>
                {sub.status === 'approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase truncate">{missions.find(m => m.id === sub.mission_id)?.title || 'Mission Entry'}</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">{new Date(sub.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase ${sub.status === 'approved' ? 'text-emerald-600' : 'text-amber-500'}`}>{sub.status}</span>
            </div>
          ))}
          {userSubmissions.length === 0 && <p className="text-[9px] font-black uppercase opacity-20 text-center py-4 italic">No recent transmissions.</p>}
        </div>
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="flex flex-col items-center justify-start min-h-[60dvh] py-4 sm:py-8 space-y-8 sm:space-y-12 animate-in zoom-in-95 duration-500">
      {!isApproved ? (
         <div className="bg-[#ffde59] border-[4px] sm:border-[5px] border-black p-8 sm:p-10 text-center shadow-[8px_8px_0px_0px_#000] sm:shadow-[10px_10px_0px_0px_#000] w-full max-w-md mx-auto">
            <Lock size={40} className="mx-auto mb-6" strokeWidth={3} />
            <h3 className="text-xl sm:text-2xl font-black uppercase italic font-display">Identity Syncing</h3>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-4">Node verification in progress. estimated time: 24h.</p>
         </div>
      ) : (
        <>
          <div className="w-full max-w-[320px] sm:max-w-[340px] flex justify-center">
            <div className="w-full relative h-[480px] sm:h-[520px]">
              <ThreeDCard name={profile?.display_name || "AGENT"} handle={profile?.handle || "unlinked"} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-md mx-auto px-2">
            <button className="bg-white border-[3px] sm:border-[4px] border-black py-4 sm:py-5 px-3 sm:px-4 flex flex-col items-center gap-2 sm:gap-3 shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 group">
              <QrCode size={24} strokeWidth={3} className="group-hover:rotate-6 transition-transform" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center">QR Node</span>
            </button>
            <button className="bg-black text-white border-[3px] sm:border-[4px] border-black py-4 sm:py-5 px-3 sm:px-4 flex flex-col items-center gap-2 sm:gap-3 shadow-[4px_4px_0px_0px_#834bf1] sm:shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 group">
              <Share2 size={24} strokeWidth={3} className="text-[#ffde59] group-hover:scale-110 transition-transform" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center text-[#ffde59]">Share ID</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h3 className="text-lg sm:text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
        <Zap className="text-[#834bf1]" size={18} /> Operational Grid
      </h3>
      <div className="space-y-4 sm:space-y-6">
        {missions.length === 0 ? (
          <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">GRID_SILENT</div>
        ) : (
          missions.map(m => {
            const submission = userSubmissions.find(s => String(s.mission_id) === String(m.id));
            const isApprovedSub = submission?.status === 'approved' || submission?.status === 'completed';
            const isPendingSub = submission?.status === 'pending' || submission?.status === 'verifying';
            const isAnySubmitted = isApprovedSub || isPendingSub;
            
            const brand = m.partner_brands;

            return (
              <div 
                key={m.id} 
                className={`border-[4px] p-5 sm:p-6 shadow-[4px_4px_0px_0px] sm:shadow-[6px_6px_0px_0px] relative overflow-hidden flex flex-col transition-all duration-300 ${
                  isApprovedSub 
                    ? 'bg-[#4ade80] border-black shadow-black' 
                    : isPendingSub 
                      ? 'bg-[#ffde59] border-black shadow-black' 
                      : 'bg-white border-black shadow-black'
                }`}
              >
                {isApprovedSub && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] z-20 pointer-events-none opacity-80">
                    <div className="border-[5px] border-black px-6 py-2 rounded-none flex items-center justify-center bg-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                      <span className="font-display font-black text-3xl sm:text-4xl text-black uppercase tracking-tighter italic">MISSION COMPLETE</span>
                    </div>
                  </div>
                )}

                <div className={`flex justify-between items-start mb-4 relative z-10 ${isApprovedSub ? 'opacity-40' : ''}`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_#000]">
                    {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" /> : <Building2 size={18} />}
                  </div>
                  <div className={`px-2 py-1 font-black text-[7px] sm:text-[9px] border-[2px] shadow-[2px_2px_0px_0px_#000] bg-black text-white border-black`}>
                    {isApprovedSub ? 'VERIFIED_ENTRY' : isPendingSub ? 'QC_IN_PROGRESS' : `+${m.reward_amount} RC`}
                  </div>
                </div>
                
                <h4 className={`text-base sm:text-lg font-black uppercase italic font-display leading-tight text-black relative z-10 ${isApprovedSub ? 'opacity-30 line-through decoration-[3px] decoration-black' : ''}`}>
                  {m.title}
                </h4>
                <p className={`text-[9px] sm:text-[10px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2 relative z-10 ${isApprovedSub ? 'opacity-20' : ''}`}>
                  {m.description}
                </p>
                
                <button 
                  onClick={() => !isAnySubmitted && setSelectedMission(m)}
                  disabled={isAnySubmitted || !isApproved}
                  className={`w-full py-4 mt-6 border-[3px] font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-[3px_3px_0px_0px] text-white transition-all relative z-10 ${
                    isApprovedSub 
                      ? 'bg-black/20 border-black/40 text-black/40 cursor-not-allowed shadow-none' 
                      : isPendingSub 
                        ? 'bg-black/10 border-black/30 text-black/30 cursor-wait shadow-none' 
                        : !isApproved 
                          ? 'bg-slate-300 border-slate-400 cursor-not-allowed shadow-none' 
                          : 'bg-[#834bf1] border-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
                  }`}
                >
                  {!isApproved ? 'LOCKED (SYNC REQ)' : isApprovedSub ? 'MISSION COMPLETED' : isPendingSub ? 'TRANSMISSION CACHED' : 'OPEN BRIEF'}
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
      <h3 className="text-lg sm:text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
        <Gift className="text-[#ffde59] fill-current stroke-black stroke-2" size={18} /> Reward Node
      </h3>
      <div className="space-y-4">
        {rewards.length === 0 ? (
          <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">VAULT_EMPTY</div>
        ) : (
          rewards.map(r => {
            const isRedeemed = myRedemptions.includes(String(r.id)) || r.status === 'redeemed';
            const brand = r.partner_brands;
            return (
              <div key={r.id} className={`border-[3px] sm:border-[4px] p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px] sm:shadow-[5px_5px_0px_0px] relative overflow-hidden transition-all duration-300 ${isRedeemed ? 'bg-slate-200 border-slate-400 shadow-none grayscale opacity-60 pointer-events-none select-none' : 'bg-white border-black shadow-[#ffde59]'}`}>
                {isRedeemed && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="border-[8px] border-red-600 px-6 py-2 text-4xl font-black text-red-600 uppercase tracking-widest -rotate-12 opacity-80 shadow-sm font-display italic" style={{ mixBlendMode: 'multiply' }}>
                      REDEEMED
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-2 border-black flex items-center justify-center p-1 shadow-[2px_2px_0px_0px_#000]">
                     {brand?.logo_url ? <img src={brand.logo_url} className="w-full h-full object-contain" /> : <Gift size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-black uppercase italic truncate ${isRedeemed ? 'line-through text-slate-400' : 'text-black'}`}>{r.title}</h4>
                    <p className="text-[7px] sm:text-[9px] font-black uppercase text-black/30 tracking-widest">{brand?.name || 'Reelywood'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
                  <span className={`text-base sm:text-lg font-black italic ${isRedeemed ? 'text-slate-400' : 'text-[#834bf1]'}`}>{r.cost} RC</span>
                  <button 
                    onClick={() => !isRedeemed && setSelectedVoucher(r)}
                    disabled={isProcessing === r.id || isRedeemed || !isApproved}
                    className={`px-3 sm:px-4 py-2 border-[2px] font-black uppercase text-[7px] sm:text-[8px] tracking-[0.15em] shadow-[2px_2px_0px_0px_#000] transition-all active:scale-95 ${isRedeemed ? 'bg-slate-700 text-slate-500 border-slate-800' : 'bg-black text-white'}`}
                  >
                    {isRedeemed ? 'CLAIMED' : !isApproved ? 'LOCKED' : 'REDEEM'}
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
    <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-5 duration-500 text-black">
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
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Identity Name</label>
               <input 
                 value={editName} 
                 onChange={e => setEditName(e.target.value)}
                 className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" 
                 placeholder="AGENT NAME"
               />
             </div>
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Protocol Handle</label>
               <input 
                 value={editHandle} 
                 onChange={e => setEditHandle(e.target.value)}
                 className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-sm uppercase tracking-widest focus:bg-white transition-all outline-none text-black" 
                 placeholder="@handle"
               />
             </div>
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 text-[#834bf1]">Operational Bio</label>
               <textarea 
                 value={editBio} 
                 onChange={e => setEditBio(e.target.value)}
                 rows={3}
                 className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm uppercase tracking-tight focus:bg-white transition-all outline-none resize-none text-black" 
                 placeholder="MISSION PARAMETERS & INTEL..."
               />
             </div>
           </div>

           <div className="flex gap-4">
             <button 
               onClick={() => setIsEditing(false)}
               className="flex-1 py-4 border-[3px] border-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all text-black"
             >
               Abort Sync
             </button>
             <button 
               disabled={isUploading}
               onClick={handleSaveProfile}
               className="flex-1 py-4 bg-[#834bf1] text-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
             >
               {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
               Commit Changes
             </button>
           </div>
         </div>
       ) : (
         <>
           <div className="bg-white border-[3px] sm:border-[4px] border-black p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-[6px_6px_0px_0px_#000]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 border-[2px] sm:border-[3px] border-black overflow-hidden shadow-[2px_2px_0px_0px_#834bf1] sm:shadow-[3px_3px_0px_0px_#834bf1]">
                <img src={profile?.photo_url || currentUser?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.uid}`} className="w-full h-full object-cover" />
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
               <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed text-black">{profile.bio}</p>
             </div>
           )}

           <div className="space-y-3 sm:space-y-4">
              <button 
                onClick={startEditing}
                className="w-full bg-white border-[3px] border-black p-4 sm:p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[9px] sm:text-[10px] tracking-widest group text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                 <div className="flex items-center gap-3 sm:gap-4">
                   <Settings size={18} /> Edit Sync Profile
                 </div>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full bg-white border-[3px] border-black p-4 sm:p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[9px] sm:text-[10px] tracking-widest group text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                 <div className="flex items-center gap-3 sm:gap-4">
                   <Target size={18} /> Support Transmission
                 </div>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
         </>
       )}

       {!isEditing && (
         <button 
            onClick={() => auth.signOut()}
            className="w-full bg-rose-500 text-white border-[3px] sm:border-[4px] border-black py-5 sm:py-6 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4"
          >
            <LogOut size={18} strokeWidth={3} />
            <span>TERMINATE SESSION</span>
          </button>
       )}
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 font-lexend flex flex-col overflow-x-hidden text-black">
      {rewardAmount !== null && (
        <RCNotificationModal 
          amount={rewardAmount} 
          onClose={clearReward} 
          subtitle={latestTxReason || "Admin just dropped some loot into your wallet."}
        />
      )}
      
      {selectedMission && (
        <MissionModal mission={selectedMission} user={currentUser} onClose={() => { setSelectedMission(null); fetchOperationalGrid(currentUser!); }} />
      )}

      {selectedVoucher && (
        <VoucherModal 
          voucher={selectedVoucher} 
          userBalance={profile?.reelcoins || 0}
          isRedeeming={isProcessing === selectedVoucher.id}
          isSuccess={redemptionSuccessId === selectedVoucher.id}
          onClose={() => { setSelectedVoucher(null); setRedemptionSuccessId(null); }}
          onRedeem={handleRedeemReward}
        />
      )}

      <header className="bg-white border-b-[3px] sm:border-b-4 border-black p-3 sm:p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md shrink-0">
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
          <div className="hidden sm:flex items-center gap-2 bg-[#ffde59] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase text-black">LIVE_SYNC_OK</span>
          </div>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Bell size={18} />
          </button>
        </div>
      </header>

      <main 
        className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full pb-44 overflow-y-auto" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeTab === 'hub' && renderHub()}
        {activeTab === 'card' && renderCard()}
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'perks' && renderPerks()}
        {activeTab === 'sync' && renderSync()}
      </main>

      <nav className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-md bg-black border-[3px] sm:border-4 border-white p-1 sm:p-2 pb-[calc(4px+env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'card', icon: CreditCard, label: 'CARD' },
          { id: 'missions', icon: Zap, label: 'MISSIONS' },
          { id: 'perks', icon: Gift, label: 'PERKS' },
          { id: 'sync', icon: User, label: 'SYNC' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={18} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[6px] sm:text-[7px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      <footer className="text-center pt-8 sm:pt-10 pb-44 sm:pb-40 opacity-10 shrink-0">
        <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-black">PRODUCTION_NODE_v4.5.0 • ENCRYPTED</p>
      </footer>
    </div>
  );
};
