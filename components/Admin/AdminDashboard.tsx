import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Instagram, Send, FileText, CheckCircle, AlertCircle, 
  Bell, Home, Menu, ArrowUpRight, ShieldCheck, Wallet, ChevronRight, ArrowLeft, History,
  Cpu, LayoutGrid, Briefcase
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';
import { AgentDetailView } from './AgentDetailView';
import { CreationWizard } from './CreationWizard';

// --- TYPES ---
export interface Profile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string;
  handle: string;
  role: string;
  card_status: 'none' | 'pending' | 'approved' | 'rejected';
  reelcoins: number;
  photo_url?: string;
  created_at: string;
}

interface Alert {
  id: number;
  text: string;
  type: 'warning' | 'critical';
}

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'queue' | 'users' | 'brands' | 'menu'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Data Stores
  const [users, setUsers] = useState<Profile[]>([]);
  const [brandEmails, setBrandEmails] = useState<string[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  
  // Detail Sheets & Modals
  const [selectedAgent, setSelectedAgent] = useState<Profile | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [creationMode, setCreationMode] = useState<'mission' | 'voucher' | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        onLogout();
        return;
    }

    fetchAllData();
    setupRealtime();

    return () => {
      supabase?.removeAllChannels();
    };
  }, []);

  const setupRealtime = () => {
    if (!supabase) return;

    const subChannel = supabase.channel('admin-ops')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
        showToast('success', '🚨 NEW MISSION TRANSMISSION DETECTED');
        playSignalSound();
        fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData())
      .subscribe();
  };

  const playSignalSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.4;
      audio.play();
    } catch (e) { console.log("Audio block", e); }
  };

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [u, m, v, s, b] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)'),
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('*, profiles(*), missions(*)').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*, brand_email')
      ]);
      
      if (u.data) setUsers(u.data);
      if (m.data) setMissions(m.data);
      if (v.data) setVouchers(v.data);
      if (s.data) setSubmissions(s.data);
      if (b.data) {
        setBrands(b.data);
        // Extract brand emails for identification
        const emails = b.data.map(brand => brand.brand_email).filter(Boolean);
        setBrandEmails(emails);
      }

      const alerts: Alert[] = [];
      if (v.data?.some((r: any) => (r.stock || 0) < 5)) {
        alerts.push({ id: 1, text: "Low Voucher Stock Detected", type: "warning" });
      }
      const pendingCount = s.data?.filter((sub: any) => sub.status === 'pending').length || 0;
      if (pendingCount > 5) {
        alerts.push({ id: 2, text: "High Submission Queue Volume", type: "critical" });
      }
      setNotifications(alerts);

    } catch (e) { console.error(e); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Node Type Counters */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#834bf1] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-white">
          <div className="flex justify-between items-start mb-2">
            <Users size={20} className="opacity-50" />
            <span className="text-[7px] font-black uppercase tracking-widest bg-white/20 px-1">AGENT_POOL</span>
          </div>
          <h3 className="text-4xl font-black italic font-display leading-none">{users.length}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1">Creator Nodes</p>
        </div>
        <div className="bg-[#ffde59] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-black">
          <div className="flex justify-between items-start mb-2">
            <Building2 size={20} className="opacity-50" />
            <span className="text-[7px] font-black uppercase tracking-widest bg-black/10 px-1">BRAND_NODES</span>
          </div>
          <h3 className="text-4xl font-black italic font-display leading-none">{brands.length}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1">Alliance Partners</p>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
        <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-2 text-black">
          <Terminal size={14} /> Grid Status Log
        </h4>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 border-2 border-black flex items-center justify-center shrink-0">
               <Briefcase size={18} className="text-[#834bf1]" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between text-[8px] font-black uppercase opacity-40 mb-1">
                 <span>Active Missions</span>
                 <span>{missions.length} Deployed</span>
               </div>
               <div className="h-1.5 bg-slate-100 border border-black">
                 <div className="h-full bg-[#834bf1]" style={{ width: `${Math.min((missions.length/10)*100, 100)}%` }}></div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 border-2 border-black flex items-center justify-center shrink-0">
               <ListChecks size={18} className="text-[#ffde59]" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between text-[8px] font-black uppercase opacity-40 mb-1">
                 <span>Submissions QC</span>
                 <span>{submissions.filter(s => s.status === 'pending').length} Pending</span>
               </div>
               <div className="h-1.5 bg-slate-100 border border-black">
                 <div className="h-full bg-[#ffde59]" style={{ width: `${Math.min((submissions.filter(s=>s.status==='pending').length/10)*100, 100)}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQueue = () => {
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    const approvedHistory = submissions.filter(s => s.status === 'approved' || s.status === 'completed').slice(0, 5);

    return (
      <div className="space-y-12 animate-in fade-in duration-300">
        <section className="space-y-4">
          <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-black">
            <Cpu className="text-[#834bf1]" /> Processing Grid
          </h3>
          {pendingSubmissions.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-black/10 opacity-30 italic font-black uppercase text-xs tracking-widest text-black">Grid Quiet... No signals.</div>
          ) : (
            pendingSubmissions.map(sub => (
              <div key={sub.id} className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                  onClick={() => setSelectedSubmission(sub)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[#834bf1]">SIGNAL_DETECTION_NODE</span>
                    <span className="bg-slate-100 px-2 py-0.5 border-2 border-black text-[8px] font-black uppercase tracking-widest text-black">Agent: {sub.profiles?.display_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#834bf1] font-black text-xs italic block">+{sub.missions?.reward_amount} RC</span>
                    <span className="text-[7px] font-black uppercase opacity-30 italic">Allocated Bounty</span>
                  </div>
                </div>
                <div className="bg-slate-50 border-2 border-black p-3 mb-4">
                  <h4 className="font-black text-sm uppercase leading-tight truncate text-black">{sub.missions?.title}</h4>
                </div>
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase italic">
                  <div className="flex items-center gap-2">
                    <Clock size={10} /> {new Date(sub.created_at).toLocaleTimeString()}
                  </div>
                  <div className="bg-[#ffde59] text-black px-2 border-2 border-black">AWAITING_QC</div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between border-t-4 border-black pt-8 mb-6">
            <h3 className="text-xl font-black italic uppercase flex items-center gap-3 text-black">
              <History className="text-emerald-500" /> Archive Logs
            </h3>
          </div>
          
          <div className="space-y-3">
            {approvedHistory.map(sub => (
              <div key={sub.id} className="bg-emerald-50 border-[3px] border-emerald-500 p-4 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 border-2 border-emerald-600 grayscale overflow-hidden shrink-0">
                    <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.id}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-[10px] uppercase leading-none text-emerald-900 truncate">{sub.profiles?.display_name}</p>
                    <p className="text-[8px] font-bold text-emerald-600 uppercase mt-1 truncate">{sub.missions?.title}</p>
                  </div>
                </div>
                <div className="bg-emerald-500 text-white px-2 py-1 text-[7px] font-black uppercase tracking-widest border border-emerald-600">
                  VERIFIED
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderUserRoster = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-[#834bf1] p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-8">
        <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Personnel Roster</h3>
        <p className="text-white/40 font-black text-[9px] uppercase tracking-[0.4em]">Managing {users.length} Active Agents</p>
      </div>
      
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input className="w-full bg-white border-4 border-black p-4 pl-12 font-bold text-xs uppercase tracking-widest focus:bg-[#834bf1] focus:text-white focus:outline-none text-black transition-colors" placeholder="Search Agent ID..." />
      </div>

      <div className="space-y-4">
        {users.map(u => {
          const isBrand = brandEmails.includes(u.email);
          
          return (
            <div key={u.id} className={`bg-white border-4 p-4 flex items-center justify-between shadow-[6px_6px_0px_0px_#000] active:scale-[0.98] transition-all cursor-pointer group hover:bg-slate-50 ${isBrand ? 'border-[#0047AB] bg-[#e0fdff]/30' : 'border-black'}`}
                onClick={() => setSelectedAgent(u)}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 border-[3px] overflow-hidden shadow-[3px_3px_0px_0px_#000] group-hover:-rotate-3 transition-transform ${isBrand ? 'border-[#0047AB] bg-[#0047AB]' : 'border-black bg-[#834bf1]'}`}>
                  {u.photo_url ? (
                    <img src={u.photo_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {isBrand ? <Building2 size={24} /> : <Users size={24} />}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[7px] font-black text-white px-1 border border-black uppercase ${isBrand ? 'bg-[#0047AB]' : 'bg-[#834bf1]'}`}>
                      {isBrand ? 'PARTNER_BRAND' : 'AGENT_NODE'}
                    </span>
                    <h4 className="font-black text-sm uppercase leading-none text-black">{u.display_name}</h4>
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 italic ${isBrand ? 'text-[#0047AB]' : 'text-[#834bf1]'}`}>
                    {isBrand ? (u.handle ? `@${u.handle}` : '[CORPORATE_NODE]') : `@${u.handle || 'unlinked'}`}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="block font-black text-sm text-black italic leading-none">{u.reelcoins} RC</span>
                <div className={`text-[7px] font-black uppercase px-2 py-0.5 border-2 border-black ${isBrand ? 'bg-[#00d4ff] text-black border-[#0047AB]' : u.card_status === 'approved' ? 'bg-[#39ff14]' : 'bg-[#ffde59]'}`}>
                  {isBrand ? 'AUTHORIZED' : u.card_status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
        <button 
            onClick={() => setCreationMode('mission')}
            className="w-full bg-white border-4 border-black p-6 flex items-center justify-between shadow-[6px_6px_0px_0px_#000] text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
        >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1]">
                  <Zap size={24} fill="currentColor" />
               </div>
               <div className="text-left">
                  <span className="font-black uppercase text-lg italic block leading-none group-hover:text-[#834bf1]">New Mission</span>
                  <span className="text-[8px] font-black uppercase text-black/30 tracking-widest">Deploy task to agent grid</span>
               </div>
            </div>
            <ArrowUpRight size={20} />
        </button>

        <button 
            onClick={() => setCreationMode('voucher')}
            className="w-full bg-white border-4 border-black p-6 flex items-center justify-between shadow-[6px_6px_0px_0px_#000] text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group"
        >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[#ffde59] text-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <Gift size={24} fill="currentColor" />
               </div>
               <div className="text-left">
                  <span className="font-black uppercase text-lg italic block leading-none group-hover:text-[#834bf1]">Reward Node</span>
                  <span className="text-[8px] font-black uppercase text-black/30 tracking-widest">Initialize store voucher</span>
               </div>
            </div>
            <ArrowUpRight size={20} />
        </button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50 pb-32 font-lexend`}>
      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] rotate-3">
            <Terminal size={20} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-lg font-black italic uppercase font-display leading-none text-black">REELY<span className="text-[#834bf1]">OPS</span></h1>
            <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-30">Alliance Control System v4.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#ffde59] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase">LIVE_SYNC_OK</span>
          </div>
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black">
            <Bell size={18} />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black"></span>}
          </button>
          <button onClick={onLogout} className="p-2 border-2 border-black bg-rose-500 text-white shadow-[2px_2px_0px_0px_#000]">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      </header>

      {showNotifs && (
        <div className="fixed top-20 right-4 w-64 bg-black border-4 border-white p-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] z-[1000] animate-in slide-in-from-top-4">
          <h5 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-4">System Alerts</h5>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="border-l-4 border-[#ffde59] pl-3 py-1">
                <p className="text-white text-[10px] font-bold uppercase">{n.text}</p>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-white/20 text-[9px] uppercase font-black">All systems clear.</p>}
          </div>
        </div>
      )}

      <main className="p-6 text-black max-w-4xl mx-auto">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'queue' && renderQueue()}
        {activeTab === 'users' && renderUserRoster()}
        {activeTab === 'brands' && (
          <div className="animate-in fade-in duration-300">
             <div className="bg-[#ffde59] p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] mb-8">
                <h3 className="text-black font-black uppercase italic tracking-tighter text-xl">Alliance Directory</h3>
                <p className="text-black/40 font-black text-[9px] uppercase tracking-[0.4em]">Authorized Partner Nodes</p>
             </div>
             <BrandManager />
          </div>
        )}
        {activeTab === 'menu' && renderMenu()}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-black border-4 border-white p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'home', icon: Home, label: 'HUB' },
          { id: 'queue', icon: ListChecks, label: 'QC' },
          { id: 'users', icon: Users, label: 'AGENTS' },
          { id: 'brands', icon: Building2, label: 'BRANDS' },
          { id: 'menu', icon: Menu, label: 'OPS' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={20} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[7px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {selectedAgent && (
        <AgentDetailView agent={selectedAgent} onClose={() => { setSelectedAgent(null); fetchAllData(); }} />
      )}

      {selectedSubmission && (
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => { setSelectedSubmission(null); fetchAllData(); }} 
          onRefresh={fetchAllData} 
        />
      )}

      {creationMode && (
         <CreationWizard 
            type={creationMode}
            users={users}
            brands={brands}
            onClose={() => setCreationMode(null)}
            onSuccess={() => {
                showToast('success', `${creationMode.toUpperCase()} DEPLOYED SUCCESSFULLY`);
                fetchAllData();
            }}
         />
      )}

      {notify && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-4 px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-50 text-white'}`}>
            <CheckCircle size={20} />
            <span className="font-bold text-[10px] uppercase tracking-widest">{notify.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
