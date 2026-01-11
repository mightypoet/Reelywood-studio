import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, DollarSign, Activity, ShoppingBag, ArrowUpRight, 
  Terminal, RefreshCw, LogOut, Layout, Bell, Ticket,
  Zap, Building2, ShieldCheck, X, Trash2, Edit3, Plus, Send, CheckCircle
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

// --- Types ---
interface Transaction {
  id: string;
  user: string;
  amount: number;
  status: 'completed' | 'pending';
  date: string;
}

interface DashboardStats {
  totalUsers: number;
  revenue: number;
  activeMissions: number;
  growth: number;
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', user: 'agent_alex', amount: 120.50, status: 'completed', date: '2 mins ago' },
  { id: 'TXN-002', user: 'sarah_creator', amount: 75.00, status: 'completed', date: '15 mins ago' },
  { id: 'TXN-003', user: 'mike_vibe', amount: 250.00, status: 'pending', date: '1 hour ago' },
];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'ledger' | 'alliance'>('incoming');
  const [consoleMode, setConsoleMode] = useState<'MISSION' | 'VOUCHER'>('MISSION');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [submissions, setSubmissions] = useState([] as any[]);
  const [logs, setLogs] = useState([] as any[]);
  const [brands, setBrands] = useState([] as any[]);
  const [missions, setMissions] = useState([] as any[]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, revenue: 0, activeMissions: 0, growth: 0
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null as any);

  // Ref for Realtime cleanup
  const channelRef = useRef<any>(null);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Submissions
      const { data: subData } = await supabase
        .from('submissions')
        .select(`*, missions:mission_id (*)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const rawSubs = (subData || []) as any[];
      const userIds = [...new Set(rawSubs.map(s => s.user_id))];
      
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('firebase_uid', userIds);
      
      const userList = (users || []) as any[];
      const combined = rawSubs.map(sub => ({
        ...sub, 
        profiles: userList.find(u => u.firebase_uid === sub.user_id) || { display_name: 'Unknown', handle: 'unknown' }
      }));
      setSubmissions(combined);

      // 2. Missions & Brands
      const { data: missionData } = await supabase.from('missions').select('*, partner_brands(name)').order('created_at', { ascending: false });
      setMissions((missionData || []) as any[]);

      const { data: brandData } = await supabase.from('partner_brands').select('*');
      setBrands((brandData || []) as any[]);

      // 3. System Logs
      const { data: logData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs((logData || []) as any[]);

      // 4. Update Stats
      setStats({
        totalUsers: userList.length + 420,
        revenue: 45231.89,
        activeMissions: (missionData || []).length,
        growth: 12.5
      });

    } catch (err) { 
      console.error("Terminal Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      onLogout();
    }
    fetchData();

    if (supabase) {
      channelRef.current = supabase.channel('admin-grid-sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
        .subscribe();
    }

    return () => { 
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current); 
      }
    };
  }, []);

  const renderStatCard = (label: string, value: string, icon: React.ReactNode, trend: string) => (
    <div className="bg-white p-8 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#834bf1] transition-all cursor-default group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-[#ffde59] border-2 border-black group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 border-2 border-black uppercase tracking-widest">{trend}</span>
      </div>
      <h3 className="text-black/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">{label}</h3>
      <p className="text-4xl font-black italic font-display tracking-tight leading-none">{value}</p>
    </div>
  );

  const renderIncomingSignals = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
      {submissions.length === 0 ? (
        <div className="p-32 text-center border-4 border-dashed border-black/10 bg-white">
          <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
          <p className="text-xl font-black opacity-20 uppercase italic tracking-widest">No signals in grid {'>>'} Realtime</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white border-4 border-black p-0 shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row relative group overflow-hidden hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffde59]"></div>
              <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex items-center gap-6 min-w-[250px] w-full">
                  <div className="w-16 h-16 bg-[#834bf1] border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                    <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.user_id}`} alt="Agent" className="w-full h-full object-cover"/>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl uppercase truncate leading-none mb-1">{sub.profiles?.display_name || "Agent"}</h3>
                    <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest italic">@{sub.profiles?.handle || "unlinked"}</p>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <p className="text-[9px] font-black uppercase text-black/40 mb-1 tracking-widest">Active Protocol</p>
                  <h4 className="font-black text-lg uppercase italic mb-3 truncate">{sub.missions?.title || "Alpha Mission"}</h4>
                  <a href={sub.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-50 border-2 border-black/10 p-2 text-[10px] font-black text-blue-600 underline truncate max-w-[300px]">
                    LINK DETECTED {'>>'} {sub.link}
                  </a>
                </div>
                <button onClick={() => setSelectedSubmission(sub)} className="bg-black text-white px-10 py-5 font-black uppercase text-xs tracking-widest hover:bg-[#4ade80] hover:text-black hover:shadow-[6px_6px_0px_0px_#000] transition-all border-2 border-transparent hover:border-black shrink-0 w-full lg:w-auto">VERIFY SIGNAL</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConsole = () => (
    <div className="space-y-12 animate-in zoom-in-95">
      <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000]">
        <div className="flex gap-4 mb-10">
          <button onClick={() => setConsoleMode('MISSION')} className={`flex-1 py-5 font-black uppercase text-xs tracking-widest border-4 border-black transition-all ${consoleMode === 'MISSION' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🚀 MISSION CONTROL</button>
          <button onClick={() => setConsoleMode('VOUCHER')} className={`flex-1 py-5 font-black uppercase text-xs tracking-widest border-4 border-black transition-all ${consoleMode === 'VOUCHER' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🎟️ VOUCHER MINT</button>
        </div>
        
        <div className="text-center py-20 border-4 border-dashed border-black/10 space-y-4">
          <div className="text-6xl">🛠️</div>
          <p className="font-black uppercase tracking-[0.4em] text-black/30">Node Configurator: Standby</p>
          <button className="text-xs underline font-bold hover:text-[#834bf1]">Download Protocol Documentation {'>>'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {missions.map((m: any) => (
          <div key={m.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col group hover:shadow-[12px_12px_0px_0px_#ffde59] transition-all">
            <h4 className="font-black text-lg uppercase italic mb-2 leading-none truncate">{m.title}</h4>
            <p className="text-[9px] font-bold text-[#834bf1] uppercase tracking-widest mb-4">Node: {m.partner_brands?.name || "System"}</p>
            <div className="flex gap-2 mt-auto">
              <button className="flex-1 bg-white border-2 border-black py-2 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50">Config</button>
              <button className="px-4 bg-black text-white border-2 border-black py-2 hover:bg-rose-600 transition-colors"><X size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="bg-black text-[#4ade80] p-10 border-[6px] border-[#4ade80] font-mono shadow-[12px_12px_0px_0px_#000] animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#4ade80]/20">
        <h2 className="text-3xl font-black flex items-center gap-4 italic"><Activity className="animate-pulse" size={32} /> SYSTEM_LOG_v4.0</h2>
        <span className="text-[10px] bg-[#4ade80] text-black px-3 py-1 font-black uppercase">Active Grid Sync</span>
      </div>
      <div className="space-y-4 h-[600px] overflow-y-auto no-scrollbar pr-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 italic uppercase tracking-[0.3em]"><p>&gt; Initializing tracking node...</p></div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="border-b border-[#4ade80]/10 pb-4 flex gap-6 hover:bg-white/5 transition-colors p-3">
              <span className="text-gray-500 text-[10px] shrink-0 pt-1">[{new Date(log.created_at).toLocaleTimeString()}]</span>
              <div className="flex-1 min-w-0">
                <span className="text-[#ffde59] font-black mr-3 uppercase">[{log.title || 'SYSTEM'}]</span>
                <span className="leading-relaxed text-sm break-words">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-lexend text-black">
      {/* HEADER */}
      <header className="bg-black text-white p-6 border-b-4 border-[#834bf1] sticky top-0 z-[100] shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Terminal className="text-[#834bf1]" size={32} />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">TERMINAL <span className="text-[#834bf1]">ADMIN</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 transition-all active:scale-95">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { auth.signOut(); onLogout(); }} className="flex items-center gap-3 bg-rose-600 text-white px-6 py-2.5 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <span>Exit System</span> <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className="bg-white border-b-4 border-black sticky top-[88px] z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          {[
            { id: 'incoming', label: 'Signals', icon: Bell, count: submissions.length },
            { id: 'console', label: 'Modules', icon: Layout, count: missions.length },
            { id: 'ledger', label: 'Ledger', icon: Activity },
            { id: 'alliance', label: 'Alliance', icon: Building2 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-6 min-w-[150px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                activeTab === tab.id ? 'bg-[#834bf1] text-white' : 'hover:bg-black/5 text-gray-400'
              }`}>
              <tab.icon size={18} strokeWidth={3} /> {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 border-2 border-white animate-pulse">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {/* STATS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {renderStatCard("Total Revenue", `$${stats.revenue.toLocaleString()}`, <DollarSign />, "+12% Growth")}
          {renderStatCard("Agent Network", stats.totalUsers.toLocaleString(), <Users />, "+54 New Nodes")}
          {renderStatCard("Operational Modules", stats.activeMissions.toString(), <Activity />, "Live Grid")}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            {activeTab === 'incoming' && renderIncomingSignals()}
            {activeTab === 'console' && renderConsole()}
            {activeTab === 'ledger' && renderLedger()}
            {activeTab === 'alliance' && <BrandManager />}
          </div>

          {/* SIDE COLUMN: RECENT ACTIVITY */}
          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-[260px]">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] space-y-8">
              <div className="flex items-center justify-between border-b-4 border-black pb-4">
                <h3 className="font-black text-xl italic uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingBag size={24} /> Feed
                </h3>
                <div className="w-2 h-2 bg-emerald-500 animate-ping"></div>
              </div>

              <div className="space-y-6">
                {MOCK_TRANSACTIONS.map((txn) => (
                  <div key={txn.id} className="flex justify-between items-start border-b-2 border-dashed border-black/5 pb-4 last:border-0 last:pb-0 group">
                    <div className="space-y-1">
                      <div className="font-black text-xs uppercase tracking-widest">{txn.user}</div>
                      <div className="text-[9px] font-bold text-black/30 uppercase">{txn.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black italic text-[#834bf1]">+{txn.amount.toFixed(2)} RC</div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                        txn.status === 'completed' ? 'bg-[#4ade80]' : 'bg-[#ffde59]'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.4em] border-[3px] border-black hover:bg-[#834bf1] transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                ACCESS LEDGER <ArrowUpRight size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="bg-[#ffde59] border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
               <div className="flex items-center gap-3 mb-4">
                  <Zap className="fill-black" size={24} />
                  <h4 className="font-black uppercase italic tracking-tighter">System Health</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                     <span>CPU Load</span>
                     <span>12%</span>
                  </div>
                  <div className="h-4 bg-white border-[3px] border-black p-0.5">
                     <div className="h-full bg-black w-[12%]"></div>
                  </div>
                  <p className="text-[9px] font-bold uppercase leading-relaxed opacity-60">All mission nodes are operational and synchronized with the primary grid.</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {selectedSubmission && (
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
          onRefresh={fetchData} 
        />
      )}
    </div>
  );
};