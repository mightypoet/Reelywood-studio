import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Layout, Activity, Bell, Trash2, Edit3, 
  RefreshCw, Zap, Terminal, LogOut, ExternalLink, 
  Loader2, Target, Ticket, Building2, ShieldCheck, X 
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'ledger' | 'alliance'>('incoming');
  const [loading, setLoading] = useState(false);
  
  // Data States using type casting to avoid generic parser issues
  const [submissions, setSubmissions] = useState([] as any[]);
  const [logs, setLogs] = useState([] as any[]);
  const [brands, setBrands] = useState([] as any[]);
  const [missions, setMissions] = useState([] as any[]);
  const [selectedSubmission, setSelectedSubmission] = useState(null as any);

  // Console / Form States
  const [consoleMode, setConsoleMode] = useState<'MISSION' | 'VOUCHER'>('MISSION');
  const [editingMission, setEditingMission] = useState(null as any);

  const [newMission, setNewMission] = useState({
    title: '', 
    description: '', 
    reward: 100, 
    location: '', 
    brand_id: '', 
    image_url: '', 
    checkpoints: ['', '', '']
  });

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

      // 2. Missions
      const { data: missionData } = await supabase.from('missions').select('*, partner_brands(name)').order('created_at', { ascending: false });
      setMissions((missionData || []) as any[]);

      // 3. Ledger Logs
      const { data: logData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs((logData || []) as any[]);

      // 4. Alliance Partners
      const { data: brandData } = await supabase.from('partner_brands').select('*');
      setBrands((brandData || []) as any[]);

    } catch (err) { 
      console.error("Admin Terminal Error:", err); 
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

    const channel = supabase?.channel('admin-grid-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, []);

  const handleDeployMission = async () => {
    if (!supabase) return;
    if (!newMission.brand_id) return alert("SELECT A BRAND FIRST");
    
    const payload = {
      title: newMission.title,
      description: newMission.description,
      reward_amount: newMission.reward,
      brand_id: newMission.brand_id,
      location: newMission.location,
      image_url: newMission.image_url,
      checkpoints: newMission.checkpoints.filter(c => c.trim() !== '')
    };

    try {
      let error;
      if (editingMission) {
        const { error: err } = await supabase.from('missions').update(payload).eq('id', editingMission.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('missions').insert([payload]);
        error = err;
      }

      if (error) throw error;
      alert(editingMission ? "🚀 MISSION UPDATED" : "🚀 MISSION DEPLOYED");
      setEditingMission(null);
      setNewMission({ title: '', description: '', reward: 100, location: '', brand_id: '', image_url: '', checkpoints: ['', '', ''] });
      fetchData();
    } catch (err: any) {
      alert("Deployment Error: " + err.message);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!supabase || !window.confirm("⚠️ SYSTEM OVERRIDE: Purge this node?")) return;
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Purge Failed: " + err.message);
    }
  };

  const startEditMission = (m: any) => {
    setEditingMission(m);
    setConsoleMode('MISSION');
    setNewMission({
      title: m.title,
      description: m.description,
      reward: m.reward_amount,
      location: m.location,
      brand_id: m.brand_id,
      image_url: m.image_url,
      checkpoints: m.checkpoints || ['', '', '']
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandSelect = (e: any) => {
    const id = e.target.value;
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    
    if (consoleMode === 'MISSION') {
      setNewMission({ 
        ...newMission, 
        brand_id: id, 
        location: brand.location_text, 
        image_url: brand.cover_image_url, 
        title: `Protocol: ${brand.name}` 
      });
    }
  };

  const renderIncomingSignals = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-5xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
      {submissions.length === 0 ? (
        <div className="p-32 text-center border-4 border-dashed border-black/10 bg-white/50">
          <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
          <p className="text-2xl font-black opacity-20 uppercase italic font-display">No Signals Detected</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="bg-white border-4 border-black p-0 shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row relative group overflow-hidden">
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
                  <p className="text-[9px] font-black uppercase text-black/40 mb-1 tracking-widest">Active Mission</p>
                  <h4 className="font-black text-lg uppercase italic mb-3">{sub.missions?.title || "Project Alpha"}</h4>
                  <a href={sub.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-50 border-2 border-black/10 p-2 text-[10px] font-black text-blue-600 underline truncate max-w-[300px]">
                    <ExternalLink size={12}/> {sub.link}
                  </a>
                </div>
                <button onClick={() => setSelectedSubmission(sub)} className="bg-black text-white px-10 py-5 font-black uppercase text-xs tracking-widest hover:bg-[#4ade80] hover:text-black hover:shadow-[6px_6px_0px_0px_#000] transition-all border-2 border-transparent hover:border-black shrink-0">VERIFY SIGNAL</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConsole = () => (
    <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in zoom-in-95">
      <div className="lg:col-span-5 space-y-10">
        <div className="bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_0px_#000] sticky top-32">
          <div className="flex gap-4 mb-8">
            <button onClick={() => setConsoleMode('MISSION')} className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest border-4 border-black transition-all ${consoleMode === 'MISSION' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🚀 Mission</button>
            <button onClick={() => setConsoleMode('VOUCHER')} className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest border-4 border-black transition-all ${consoleMode === 'VOUCHER' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🎟️ Voucher</button>
          </div>
          <div className="space-y-6">
            <select className="w-full bg-slate-50 border-[3px] border-black p-4 font-black text-xs outline-none focus:bg-[#ffde59] transition-all" onChange={handleBrandSelect} value={newMission.brand_id}>
              <option value="">-- SELECT ALLIANCE PARTNER --</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
            </select>
            {consoleMode === 'MISSION' ? (
              <div className="space-y-4">
                <input type="text" placeholder="Protocol Identification" className="w-full border-[3px] border-black p-4 font-black text-sm bg-slate-50" value={newMission.title} onChange={e => setNewMission({...newMission, title: e.target.value})} />
                <textarea placeholder="Mission Briefing" className="w-full border-[3px] border-black p-4 font-black text-sm bg-slate-50 h-32" value={newMission.description} onChange={e => setNewMission({...newMission, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="RC Bounty" className="w-full border-[3px] border-black p-4 font-black text-sm bg-slate-50" value={newMission.reward} onChange={e => setNewMission({...newMission, reward: parseInt(e.target.value)})} />
                  <input type="text" placeholder="Image URL" className="w-full border-[3px] border-black p-4 font-black text-sm bg-slate-50" value={newMission.image_url} onChange={e => setNewMission({...newMission, image_url: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-4">
                   {editingMission && <button onClick={() => {setEditingMission(null); setNewMission({title:'', description:'', reward:100, location:'', brand_id:'', image_url:'', checkpoints:['','','']})}} className="flex-1 bg-white border-[3px] border-black p-4 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#000]">Abort</button>}
                   <button onClick={handleDeployMission} className="flex-[2] bg-black text-white p-5 font-black uppercase text-xs tracking-[0.4em] border-[3px] border-black shadow-[6px_6px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 transition-all">
                    {editingMission ? "Sync Changes" : "Deploy Proto"}
                   </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-4 border-dashed border-black/10">
                <Ticket className="mx-auto mb-4 opacity-20" size={40}/>
                <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Voucher node coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lg:col-span-7 space-y-8">
        <h3 className="text-3xl font-black italic uppercase font-display border-b-4 border-black pb-4">Live Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((m: any) => (
            <div key={m.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col group hover:shadow-[12px_12px_0px_0px_#ffde59] transition-all">
              <h4 className="font-black text-lg uppercase italic mb-2 leading-none">{m.title}</h4>
              <p className="text-[9px] font-bold text-[#834bf1] uppercase tracking-widest mb-4">Partner: {m.partner_brands?.name || "Original"}</p>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => startEditMission(m)} className="flex-1 bg-white border-2 border-black py-2 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                  <Edit3 size={12}/> Edit
                </button>
                <button onClick={() => handleDelete('missions', m.id)} className="px-4 bg-rose-600 text-white border-2 border-black py-2">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLedger = () => (
    <div className="bg-black text-[#4ade80] p-10 border-[6px] border-[#4ade80] font-mono shadow-[12px_12px_0px_0px_#000] animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#4ade80]/20">
        <h2 className="text-3xl font-black flex items-center gap-4 italic"><Activity size={32} /> SYSTEM_LOG</h2>
        <span className="text-[10px] bg-[#4ade80] text-black px-3 py-1 font-black">ACTIVE_SYNC</span>
      </div>
      <div className="space-y-4 h-[600px] overflow-y-auto no-scrollbar pr-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 italic uppercase tracking-[0.3em]">
            <p>&gt; Standby for transmissions...</p>
          </div>
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
      <header className="bg-black text-white p-6 border-b-4 border-[#834bf1] sticky top-0 z-[100] shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Terminal className="text-[#834bf1]" size={32} />
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">TERMINAL <span className="text-[#834bf1]">ADMIN</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-2 bg-white/10 border-2 border-white/20 transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { auth.signOut(); onLogout(); }} className="flex items-center gap-3 bg-rose-600 text-white px-5 py-2 font-black uppercase text-xs tracking-[0.2em] border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <span>Logoff</span> <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

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