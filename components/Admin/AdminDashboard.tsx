import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Activity, ShoppingBag, ArrowUpRight, Plus, Send, 
  CheckCircle, Coins, ArrowDownLeft, Terminal, RefreshCw, 
  LogOut, Layout, Bell, Building2, ShieldCheck, X, Ticket,
  Search, Sparkles, Box, AlertCircle
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

// --- Types ---
type DeployType = 'mission' | 'voucher';
type TargetMode = 'all' | 'specific';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface LogItem {
  id: string;
  title: string;
  time: string;
  type: 'system' | 'user';
  status: 'success' | 'pending';
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'ledger' | 'alliance'>('incoming');
  const [consoleMode, setConsoleMode] = useState<DeployType>('mission');
  const [targetMode, setTargetMode] = useState<TargetMode>('all');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [submissions, setSubmissions] = useState([] as any[]);
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 'l1', title: 'System initialized', time: '10:00 AM', type: 'system', status: 'success' },
  ]);
  const [brands, setBrands] = useState([] as any[]);
  const [missions, setMissions] = useState([] as any[]);
  const [stats, setStats] = useState({ credited: 854000, debited: 320150, activeUsers: 12450 });
  const [selectedSubmission, setSelectedSubmission] = useState(null as any);

  // Deployment Form State
  const [deployStep, setDeployStep] = useState<'editing' | 'confirming' | 'success'>('editing');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    brand: '', title: '', value: '', desc: ''
  });

  const channelRef = useRef<any>(null);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
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

      const { data: missionData } = await supabase.from('missions').select('*, partner_brands(name)').order('created_at', { ascending: false });
      setMissions((missionData || []) as any[]);

      const { data: brandData } = await supabase.from('partner_brands').select('*');
      setBrands((brandData || []) as any[]);

    } catch (err) { 
      console.error("Terminal Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
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

  const handleDeploy = () => {
    if (!formData.brand || !formData.title || !formData.value) return;
    setDeployStep('confirming');
    
    setTimeout(() => {
      setDeployStep('success');
      const newLog: LogItem = {
        id: Date.now().toString(),
        title: `Deployed "${formData.title}" via ${formData.brand}`,
        time: new Date().toLocaleTimeString(),
        type: 'system',
        status: 'success'
      };
      setLogs(prev => [newLog, ...prev]);

      setTimeout(() => {
        setDeployStep('editing');
        setFormData({ brand: '', title: '', value: '', desc: '' });
        setTargetMode('all');
      }, 3000);
    }, 1500);
  };

  const renderStatCard = (label: string, value: string, icon: React.ReactNode, color: string = "bg-white") => (
    <div className={`${color} p-6 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#834bf1] transition-all cursor-default group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white border-2 border-black group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <span className="text-[9px] font-black bg-slate-100 px-2 py-1 border-2 border-black uppercase tracking-widest">Live Node</span>
      </div>
      <h3 className="text-black/40 text-[9px] font-black uppercase tracking-[0.4em] mb-1">{label}</h3>
      <p className="text-3xl font-black italic font-display tracking-tight leading-none">{value}</p>
    </div>
  );

  const renderIncomingSignals = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
      {submissions.length === 0 ? (
        <div className="p-32 text-center border-4 border-dashed border-black/10 bg-white">
          <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
          <p className="text-xl font-black opacity-20 uppercase italic tracking-widest">No signals in grid &gt; Realtime</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white border-4 border-black p-0 shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row relative group overflow-hidden hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffde59]"></div>
              <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-center">
                <div className="flex items-center gap-6 min-w-[250px] w-full">
                  <div className="w-14 h-14 bg-[#834bf1] border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
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
                    LINK DETECTED &gt; {sub.link}
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
    <div className="grid lg:grid-cols-12 gap-8 animate-in zoom-in-95 items-start">
      <div className="lg:col-span-8">
        <div className="bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-1">
          <div className="flex border-b-[4px] border-black">
            <button onClick={() => setConsoleMode('mission')} className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${consoleMode === 'mission' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}><Sparkles size={18}/> Create Mission</button>
            <button onClick={() => setConsoleMode('voucher')} className={`flex-1 py-4 font-black uppercase flex items-center justify-center gap-2 transition-colors ${consoleMode === 'voucher' ? 'bg-[#ffde59] text-black' : 'hover:bg-gray-100'}`}><Box size={18}/> Create Voucher</button>
          </div>

          <div className="p-8 min-h-[500px] relative">
            {deployStep === 'success' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 animate-in zoom-in duration-300">
                <CheckCircle className="w-20 h-20 text-green-500 mb-6" strokeWidth={3}/>
                <h2 className="text-4xl font-black uppercase mb-2">Deployed!</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest">Protocol is now active in grid.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="font-black text-xs uppercase tracking-[0.4em] border-b-2 border-dashed border-black/10 pb-2">1. Protocol Specification</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Partner Node</label>
                      <input className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none focus:bg-[#ffde59] transition-all" placeholder="Nike, Starbucks..." value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Bounty Magnitude (RC)</label>
                      <input type="number" className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none focus:bg-[#ffde59] transition-all" placeholder="500" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Signal Title</label>
                    <input className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none focus:bg-[#ffde59] transition-all" placeholder={consoleMode === 'mission' ? "Viral Protocol ID" : "Voucher Code"} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-black text-xs uppercase tracking-[0.4em] border-b-2 border-dashed border-black/10 pb-2">2. Deployment Targeting</h3>
                  <div className="flex gap-4">
                    <button onClick={() => setTargetMode('all')} className={`px-8 py-3 border-[3px] font-black text-[10px] uppercase tracking-widest transition-all ${targetMode === 'all' ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_#ffde59]' : 'bg-white border-black/10 text-black/30'}`}>Global Broadcast</button>
                    <button onClick={() => setTargetMode('specific')} className={`px-8 py-3 border-[3px] font-black text-[10px] uppercase tracking-widest transition-all ${targetMode === 'specific' ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_#ffde59]' : 'bg-white border-black/10 text-black/30'}`}>Selective Node</button>
                  </div>
                  {targetMode === 'specific' && (
                    <div className="bg-slate-50 border-[3px] border-black p-6 animate-in slide-in-from-top-2">
                      <div className="relative">
                        <Search className="absolute left-4 top-4 text-black/30" size={18}/>
                        <input className="w-full pl-12 pr-4 py-4 border-[3px] border-black font-bold text-xs outline-none" placeholder="Search Node ID or Email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleDeploy} className="w-full py-6 bg-black text-white font-black uppercase text-xs tracking-[0.4em] border-[4px] border-black hover:bg-[#834bf1] transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-2 active:translate-y-2">INITIALIZE DEPLOYMENT</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full max-h-[700px] flex flex-col">
          <h3 className="font-black text-xl uppercase mb-8 italic flex items-center gap-3 border-b-4 border-black pb-4"><AlertCircle className="text-[#834bf1]" size={24}/> System Ledger</h3>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
            {logs.map((log) => (
              <div key={log.id} className="border-l-[4px] border-black pl-5 py-1 group">
                <p className="font-black text-xs leading-tight uppercase group-hover:text-[#834bf1] transition-colors">{log.title}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] text-black/30 font-black uppercase">{log.time}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 border-2 border-black ${log.type === 'system' ? 'bg-blue-50' : 'bg-green-50'}`}>{log.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <div className="border-b border-[#4ade80]/10 pb-4 flex gap-6 hover:bg-white/5 transition-colors p-3">
          <span className="text-gray-500 text-[10px] shrink-0 pt-1">[{new Date().toLocaleTimeString()}]</span>
          <div className="flex-1 min-w-0">
            <span className="text-[#ffde59] font-black mr-3 uppercase">[SYSTEM]</span>
            <span className="leading-relaxed text-sm break-words italic">Monitoring active data streams... Grid health optimal.</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-lexend text-black">
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
              <span>Logoff</span> <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b-4 border-black sticky top-[88px] z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          {[
            { id: 'incoming', label: 'Signals', icon: Bell, count: submissions.length },
            { id: 'console', label: 'Deploy', icon: Layout },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {renderStatCard("RC Distributed", `+${stats.credited.toLocaleString()}`, <ArrowUpRight className="text-emerald-500" />, "bg-emerald-50/30")}
          {renderStatCard("RC Redeemed", `-${stats.debited.toLocaleString()}`, <ArrowDownLeft className="text-rose-500" />, "bg-rose-50/30")}
          {renderStatCard("Agent Network", stats.activeUsers.toLocaleString(), <Users />, "bg-white")}
        </div>

        {activeTab === 'incoming' && renderIncomingSignals()}
        {activeTab === 'console' && renderConsole()}
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'alliance' && <BrandManager />}
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