import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, ArrowUpRight, ArrowDownLeft, Search, X, 
  CheckCircle, Send, AlertCircle, Sparkles, Box, 
  ArrowLeft, Plus, Terminal, RefreshCw, LogOut, Layout, Bell, Building2, ShieldCheck, Ticket,
  Activity, Briefcase, Instagram, Star, MapPin, ImageIcon
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

// --- Types ---
type ViewMode = 'dashboard' | 'directory';
type DeployType = 'mission' | 'voucher';
type TargetMode = 'all' | 'specific';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  niche: string;
  followers: string;
  missionsCompleted: number;
  rcIncome: number; 
  rcExpense: number; 
  status: 'active' | 'inactive';
}

interface BrandProfile {
  id: string;
  name: string;
  logo_url: string | null;
  location_text: string;
  description: string;
}

interface LogItem {
  id: string;
  title: string;
  time: string;
  type: 'system' | 'user';
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Rohan Sen', email: 'rohan@reely.com', avatar: 'RS', niche: 'Tech & AI', followers: '1.2M', missionsCompleted: 42, rcIncome: 15000, rcExpense: 4200, status: 'active' },
  { id: 'u2', name: 'Sarah Jenkins', email: 'sarah.j@gmail.com', avatar: 'SJ', niche: 'Lifestyle', followers: '450K', missionsCompleted: 15, rcIncome: 5000, rcExpense: 1200, status: 'active' },
  { id: 'u3', name: 'Mike Tyson', email: 'ironmike@box.com', avatar: 'MT', niche: 'Fitness', followers: '12M', missionsCompleted: 8, rcIncome: 2400, rcExpense: 0, status: 'inactive' },
  { id: 'u4', name: 'Priya Das', email: 'priya.d@yahoo.com', avatar: 'PD', niche: 'Fashion', followers: '890K', missionsCompleted: 65, rcIncome: 32000, rcExpense: 28000, status: 'active' },
  { id: 'u5', name: 'Alex Chen', email: 'chen.a@tech.io', avatar: 'AC', niche: 'Gaming', followers: '2.1M', missionsCompleted: 22, rcIncome: 8500, rcExpense: 3000, status: 'active' },
];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'ledger' | 'alliance'>('incoming');
  const [consoleMode, setConsoleMode] = useState<DeployType>('mission');
  const [targetMode, setTargetMode] = useState<TargetMode>('all');
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  
  // Data States
  const [submissions, setSubmissions] = useState([] as any[]);
  const [logs, setLogs] = useState<LogItem[]>([
    { id: 'l1', title: 'System initialized', time: '10:00 AM', type: 'system' },
  ]);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [stats] = useState({ credited: 854000, debited: 320150, activeUsers: 12450 });
  const [selectedSubmission, setSelectedSubmission] = useState(null as any);

  // Form State
  const [formData, setFormData] = useState({ brandId: '', title: '', value: '', desc: '' });
  const [deployStep, setDeployStep] = useState<'editing' | 'confirming' | 'success'>('editing');

  const channelRef = useRef<any>(null);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    setIsSyncing(true);
    try {
      const [subData, brandData] = await Promise.all([
        supabase.from('submissions').select(`*, missions:mission_id (*)`).eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*')
      ]);

      if (brandData.data) {
        setBrands(brandData.data);
        setLogs(prev => [{ id: Date.now().toString(), title: `Synced ${brandData.data.length} Partner Nodes from DB`, time: new Date().toLocaleTimeString(), type: 'system' }, ...prev]);
      }

      const rawSubs = (subData.data || []) as any[];
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
    } catch (err) { 
      console.error("Terminal Error:", err); 
    } finally { 
      setLoading(false); 
      setIsSyncing(false);
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

  const toggleUserSelection = (user: UserProfile) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroupAndDeploy = () => {
    setViewMode('dashboard');
    setActiveTab('console');
    setTargetMode('specific');
    setConsoleMode('mission');
  };

  const handleDeploy = () => {
    if (!formData.brandId || !formData.title || !formData.value) return;
    setDeployStep('confirming');
    
    const selectedBrand = brands.find(b => b.id === formData.brandId);

    setTimeout(() => {
      setDeployStep('success');
      const countLabel = targetMode === 'all' ? 'Global Grid' : `${selectedUsers.length} Selected Agents`;
      const newLog: LogItem = {
        id: Date.now().toString(),
        title: `Deployed "${formData.title}" for ${selectedBrand?.name} to ${countLabel}`,
        time: new Date().toLocaleTimeString(),
        type: 'system'
      };
      setLogs(prev => [newLog, ...prev]);

      setTimeout(() => {
        setDeployStep('editing');
        setFormData({ brandId: '', title: '', value: '', desc: '' });
        if (targetMode === 'specific') setSelectedUsers([]);
        setTargetMode('all');
      }, 2500);
    }, 1500);
  };

  const selectedBrandData = brands.find(b => b.id === formData.brandId);

  const renderDashboard = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-emerald-50/30 p-8 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-default group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white border-2 border-black group-hover:rotate-12 transition-transform">
              <ArrowUpRight className="text-emerald-500" />
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 border-2 border-black uppercase tracking-widest">RC Inflow</span>
          </div>
          <h3 className="text-black/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Total Distributed</h3>
          <p className="text-4xl font-black italic font-display tracking-tight leading-none">+{stats.credited.toLocaleString()}</p>
        </div>

        <div className="bg-rose-50/30 p-8 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-default group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white border-2 border-black group-hover:rotate-12 transition-transform">
              <ArrowDownLeft className="text-rose-500" />
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 border-2 border-black uppercase tracking-widest">RC Outflow</span>
          </div>
          <h3 className="text-black/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Total Redeemed</h3>
          <p className="text-4xl font-black italic font-display tracking-tight leading-none">-{stats.debited.toLocaleString()}</p>
        </div>

        <div 
          onClick={() => setViewMode('directory')}
          className="bg-white p-8 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#834bf1] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white border-2 border-black group-hover:rotate-12 transition-transform">
              <Users className="text-[#834bf1]" />
            </div>
            <span className="text-[10px] font-black bg-slate-100 px-3 py-1.5 border-2 border-black uppercase tracking-widest">Directory Node</span>
          </div>
          <h3 className="text-black/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Agent Network</h3>
          <p className="text-4xl font-black italic font-display tracking-tight leading-none">{stats.activeUsers.toLocaleString()}</p>
          <p className="text-[10px] font-black text-[#834bf1] uppercase tracking-widest mt-4 group-hover:translate-x-2 transition-transform">Open Directory {'>>'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8">
          {activeTab === 'incoming' && (
            <div className="space-y-8">
              <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
              {submissions.length === 0 ? (
                <div className="p-32 text-center border-4 border-dashed border-black/10 bg-white">
                  <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
                  <p className="text-xl font-black opacity-20 uppercase italic tracking-widest">No signals in grid &gt; Realtime</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {submissions.map((sub: any) => (
                    <div key={sub.id} className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row relative group overflow-hidden hover:translate-x-1 hover:translate-y-1 transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffde59]"></div>
                      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center">
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
          )}

          {activeTab === 'console' && (
            <div className="space-y-8">
              <div className="flex gap-4">
                <button onClick={() => setConsoleMode('mission')} className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest border-4 border-black transition-all ${consoleMode === 'mission' ? 'bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-100 opacity-50'}`}><Sparkles size={18} className="inline mr-2"/> Mission</button>
                <button onClick={() => setConsoleMode('voucher')} className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest border-4 border-black transition-all ${consoleMode === 'voucher' ? 'bg-[#ffde59] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : 'bg-gray-100 opacity-50'}`}><Box size={18} className="inline mr-2"/> Voucher</button>
              </div>

              <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] relative min-h-[450px]">
                {deployStep === 'success' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 animate-in zoom-in duration-300">
                    <CheckCircle className="w-20 h-20 text-green-500 mb-6" strokeWidth={3}/>
                    <h2 className="text-4xl font-black uppercase mb-2 text-black">Deployed!</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest">Protocol is now active in grid.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Partner Alliance</label>
                          <div className="relative">
                            <select 
                              className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none appearance-none focus:bg-[#ffde59] transition-all"
                              value={formData.brandId}
                              onChange={e => setFormData({...formData, brandId: e.target.value})}
                              disabled={isSyncing}
                            >
                              <option value="">{isSyncing ? 'Loading Nodes...' : 'Select Brand Node...'}</option>
                              {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                              ))}
                            </select>
                            <Briefcase className="absolute right-4 top-4 text-black/30 pointer-events-none" size={18}/>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black/40">RC Bounty</label>
                          <input type="number" className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none focus:bg-[#ffde59] transition-all" placeholder="500" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}/>
                        </div>
                      </div>

                      {/* --- LIVE BRAND PREVIEW --- */}
                      {selectedBrandData && (
                        <div className="border-[3px] border-black bg-yellow-50 p-4 animate-in fade-in slide-in-from-top-2 flex gap-4 items-start shadow-[4px_4px_0px_0px_#000]">
                          <div className="w-20 h-20 bg-white border-2 border-black flex items-center justify-center overflow-hidden shrink-0">
                            {selectedBrandData.logo_url ? (
                              <img src={selectedBrandData.logo_url} alt="brand" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="text-black/10 w-8 h-8" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black uppercase text-base italic leading-none mb-1 truncate">{selectedBrandData.name}</h3>
                            <div className="flex items-center gap-1 text-[10px] font-black text-black/40 uppercase tracking-widest mt-2">
                                <MapPin size={10} strokeWidth={3} />
                                <span className="truncate">{selectedBrandData.location_text || "Global Reach"}</span>
                            </div>
                            <div className="mt-2 text-[8px] font-black bg-black text-white px-2 py-0.5 w-fit uppercase tracking-widest">Verified Node</div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Protocol Title</label>
                        <input className="w-full border-[3px] border-black p-4 font-bold text-sm outline-none focus:bg-[#ffde59] transition-all" placeholder={consoleMode === 'mission' ? "Mission Identity" : "Voucher Code"} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Target Deployment Hub:</span>
                        <button onClick={() => setViewMode('directory')} className="text-[9px] font-black text-[#834bf1] uppercase tracking-widest hover:underline">Edit Hub Selection {'>>'}</button>
                      </div>
                      <div className="font-black text-lg text-black italic">
                        {targetMode === 'all' ? 'BROADCAST TO GLOBAL GRID' : `${selectedUsers.length} TARGETED AGENT NODES`}
                      </div>
                    </div>

                    <button onClick={handleDeploy} className="w-full py-6 bg-black text-white font-black uppercase text-xs tracking-[0.4em] border-[4px] border-black hover:bg-[#834bf1] transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">INITIALIZE DEPLOYMENT</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="bg-black text-[#4ade80] p-10 border-[6px] border-[#4ade80] font-mono shadow-[12px_12px_0px_0px_#000] animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#4ade80]/20">
                <h2 className="text-3xl font-black flex items-center gap-4 italic"><Activity className="animate-pulse" size={32} /> SYSTEM_LOG_v4.0</h2>
                <span className="text-[10px] bg-[#4ade80] text-black px-3 py-1 font-black uppercase">Active Grid Sync</span>
              </div>
              <div className="space-y-4 h-[600px] overflow-y-auto no-scrollbar pr-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-[#4ade80]/10 pb-4 flex gap-6 hover:bg-white/5 transition-colors p-3">
                    <span className="text-gray-500 text-[10px] shrink-0 pt-1">[{log.time}]</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#ffde59] font-black mr-3 uppercase">[{log.type}]</span>
                      <span className="leading-relaxed text-sm break-words italic">{log.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alliance' && <BrandManager />}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full max-h-[700px] flex flex-col">
            <h3 className="font-black text-xl uppercase mb-8 italic flex items-center gap-3 border-b-4 border-black pb-4"><AlertCircle className="text-[#834bf1]" size={24}/> System Ledger</h3>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="border-l-[4px] border-black pl-5 py-1 group">
                  <p className="font-black text-xs leading-tight uppercase group-hover:text-[#834bf1] transition-colors">{log.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] text-black/30 font-black uppercase">{log.time}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border border-black ${log.type === 'system' ? 'bg-blue-50' : 'bg-green-50'}`}>{log.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDirectory = () => {
    const filteredDir = MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(directorySearch.toLowerCase()) || 
      u.niche.toLowerCase().includes(directorySearch.toLowerCase())
    );

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('dashboard')} className="p-3 border-[4px] border-black bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000]">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-5xl font-black italic uppercase font-display tracking-tighter">Agent Network</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic">Alliance Hub • {MOCK_USERS.length} Node Directives Synchronized</p>
            </div>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-4 text-black/30" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-4 border-[4px] border-black font-black text-xs outline-none shadow-[8px_8px_0px_0px_#ffde59] focus:shadow-none transition-all"
              placeholder="Search by Identity or Niche..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border-[6px] border-black shadow-[16px_16px_0px_0px_#000] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white border-b-4 border-black">
              <tr>
                <th className="p-6 w-12"></th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest italic">Agent Node</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest">Niche</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-center">Protocol Sync</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">RC Inflow</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">RC Outflow</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDir.map((user) => {
                const isSelected = !!selectedUsers.find(u => u.id === user.id);
                return (
                  <tr 
                    key={user.id} 
                    onClick={() => toggleUserSelection(user)}
                    className={`border-b-2 border-black/5 cursor-pointer transition-colors group ${isSelected ? 'bg-[#ffde59]/20' : 'hover:bg-slate-50'}`}
                  >
                    <td className="p-6 text-center">
                      <div className={`w-8 h-8 border-[3px] border-black mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-black text-white' : 'bg-white group-hover:border-indigo-600'}`}>
                        {isSelected && <CheckCircle size={18} strokeWidth={4} />}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 border-[3px] border-black flex items-center justify-center font-black text-indigo-600 shadow-[2px_2px_0px_0px_#000]">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-black text-sm uppercase italic leading-none mb-1">{user.name}</div>
                          <div className="text-[9px] font-bold text-black/40 uppercase tracking-widest leading-none">{user.email}</div>
                          <div className="mt-1 flex items-center gap-2">
                             <Instagram size={10} className="text-pink-500"/>
                             <span className="text-[9px] font-black text-black/80">{user.followers}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className="bg-gray-100 px-3 py-1 border-2 border-black text-[9px] font-black uppercase italic tracking-widest">{user.niche}</span>
                    </td>
                    <td className="p-6 text-center font-black italic">{user.missionsCompleted}</td>
                    <td className="p-6 text-right font-black italic text-emerald-500">+{user.rcIncome.toLocaleString()}</td>
                    <td className="p-6 text-right font-black italic text-rose-500">-{user.rcExpense.toLocaleString()}</td>
                    <td className="p-6 text-center">
                      <span className={`text-[9px] uppercase px-3 py-1 font-black border-2 border-black italic ${user.status === 'active' ? 'bg-[#4ade80]' : 'bg-slate-100'}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedUsers.length > 0 && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black text-white px-10 py-6 border-[6px] border-[#ffde59] shadow-[24px_24px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-10 animate-in slide-in-from-bottom-8 z-[200]">
            <div className="flex items-center gap-4">
              <span className="text-[#ffde59] font-black text-5xl italic font-display">{selectedUsers.length}</span>
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-[0.3em] text-xs">Nodes Hooked</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Selective Protocol Ready</span>
              </div>
            </div>
            <button 
              onClick={handleCreateGroupAndDeploy}
              className="bg-white text-black px-10 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-[#ffde59] transition-all flex items-center gap-4 shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Sparkles size={18} strokeWidth={3} /> INITIALIZE TARGETED MISSION
            </button>
          </div>
        )}
      </div>
    );
  };

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
              <span>Exit Terminal</span> <LogOut size={16} />
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
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setViewMode('dashboard'); }}
              className={`flex-1 py-6 min-w-[150px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                activeTab === tab.id && viewMode === 'dashboard' ? 'bg-[#834bf1] text-white' : 'hover:bg-black/5 text-gray-400'
              }`}>
              <tab.icon size={18} strokeWidth={3} /> {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 border-2 border-white animate-pulse">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        {viewMode === 'dashboard' ? renderDashboard() : renderDirectory()}
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