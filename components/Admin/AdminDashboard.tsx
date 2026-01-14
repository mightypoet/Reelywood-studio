import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Instagram, Send, FileText, CheckCircle, AlertCircle, 
  Bell, Home, Menu, ArrowUpRight, ShieldCheck, Wallet
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';
import { AgentDetailView } from './AgentDetailView';

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'queue' | 'users' | 'brands' | 'menu'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Data Stores
  const [users, setUsers] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Detail Sheets
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showNotifs, setShowNotifs] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const [u, m, v, s] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)'),
        supabase.from('rewards').select('*, partner_brands(*)'),
        supabase.from('submissions').select('*, profiles(*), missions(*)').order('created_at', { ascending: false })
      ]);
      
      if (u.data) setUsers(u.data);
      if (m.data) setMissions(m.data);
      if (v.data) setVouchers(v.data);
      if (s.data) setSubmissions(s.data);

      // Simple system alerts
      const alerts = [];
      if (v.data?.some(r => r.stock < 5)) alerts.push({ id: 1, text: "Low Voucher Stock Detected", type: "warning" });
      if (s.data?.filter(sub => sub.status === 'pending').length > 5) alerts.push({ id: 2, text: "High Submission Queue Volume", type: "critical" });
      setNotifications(alerts);

    } catch (e) { console.error(e); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#834bf1] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-white">
          <Activity size={20} className="mb-2 opacity-50" />
          <h3 className="text-3xl font-black italic font-display">{submissions.filter(s => s.status === 'pending').length}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest">Awaiting QC</p>
        </div>
        <div className="bg-[#ffde59] p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-black">
          <Users size={20} className="mb-2 opacity-50" />
          <h3 className="text-3xl font-black italic font-display">{users.length}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest">Active Nodes</p>
        </div>
      </div>

      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
        <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <Terminal size={14} /> System Health
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="uppercase opacity-40">Database Latency</span>
            <span className="text-emerald-500">14ms [STABLE]</span>
          </div>
          <div className="h-2 bg-slate-100 border-2 border-black">
            <div className="h-full bg-[#834bf1] w-[85%]"></div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">All Nodes Synchronized v4.2.1</p>
        </div>
      </div>
    </div>
  );

  const renderQueue = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3">
        <ListChecks className="text-[#834bf1]" /> Transmission Queue
      </h3>
      {submissions.filter(s => s.status === 'pending').length === 0 ? (
        <div className="py-20 text-center opacity-30 italic font-black uppercase text-xs tracking-widest">Grid Quiet... No signals.</div>
      ) : (
        submissions.filter(s => s.status === 'pending').map(sub => (
          <div key={sub.id} className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
               onClick={() => setSelectedSubmission(sub)}>
            <div className="flex justify-between items-start mb-3">
              <span className="bg-slate-100 px-2 py-1 border-2 border-black text-[8px] font-black uppercase tracking-widest">Identity: {sub.profiles?.display_name}</span>
              <span className="text-[#834bf1] font-black text-xs italic">+{sub.missions?.reward_amount} RC</span>
            </div>
            <h4 className="font-black text-sm uppercase leading-tight truncate">{sub.missions?.title}</h4>
            <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-slate-400 uppercase italic">
              <Clock size={10} /> {new Date(sub.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderUserRoster = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input className="w-full bg-white border-4 border-black p-4 pl-12 font-bold text-xs uppercase tracking-widest focus:bg-[#ffde59] focus:outline-none" placeholder="Search Agent ID..." />
      </div>
      {users.map(u => (
        <div key={u.id} className="bg-white border-4 border-black p-4 flex items-center justify-between shadow-[6px_6px_0px_0px_#000] active:scale-[0.98] transition-transform"
             onClick={() => setSelectedAgent(u)}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-[#834bf1] overflow-hidden shadow-[2px_2px_0px_0px_#000]">
              <img src={u.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase leading-none">{u.display_name}</h4>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#834bf1] mt-1">@{u.handle || 'unlinked'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block font-black text-sm text-emerald-600 italic">{u.reelcoins} RC</span>
            <span className={`text-[8px] font-black uppercase px-1 border border-black ${u.card_status === 'approved' ? 'bg-[#39ff14]' : 'bg-[#ffde59]'}`}>
              {u.card_status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const bg = darkMode ? 'bg-slate-50' : 'bg-gray-100';

  return (
    <div className={`min-h-screen ${bg} pb-32 font-lexend`}>
      {/* HEADER MONITOR */}
      <header className="bg-white border-b-4 border-black p-4 sticky top-0 z-[100] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#834bf1]">
            <Terminal size={20} strokeWidth={3} />
          </div>
          <h1 className="text-lg font-black italic uppercase font-display leading-none">REELY<span className="text-[#834bf1]">OPS</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
            <Bell size={18} />
            {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-black"></span>}
          </button>
          <button onClick={onLogout} className="p-2 border-2 border-black bg-rose-500 text-white shadow-[2px_2px_0px_0px_#000]">
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* NOTIFICATION OVERLAY */}
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

      {/* MAIN VIEWPORT */}
      <main className="p-6">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'queue' && renderQueue()}
        {activeTab === 'users' && renderUserRoster()}
        {activeTab === 'brands' && <BrandManager />}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <button className="w-full bg-white border-4 border-black p-5 flex items-center justify-between shadow-[6px_6px_0px_0px_#000]">
               <span className="font-black uppercase text-sm italic">New Mission Brief</span>
               <Zap size={20} className="text-[#834bf1]" />
             </button>
             <button className="w-full bg-white border-4 border-black p-5 flex items-center justify-between shadow-[6px_6px_0px_0px_#000]">
               <span className="font-black uppercase text-sm italic">Generate Voucher Node</span>
               <Gift size={20} className="text-[#ffde59]" />
             </button>
             <button className="w-full bg-white border-4 border-black p-5 flex items-center justify-between shadow-[6px_6px_0px_0px_#000]">
               <span className="font-black uppercase text-sm italic">Audit Ledger</span>
               <FileText size={20} className="text-slate-400" />
             </button>
          </div>
        )}
      </main>

      {/* THUMB-RULE NAVIGATION (BOTTOM TAB BAR) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black border-4 border-white p-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'home', icon: Home, label: 'HUB' },
          { id: 'queue', icon: ListChecks, label: 'QC' },
          { id: 'users', icon: Users, label: 'NODES' },
          { id: 'brands', icon: Building2, label: 'ALLIANCE' },
          { id: 'menu', icon: Menu, label: 'OPS' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={22} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* DETAIL SHEETS (ACTION SHEETS) */}
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

      {notify && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-4 px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            <CheckCircle size={20} />
            <span className="font-bold text-[10px] uppercase tracking-widest">{notify.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
};
