import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Layout, Activity, Bell, ExternalLink, 
  Terminal, RefreshCw, Loader2, Target, Ticket, 
  LogOut, Building2, ShieldCheck, X
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface MissionData {
  title: string;
  description: string;
  reward_amount: number;
  location: string;
  brand_id: string;
  image_url: string;
  checkpoints: string[];
}

interface VoucherData {
  title: string;
  cost: number;
  code: string;
  brand_id: string;
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'ledger' | 'alliance'>('incoming');
  const [loading, setLoading] = useState(false);
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [consoleMode, setConsoleMode] = useState<'MISSION' | 'VOUCHER'>('MISSION');
  
  const [newMission, setNewMission] = useState<MissionData>({
    title: '', 
    description: '', 
    reward_amount: 100, 
    location: '', 
    brand_id: '', 
    image_url: '', 
    checkpoints: ['', '', '']
  });

  const [newVoucher, setNewVoucher] = useState<VoucherData>({
    title: '', 
    cost: 500, 
    code: '', 
    brand_id: ''
  });

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .select(`*, missions:mission_id (*)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (subError) throw subError;

      if (subData && subData.length > 0) {
        const userIds = [...new Set(subData.map((s: any) => s.user_id))];
        const { data: users, error: profError } = await supabase
          .from('profiles')
          .select('firebase_uid, display_name, photo_url, handle')
          .in('firebase_uid', userIds);
        
        if (profError) throw profError;

        const combined = subData.map((sub: any) => ({
          ...sub, 
          profiles: users?.find((u: any) => u.firebase_uid === sub.user_id) || { display_name: 'Unknown Agent', handle: 'unlinked' }
        }));
        setSubmissions(combined);
      } else {
        setSubmissions([]);
      }

      const { data: logData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs(logData || []);

      const { data: brandData } = await supabase.from('partner_brands').select('*');
      setBrands(brandData || []);
    } catch (err: any) { 
      console.error("Terminal Sync Error:", err.message); 
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
  }, []);

  const handleDeployMission = async () => {
    if (!newMission.brand_id) return alert("SELECT A BRAND FIRST");
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('missions').insert([{
        title: newMission.title,
        description: newMission.description,
        reward_amount: newMission.reward_amount,
        brand_id: newMission.brand_id,
        location: newMission.location,
        image_url: newMission.image_url,
        checkpoints: newMission.checkpoints.filter((c: string) => c.trim() !== '')
      }]);
      if (error) throw error;
      alert("🚀 MISSION DEPLOYED");
      setNewMission({ title: '', description: '', reward_amount: 100, location: '', brand_id: '', image_url: '', checkpoints: ['', '', ''] });
      fetchData();
    } catch (err: any) { alert("Deployment Failed: " + err.message); } finally { setLoading(false); }
  };

  const handleDeployVoucher = async () => {
    if (!newVoucher.brand_id || !newVoucher.code) return alert("COMPLETE VOUCHER CREDENTIALS");
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('rewards').insert([{ title: newVoucher.title, cost: newVoucher.cost, code: newVoucher.code.toUpperCase() }]);
      if (error) throw error;
      alert("🎟️ VOUCHER MINTED");
      setNewVoucher({ title: '', cost: 500, code: '', brand_id: '' });
      fetchData();
    } catch (err: any) { alert("Minting Failed: " + err.message); } finally { setLoading(false); }
  };

  const handleBrandSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const brand = brands.find((b: any) => b.id === id);
    if (!brand) return;
    if (consoleMode === 'MISSION') {
      setNewMission({ ...newMission, brand_id: id, location: brand.location_text || '', image_url: brand.cover_image_url || '', title: `Project: ${brand.name}` });
    } else {
      setNewVoucher({ ...newVoucher, brand_id: id, title: `Exclusive @ ${brand.name}` });
    }
  };

  const handleCheckpointUpdate = (index: number, val: string) => {
    const next = [...newMission.checkpoints];
    next[index] = val;
    setNewMission({ ...newMission, checkpoints: next });
  };

  const renderIncomingSignals = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
      {submissions.length === 0 ? (
        <div className="p-32 text-center border-4 border-dashed border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
          <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
          <p className="text-2xl font-black opacity-20 uppercase italic font-display">No Signals Detected</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white dark:bg-[#1a1a1a] border-4 border-black p-0 shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#834bf1] flex flex-col md:flex-row relative group overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffde59]"></div>
              <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                <div className="flex items-center gap-6 min-w-[250px]">
                  <div className="w-16 h-16 bg-[#834bf1] border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                    <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.user_id}`} alt="Agent" className="w-full h-full object-cover"/>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl uppercase truncate leading-none mb-1">{sub.profiles?.display_name || "Agent"}</h3>
                    <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest italic">@{sub.profiles?.handle || "unlinked"}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase text-black/40 dark:text-white/40 mb-1 tracking-widest">Active Mission</p>
                  <h4 className="font-black text-lg uppercase italic mb-3">{sub.missions?.title || "Project Alpha"}</h4>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/20 p-2 border-2 border-black/10 w-fit">
                    <ExternalLink size={14} className="text-[#834bf1]"/>
                    <a href={sub.link} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 underline truncate max-w-[300px]">{sub.link}</a>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(sub)} className="bg-black text-white px-10 py-5 font-black uppercase text-xs tracking-widest hover:bg-[#4ade80] hover:text-black hover:shadow-[6px_6px_0px_0px_#000] transition-all border-2 border-transparent hover:border-black shrink-0 w-full md:w-auto">AUTHORIZE SIGNAL</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConsole = () => (
    <div className="bg-white dark:bg-[#1a1a1a] border-4 border-black p-8 lg:p-12 shadow-[12px_12px_0px_0px_#000] animate-in fade-in zoom-in-95">
      <div className="flex gap-6 mb-12">
        <button onClick={() => setConsoleMode('MISSION')} className={`flex-1 py-5 font-black uppercase tracking-[0.3em] text-xs border-4 border-black transition-all ${consoleMode === 'MISSION' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 dark:bg-white/5 opacity-50'}`}>🚀 Mission Module</button>
        <button onClick={() => setConsoleMode('VOUCHER')} className={`flex-1 py-5 font-black uppercase tracking-[0.3em] text-xs border-4 border-black transition-all ${consoleMode === 'VOUCHER' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 dark:bg-white/5 opacity-50'}`}>🎟️ Voucher Node</button>
      </div>
      <div className="space-y-8">
        <div className="relative">
          <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-3 text-black/40 italic">Link Alliance Node (Auto-fill)</label>
          <select className="w-full bg-slate-50 dark:bg-white/5 border-[3px] border-black p-5 font-black text-sm outline-none appearance-none cursor-pointer focus:bg-[#ffde59] focus:text-black transition-all" onChange={handleBrandSelect}>
            <option value="">-- SELECT ALLIANCE PARTNER --</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
          </select>
        </div>
        {consoleMode === 'MISSION' ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-black/40">Mission Identification</label>
                <input type="text" placeholder="Protocol Title" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5" value={newMission.title} onChange={e => setNewMission({...newMission, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-black/40">Bounty Allocation (RC)</label>
                <input type="number" placeholder="RC Units" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5" value={newMission.reward_amount} onChange={e => setNewMission({...newMission, reward_amount: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-black/40">Operation Intelligence</label>
              <textarea placeholder="Mission Brief / Objectives" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5 h-32" value={newMission.description} onChange={e => setNewMission({...newMission, description: e.target.value})}></textarea>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[0,1,2].map(i => (
                <div key={i} className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-black/40">Checkpoint {i+1}</label>
                  <input type="text" placeholder={`Required Step ${i+1}`} className="w-full border-2 border-black p-3 text-xs font-black bg-slate-50 dark:bg-white/5" 
                    value={newMission.checkpoints[i]} 
                    onChange={e => handleCheckpointUpdate(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleDeployMission} disabled={loading} className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.4em] text-sm border-4 border-black shadow-[8px_8px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : <Target size={20} />}
              <span>DEPLOY MISSION PROTOCOL</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-black/40">Reward Designation</label>
                <input type="text" placeholder="e.g., 50% OFF CABIN" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5" value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-black/40">RC Price</label>
                <input type="number" placeholder="500 RC" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5" value={newVoucher.cost} onChange={e => setNewVoucher({...newVoucher, cost: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-black/40">Encrypted Redemption Code</label>
              <input type="text" placeholder="CABIN-50-RW" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 dark:bg-white/5 uppercase" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} />
            </div>
            <button onClick={handleDeployVoucher} disabled={loading} className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.4em] text-sm border-4 border-black shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">
              {loading ? <Loader2 className="animate-spin" /> : <Ticket size={20} />}
              <span>AUTHORIZE VOUCHER MINT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="bg-black text-[#4ade80] p-10 border-[6px] border-[#4ade80] font-mono shadow-[12px_12px_0px_0px_#000] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#4ade80]/20">
        <h2 className="text-3xl font-black flex items-center gap-4"><Activity className="animate-pulse" size={32} /> SYSTEM LOGS_v4.0</h2>
        <span className="text-[10px] bg-[#4ade80] text-black px-3 py-1 font-black">STABLE</span>
      </div>
      <div className="space-y-4 h-[600px] overflow-y-auto no-scrollbar pr-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 italic">
            <p>> STANDBY: No logs recorded in current session.</p>
            <p>> INITIATING SYSTEM TRACKING...</p>
          </div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="border-b border-[#4ade80]/10 pb-4 flex gap-6 group hover:bg-white/5 transition-colors p-2">
              <span className="text-gray-500 text-xs shrink-0 pt-1">[{new Date(log.created_at).toLocaleTimeString()}]</span>
              <div className="flex-1">
                <span className="text-[#ffde59] font-black mr-3">[{log.title || 'SYSTEM'}]</span>
                <span className="leading-relaxed">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] pb-20 font-lexend transition-colors duration-500">
      <header className="bg-black text-white p-6 border-b-4 border-[#834bf1] sticky top-0 z-[100] shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Terminal className="text-[#834bf1]" size={32} strokeWidth={3} />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">TERMINAL <span className="text-[#834bf1]">ADMIN</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-2 bg-white/10 hover:bg-white/20 border-2 border-white/20 transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { auth.signOut(); onLogout(); }} className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              <span>Exit</span> <LogOut size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-[#111] border-b-4 border-black sticky top-[88px] z-50">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
          {[
            { id: 'incoming', label: 'Signals', icon: Bell, count: submissions.length },
            { id: 'console', label: 'Console', icon: Layout },
            { id: 'ledger', label: 'Ledger', icon: Activity },
            { id: 'alliance', label: 'Alliance', icon: Building2 },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-6 min-w-[150px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                activeTab === tab.id ? 'bg-[#834bf1] text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-400'
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
        {activeTab === 'incoming' && renderIncomingSignals()}
        {activeTab === 'console' && renderConsole()}
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'alliance' && <BrandManager />}
      </main>

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchData} />
      )}
    </div>
  );
};