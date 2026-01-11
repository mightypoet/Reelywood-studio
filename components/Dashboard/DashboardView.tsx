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
  PartyPopper,
  Zap,
  Sparkles,
  Gift,
  Target,
  Info,
  MapPin
} from 'lucide-react';
import { MissionModal } from './MissionModal';

interface DashboardViewProps {
  onBack: () => void;
}

// --- 1. THE PHYSICS GAME COMPONENT (Background) ---
const ReelywoodSlingshot: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const GRAVITY = 0.6;
    const FRICTION = 0.98;
    const BOUNCE = 0.6;

    let bird = {
      x: width * 0.2,
      y: height * 0.65,
      vx: 0,
      vy: 0,
      radius: 28,
      isDragging: false,
      isFlying: false,
      startX: width * 0.2,
      startY: height * 0.65
    };

    let boxes: any[] = [];
    const colors = ['#834bf1', '#ffde59', '#111111'];

    const initLevel = () => {
      boxes = [];
      const boxSize = 55;
      const startX = width * 0.75; 
      const groundY = height;
      
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= row; col++) {
           boxes.push({
             x: startX + (col * (boxSize + 2)) - (row * boxSize * 0.5),
             y: groundY - 60 - ((6 - row) * (boxSize + 2)),
             w: boxSize,
             h: boxSize,
             vx: 0,
             vy: 0,
             rotation: 0,
             rv: 0,
             color: colors[Math.floor(Math.random() * colors.length)],
             isHit: false
           });
        }
      }
    };

    initLevel();

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
    };

    const onStart = (e: any) => {
      const pos = getPos(e);
      const dist = Math.hypot(pos.x - bird.x, pos.y - bird.y);
      if (dist < 80 && !bird.isFlying) bird.isDragging = true;
    };

    const onMove = (e: any) => {
      if (!bird.isDragging) return;
      const pos = getPos(e);
      const dx = pos.x - bird.startX;
      const dy = pos.y - bird.startY;
      const maxDist = 150;
      const stretch = Math.hypot(dx, dy);
      if (stretch > maxDist) {
        const angle = Math.atan2(dy, dx);
        bird.x = bird.startX + Math.cos(angle) * maxDist;
        bird.y = bird.startY + Math.sin(angle) * maxDist;
      } else {
        bird.x = pos.x;
        bird.y = pos.y;
      }
    };

    const onEnd = () => {
      if (!bird.isDragging) return;
      bird.isDragging = false;
      bird.isFlying = true;
      bird.vx = (bird.startX - bird.x) * 0.16;
      bird.vy = (bird.startY - bird.y) * 0.16;
    };

    canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
      for (let i = 0; i < height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

      if (bird.isDragging) {
        ctx.beginPath();
        ctx.moveTo(bird.startX, bird.startY);
        ctx.lineTo(bird.x, bird.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (bird.isFlying) {
        bird.vy += GRAVITY;
        bird.vx *= FRICTION;
        bird.vy *= FRICTION;
        bird.x += bird.vx;
        bird.y += bird.vy;

        if (bird.y + bird.radius > height - 20) {
          bird.y = height - 20 - bird.radius;
          bird.vy *= -BOUNCE;
        }
        if (bird.x > width || bird.x < 0 || (Math.abs(bird.vx) < 0.2 && Math.abs(bird.vy) < 0.2 && bird.y > height - 100)) {
          setTimeout(() => {
            bird.isFlying = false;
            bird.x = bird.startX;
            bird.y = bird.startY;
          }, 2000);
        }
      } else if (!bird.isDragging) {
        bird.x += (bird.startX - bird.x) * 0.1;
        bird.y += (bird.startY - bird.y) * 0.1;
      }

      boxes.forEach(box => {
        if (box.isHit) {
          box.vy += GRAVITY;
          box.x += box.vx;
          box.y += box.vy;
          box.rotation += box.rv;
          if (box.y + box.h > height - 20) { box.y = height - 20 - box.h; box.vy *= -0.4; box.vx *= 0.8; }
        }

        if (bird.isFlying && bird.x + bird.radius > box.x && bird.x - bird.radius < box.x + box.w && 
            bird.y + bird.radius > box.y && bird.y - bird.radius < box.y + box.h) {
          box.isHit = true;
          box.vx = bird.vx * 0.7;
          box.vy = bird.vy * 0.7;
          box.rv = (Math.random() - 0.5) * 0.2;
          bird.vx *= -0.4;
        }

        ctx.save();
        ctx.translate(box.x + box.w/2, box.y + box.h/2);
        ctx.rotate(box.rotation);
        ctx.fillStyle = box.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(-box.w/2, -box.h/2, box.w, box.h);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Bird
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.beginPath(); ctx.arc(0, 0, bird.radius, 0, Math.PI * 2); 
      ctx.fillStyle = '#834bf1'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-8, -5, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(8, -5, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(-8, -4, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(8, -4, 4, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isMobile]);

  if (isMobile) return <div className="absolute inset-0 bg-[#f8f8f8]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px', opacity: 0.05}} />;
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#f8f8f8] cursor-crosshair" />;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  
  // --- NOTIFICATION STATE ---
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [selectedMission, setSelectedMission] = useState<any>(null);
  
  const [toast, setToast] = useState<{ 
    show: boolean; 
    title: string; 
    message: string;
    image: string;
    location: string;
  }>({ 
    show: false, title: '', message: '', image: '', location: '' 
  });

  const fetchUserData = () => {
    if (currentUser) {
      fetchDashboardData(currentUser);
      fetchNotifications(currentUser);
      fetchMySubmissions(currentUser);
    }
  };

  const fetchNotifications = async (user: FirebaseUser) => {
    if (!user || !supabase) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.uid},user_id.eq.global`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchDashboardData(user);
        fetchNotifications(user);
        fetchMySubmissions(user);

        // --- INTELLIGENT AUTO-REFRESH (REALTIME LISTENER) ---
        if (!supabase) return; 

        const channel = supabase
          .channel('user-dashboard-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'missions' }, () => {
            console.log('⚡ New Mission Detected!');
            fetchDashboardData(user);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, () => {
            fetchDashboardData(user);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `firebase_uid=eq.${user.uid}` }, () => {
            fetchDashboardData(user);
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_uid=eq.${user.uid}` }, () => {
            console.log('⚡ Balance Updated!');
            fetchDashboardData(user);
          })
          .subscribe();

        return () => {
          if (supabase) supabase.removeChannel(channel);
        };
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMySubmissions = async (user: FirebaseUser) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('submissions')
      .select('mission_id, status')
      .eq('user_id', user.uid);
    if (data) setUserSubmissions(data);
  };

  useEffect(() => {
    if (!currentUser || !supabase) return;

    const channel = supabase?.channel('public:notifications:all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const notif = payload.new;
          
          if (notif.user_id === 'global' || notif.user_id === currentUser.uid) {
            console.log('🔔 LIVE NOTIFICATION RECEIVED:', notif);
            
            setToast({
              show: true,
              title: notif.title,
              message: notif.message,
              image: notif.metadata?.image || '',
              location: notif.metadata?.location || ''
            });

            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);

            setTimeout(() => {
              setToast(prev => ({ ...prev, show: false, title: '', message: '', image: '', location: '' }));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    const syncApplicationData = async () => {
      const pendingData = localStorage.getItem('pending_application');
      if (currentUser && pendingData && supabase) {
        try {
          const data = JSON.parse(pendingData);
          const { error } = await supabase.from('profiles').upsert({
            firebase_uid: currentUser.uid, 
            email: currentUser.email || "no-email",
            display_name: data.fullName || currentUser.displayName,
            handle: data.handle,
            niche: data.niche,
            city: data.city,
            phone: data.phone,
            followers: parseInt(data.followers) || 0,
            platform: data.platform,
            card_status: 'pending', 
            updated_at: new Date().toISOString(),
            role: 'user',
            reelcoins: 0
          }, { onConflict: 'firebase_uid' });

          if (!error) {
            localStorage.removeItem('pending_application');
            window.location.reload();
          }
        } catch (err) {
          console.error("SYNC ERROR:", err);
        }
      }
    };
    syncApplicationData();
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async (user: FirebaseUser) => {
    if (!supabase) return;
    try {
      const [profileRes, missionsRes, rewardsRes, transRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('firebase_uid', user.uid).single(),
        supabase.from('missions').select('*, partner_brands ( name, logo_url )').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('user_uid', user.uid).order('created_at', { ascending: false })
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (transRes.data) setTransactions(transRes.data);
    } catch (error) {
      console.error("Data Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (!profile || profile.reelcoins < reward.cost) {
      alert("⛔ INSUFFICIENT FUNDS");
      return;
    }
    if (!confirm(`REDEEM ${reward.title}?`)) return;
    setIsProcessing(reward.id);
    try {
      const { error } = await supabase!.rpc('redeem_reward', {
        user_uid: currentUser?.uid,
        cost: reward.cost,
        item_title: reward.title
      });
      if (error) throw error;
      setRevealedCodes(prev => ({ ...prev, [reward.id]: reward.code || 'REDEEMED' }));
      if (currentUser) fetchDashboardData(currentUser);
    } catch (err: any) {
      alert("Redemption Failed: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Scanning Bio-Metrics...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-white">
        <ReelywoodSlingshot />
        <div className="relative z-20 w-full max-w-[380px] px-6 pointer-events-auto">
          <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#834bf1] border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                <Sparkles className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase font-display text-black">Enter The Hub</h1>
              <p className="text-black/50 dark:text-white/50 text-[10px] font-black uppercase tracking-[0.4em]">Identity Sync Protocol • Reelywood</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full bg-white border-[3px] border-black py-4 font-black uppercase text-xs tracking-[0.2em] shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center space-x-3 active:scale-95"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                <span>Verify with Google</span>
              </button>
              <button onClick={onBack} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors">Return to Studio</button>
            </div>
            <div className="bg-[#ffde59] border-[3px] border-black p-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-wide leading-relaxed">No Platform Access? <br/> Contact Terminal Admin.</p>
            </div>
            <div className="text-center border-t-[3px] border-black/10 pt-6">
               <p className="text-[8px] font-black uppercase text-black/20 tracking-[0.4em]">Protected by Reelywood Protocol</p>
            </div>
          </div>
          <div className="hidden md:block absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 border-2 border-white font-black text-[8px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#834bf1]">DRAG THE OWL TO PLAY</div>
        </div>
      </div>
    );
  }

  const isApproved = profile?.card_status === 'approved';
  const coinBalance = profile?.reelcoins || 0;

  return (
    <div className="min-h-screen bg-white text-black font-lexend selection:bg-[#ffde59] overflow-x-hidden">
      {selectedMission && (
        <MissionModal 
          mission={selectedMission} 
          user={currentUser} 
          onClose={() => {
            setSelectedMission(null);
            fetchMySubmissions(currentUser);
          }} 
        />
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-xl bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000]">
            <div className="p-8 border-b-[4px] border-black flex items-center justify-between bg-[#ffde59]">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Vault History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 border-[3px] border-black bg-white"><X size={20} strokeWidth={4} /></button>
            </div>
            <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
              {transactions.length === 0 ? <p className="text-center opacity-20 font-black uppercase text-[10px]">No records found.</p> : 
                transactions.map((tx, i) => (
                  <div key={i} className="border-[3px] border-black p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase italic">{tx.description}</p>
                      <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-lg font-black italic ${tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount} RC
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <header className="border-b-[6px] border-black bg-white sticky top-0 z-[100] px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="p-2 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"><ArrowLeft size={24} strokeWidth={3} /></button>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter font-display">Creator <span className="text-[#834bf1]">Hub</span></h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifPanelOpen(!isNotifPanelOpen);
                  if (!isNotifPanelOpen) setUnreadCount(0);
                }}
                className="relative p-3 border-[4px] border-black bg-white hover:bg-[#ffde59] shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Bell size={20} className="text-black" strokeWidth={3} />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center border-2 border-black rounded-none animate-pulse">
                    {unreadCount}
                  </div>
                )}
              </button>

              {isNotifPanelOpen && (
                <div className="absolute top-16 right-0 w-80 md:w-96 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-black text-white p-4 flex justify-between items-center">
                    <span className="font-black italic tracking-widest text-xs uppercase">Incoming Signals</span>
                    <button onClick={() => setIsNotifPanelOpen(false)} className="hover:text-[#ffde59] transition-colors">
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto bg-white scrollbar-hide p-4">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center opacity-30">
                        <Bell size={32} className="mx-auto mb-4" strokeWidth={3} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No New Transmissions</p>
                      </div>
                    ) : (
                      <div className="space-y-4 pr-2">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="bg-white border-b-2 border-black py-4 flex gap-4 items-start group">
                            <div className="shrink-0">
                              {notif.metadata?.image ? (
                                <div className="w-12 h-12 bg-white border-2 border-black p-1 shrink-0 group-hover:shadow-[2px_2px_0px_0px_#834bf1] transition-all">
                                   <img 
                                     src={notif.metadata.image} 
                                     alt="Brand" 
                                     className="w-full h-full object-contain" 
                                   />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-[#ffde59] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0 group-hover:rotate-6 transition-transform">
                                   <Info size={20} className="text-black" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-black italic uppercase text-xs mb-1 truncate">{notif.title}</h4>
                              <p className="font-bold text-[10px] text-gray-500 uppercase tracking-wide leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[8px] font-mono text-gray-300 mt-2 block uppercase tracking-widest">
                                 {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t-4 border-black bg-slate-50 text-center">
                    <button 
                       onClick={() => setNotifications([])}
                       className="text-[9px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Clear Terminal History
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => auth.signOut()} className="flex items-center space-x-3 bg-black text-white px-5 py-2.5 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] font-black uppercase tracking-widest italic">
              <LogOut size={16} strokeWidth={3} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden group">
               <div className="absolute top-4 right-4 border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center space-x-2 bg-[#ffde59]">
                  {isApproved ? <CheckCircle2 size={14} strokeWidth={3} /> : <Clock size={14} strokeWidth={3} />}
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isApproved ? 'Verified' : 'Syncing'}</span>
               </div>
               <div className="w-40 h-40 border-[6px] border-black shadow-[8px_8px_0px_0px_#834bf1] mx-auto bg-[#ffde59] mt-6 overflow-hidden">
                  {profile?.photo_url || currentUser?.photoURL ? <img src={profile?.photo_url || currentUser?.photoURL} alt="Agent" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={64} strokeWidth={3} /></div>}
               </div>
               <div className="mt-8 space-y-2">
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic font-display">{profile?.display_name || "Agent"}</h2>
                 <p className="text-[#834bf1] font-black text-sm uppercase italic tracking-widest">@{profile?.handle || "unlinked"}</p>
               </div>
            </div>
            <div className="bg-[#834bf1] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3"><Wallet size={24} strokeWidth={3} className="text-[#ffde59]" /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Liquid Assets</span></div>
              </div>
              <p className="text-7xl font-black tracking-tighter italic font-display">{coinBalance.toLocaleString()} <span className="text-2xl text-[#ffde59]">RC</span></p>
              <button onClick={() => setShowHistory(true)} className="w-full mt-10 bg-black text-white border-[3px] border-white py-5 font-black uppercase text-[10px] tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">📜 Vault Ledger</button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10 relative">
            {!isApproved && (
              <div className="absolute inset-0 z-40 flex items-center justify-center p-12 bg-white/20 backdrop-blur-[2px]">
                <div className="bg-[#ffde59] border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] text-center space-y-6">
                  <Lock size={40} strokeWidth={3} className="mx-auto" />
                  <h3 className="text-3xl font-black uppercase italic font-display">Node Syncing</h3>
                  <p className="text-black text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto border-t-[3px] border-black/10 pt-6">Our team is reviewing your deployment. Grid modules will unlock shortly.</p>
                </div>
              </div>
            )}
            <div className={`flex border-[6px] border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-2.5 ${!isApproved ? 'grayscale opacity-60' : ''}`}>
              <button onClick={() => setActiveTab('missions')} className={`flex-1 py-5 font-black uppercase text-sm tracking-[0.3em] italic ${activeTab === 'missions' ? 'bg-[#ffde59] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>Missions</button>
              <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-5 font-black uppercase text-sm tracking-[0.3em] italic ${activeTab === 'rewards' ? 'bg-[#834bf1] text-white border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}`}>Rewards</button>
            </div>
            <div className={`space-y-8 min-h-[600px] ${!isApproved ? 'blur-[1px] pointer-events-none' : ''}`}>
              {activeTab === 'missions' ? (missions.length === 0 ? <div className="bg-white border-[6px] border-black p-24 text-center opacity-30 font-black uppercase text-xs tracking-widest italic">Scanning operational grid...</div> : 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {missions.map((m) => {
                    const submission = userSubmissions.find(sub => sub.mission_id === m.id);
                    const status = submission ? submission.status : 'idle';

                    let cardStyle = "border-black bg-white";
                    let buttonText = "DEPLOY MISSION PROTOCOL";
                    let isLockedCard = false;

                    if (status === 'pending') {
                       cardStyle = "border-black bg-[#ffde59]"; 
                       buttonText = "VERIFICATION IN PROGRESS...";
                       isLockedCard = true;
                    } else if (status === 'approved') {
                       cardStyle = "border-[#4ade80] bg-[#dcfce7]"; 
                       buttonText = "MISSION COMPLETED ✅";
                       isLockedCard = true;
                    }

                    return (
                      <div key={m.id} className={`border-[4px] p-6 shadow-[8px_8px_0px_0px_#000] relative flex flex-col transition-all ${cardStyle} group`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-white border-2 border-black p-1 shrink-0 shadow-[2px_2px_0px_0px_#000]">
                             {m.partner_brands?.logo_url ? (
                                <img 
                                  src={m.partner_brands.logo_url} 
                                  className="w-full h-full object-contain" 
                                  alt="Brand"
                                />
                             ) : (
                                <div className="w-full h-full bg-black flex items-center justify-center text-white font-black text-xl italic font-display">R</div>
                             )}
                          </div>
                          <div className="min-w-0">
                             <h3 className="font-black text-xl uppercase leading-none truncate mb-1">{m.title}</h3>
                             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {m.partner_brands?.name || "REELYWOOD ORIGINAL"}
                             </p>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-black/60 leading-relaxed uppercase line-clamp-3">
                            {m.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between mb-4">
                           <div className="bg-black text-[#ffde59] px-3 py-1.5 border-2 border-black font-black text-sm italic">
                             +{m.reward_amount} RC
                           </div>
                           {status === 'approved' && <CheckCircle2 className="text-emerald-500" size={24} />}
                        </div>

                        <div className="mt-auto pt-6">
                           <button 
                             onClick={() => !isLockedCard && setSelectedMission(m)}
                             disabled={isLockedCard}
                             className={`w-full py-4 font-black uppercase text-[10px] tracking-[0.2em] border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                isLockedCard 
                                ? 'opacity-70 cursor-not-allowed bg-black text-white' 
                                : 'bg-[#834bf1] text-white hover:bg-black hover:shadow-[4px_4px_0px_0px_#fff]'
                             }`}
                           >
                             {buttonText}
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : 
                rewards.map((r) => (
                  <div key={r.id} className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center space-x-8 flex-1">
                       <div className="w-16 h-16 bg-[#834bf1] border-[4px] border-black flex items-center justify-center text-white"><Gift size={24} strokeWidth={3} /></div>
                       <h3 className="text-2xl font-black uppercase italic font-display">{r.title}</h3>
                    </div>
                    <div className="flex items-center space-x-10">
                      <p className="text-3xl font-black text-[#834bf1] italic tracking-tighter">{r.cost} RC</p>
                      <button disabled={isProcessing === r.id || !!revealedCodes[r.id]} onClick={() => handleRedeem(r)} className={`px-8 py-4 border-[4px] border-black font-black uppercase text-[12px] tracking-[0.4em] shadow-[6px_6px_0px_0px_#000] active:scale-95 ${revealedCodes[r.id] ? 'bg-[#ffde59] text-black' : 'bg-black text-white'}`}>
                        {isProcessing === r.id ? <Loader2 className="animate-spin" /> : revealedCodes[r.id] ? `CODE: ${revealedCodes[r.id]}` : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>

      {toast.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-none">
          <div className="bg-white border-[4px] border-black shadow-[16px_16px_0px_0px_#834bf1] max-w-md w-full relative animate-in zoom-in-95 duration-300 pointer-events-auto flex flex-col overflow-hidden">
            <button 
              onClick={() => setToast({ ...toast, show: false, title: '', message: '', image: '', location: '' })}
              className="absolute top-4 right-4 z-10 p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_#000]"
            >
              <X size={20} strokeWidth={3} />
            </button>
            {toast.image ? (
               <div className="h-56 w-full bg-slate-50 border-b-4 border-black relative overflow-hidden group">
                  <img src={toast.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Notification" />
                  {toast.location && (
                     <div className="absolute bottom-4 left-4 bg-[#ffde59] text-black font-black text-[10px] px-3 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2 uppercase tracking-widest italic animate-in slide-in-from-left-4 duration-500 delay-200">
                        <MapPin size={12} strokeWidth={3} /> {toast.location}
                     </div>
                  )}
               </div>
            ) : (
               <div className="flex justify-center mt-12 mb-6">
                 <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#ffde59]">
                    <Bell size={32} strokeWidth={3} className="animate-bounce" />
                 </div>
               </div>
            )}
            <div className="p-10 text-center bg-white">
              <h2 className="text-3xl font-black text-center mb-3 italic tracking-tighter uppercase font-display leading-none text-[#834bf1]">
                {toast.title}
              </h2>
              <div className="h-1.5 w-20 bg-black mx-auto mb-6"></div>
              <p className="text-center font-bold text-base tracking-wide mb-10 text-black/70 leading-relaxed uppercase">
                {toast.message}
              </p>
              <button 
                onClick={() => setToast({ ...toast, show: false, title: '', message: '', image: '', location: '' })}
                className="w-full bg-black text-white py-5 font-black text-xl hover:bg-[#ffde59] hover:text-black border-[4px] border-black transition-all shadow-[6px_6px_0px_0px_#834bf1] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 uppercase italic font-display tracking-tight"
              >
                Acknowledge Intel
              </button>
            </div>
            <div className="bg-slate-50 border-t-2 border-black py-2 px-4 flex justify-between items-center">
               <span className="text-[8px] font-black uppercase text-black/30 tracking-[0.3em]">Protocol Node v4.1</span>
               <div className="flex gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};