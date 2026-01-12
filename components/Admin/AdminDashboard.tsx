import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Send, FileText, CheckCircle, AlertCircle, Filter, ShieldCheck, Ticket
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

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
  platform?: string;
  followers?: number;
  niche?: string;
  created_at: string;
}

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'missions' | 'vouchers' | 'users' | 'ledger' | 'brands' | 'submissions'>('deploy');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('admin-theme');
       return saved === 'dark' || saved === null;
    }
    return true;
  });
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data Stores
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  // DEPLOYMENT STATE
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Forms
  const [missionForm, setMissionForm] = useState({ title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', brand_id: '', code: '', description: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        onLogout();
        return;
    }

    // Initial load
    fetchAllData();

    // Set up invisible background polling every 5 seconds
    const pollId = window.setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => { 
        if (pollId) clearInterval(pollId); 
    };
  }, []);

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [u, m, v, t, b, s] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name), missions(title, reward_amount, checkpoints)').order('created_at', { ascending: false })
      ]);
      
      if (u.data) setUsers(u.data);
      if (m.data) setMissions(m.data);
      if (v.data) setVouchers(v.data);
      if (t.data) setTransactions(t.data);
      if (b.data) setBrands(b.data);
      if (s.data) setSubmissions(s.data);
    } catch (e) { console.error(e); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const getAgentStats = (uid: string) => {
    return {
      completed: submissions.filter(s => s.user_id === uid && s.status === 'approved').length,
      claimed: transactions.filter(t => t.user_uid === uid && t.amount < 0).length,
      active: missions.filter(m => Array.isArray(m.assigned_to) && m.assigned_to.includes(uid)).length
    };
  };

  const handleDeleteProtocol = async (e: React.MouseEvent, id: string, type: 'mission' | 'voucher') => {
    e.stopPropagation(); 
    if (!supabase) return;
    if (!confirm(`⚠️ PERMANENTLY DELETE THIS ${type.toUpperCase()}?\nThis will remove it from all user dashboards.`)) return;

    setSubmitting(true);
    try {
        const table = type === 'mission' ? 'missions' : 'rewards';
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        
        showToast('success', `${type.toUpperCase()} PURGED FROM GRID`);
        if (selectedProtocol?.id === id) setSelectedProtocol(null);
        fetchAllData();
    } catch (e: any) {
        showToast('error', e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleExecuteDeploy = async () => {
    if (!supabase) return;
    if (!selectedProtocol) return showToast('error', "SELECT A MISSION OR VOUCHER FIRST");
    
    let targetList: string[] | null = selectedCreatorIds;
    if (selectedCreatorIds.length === 0) {
       if (!confirm("⚠️ NO CREATORS SELECTED.\n\nDeploy this globally to ALL active nodes?")) return;
       targetList = null; 
    }

    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'rewards';
      const { error } = await supabase
        .from(table)
        .update({ assigned_to: targetList })
        .eq('id', selectedProtocol.id);

      if (error) throw error;
      showToast('success', `PROTOCOL DEPLOYED TO ${targetList ? targetList.length : 'ALL'} NODES`);
      
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const createDraftMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!missionForm.title || !missionForm.reward || !missionForm.brand_id) return showToast('error', "MISSING IDENTITY FIELDS");
    
    setSubmitting(true);
    try {
      const brand = brands.find(b => b.id === missionForm.brand_id);
      await supabase.from('missions').insert([{
        title: missionForm.title,
        description: brand?.description || 'No specific mission brief provided.',
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        location: brand?.location_text || 'Global Sync',
        image_url: brand?.cover_image_url || '',
        checkpoints: [missionForm.checkpoint1, missionForm.checkpoint2, missionForm.checkpoint3].filter(c => c),
        assigned_to: ['DRAFT'] 
      }]);
      showToast('success', "MISSION DRAFTED. LAUNCH VIA DEPLOY TAB.");
      setMissionForm({ title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const createDraftVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!voucherForm.title || !voucherForm.brand_id || !voucherForm.cost) return showToast('error', "MISSING VOUCHER DATA");
    
    setSubmitting(true);
    try {
      const brand = brands.find(b => b.id === voucherForm.brand_id);
      await supabase.from('rewards').insert([{
        brand_id: voucherForm.brand_id,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        description: voucherForm.description || brand?.description || 'Exclusive partner voucher.',
        assigned_to: ['DRAFT'] 
      }]);
      showToast('success', "VOUCHER DRAFTED. LAUNCH VIA DEPLOY TAB.");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (uid: string, status: string) => {
    if (!supabase) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('profiles').update({ card_status: status }).eq('firebase_uid', uid);
      if (error) throw error;
      showToast('success', `NODE STATUS UPDATED: ${status.toUpperCase()}`);
      fetchAllData();
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const bg = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const text = darkMode ? 'text-white' : 'text-black';
  const card = darkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = darkMode ? 'border-white' : 'border-black';

  return (
    <div className={`min-h-screen ${bg} ${text} font-mono pb-20`}>
      {notify && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-4 px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            {notify.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span className="font-bold text-xs uppercase tracking-widest">{notify.msg}</span>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
          onRefresh={fetchAllData} 
        />
      )}

      <header className={`border-b-4 ${border} ${card} px-6 py-4 flex justify-between sticky top-0 z-50`}>
        <div className="flex items-center gap-4"><Terminal size={24}/><h1 className="text-xl font-black italic">TERMINAL <span className="text-gray-500 text-sm not-italic ml-2">v2.1 Master</span></h1></div>
        <div className="flex gap-4">
           <button onClick={() => {
              const newVal = !darkMode;
              setDarkMode(newVal);
              localStorage.setItem('admin-theme', newVal ? 'dark' : 'light');
           }} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-1 text-xs font-black uppercase border-2 border-black">Exit</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { l: 'AGENTS', v: users.length, i: Users },
          { l: 'MISSIONS', v: missions.length, i: Zap },
          { l: 'VOUCHERS', v: vouchers.length, i: Gift },
          { l: 'TX VOL', v: transactions.length, i: Activity }
        ].map((s, i) => (
          <div key={i} className={`${card} border-2 ${border} p-4 shadow-[4px_4px_0px_0px_#000]`}>
            <p className="text-[9px] font-black uppercase opacity-40">{s.l}</p>
            <div className="flex justify-between items-end"><h3 className="text-3xl font-black italic">{s.v}</h3><s.i className="opacity-20"/></div>
          </div>
        ))}
      </div>

      <div className="px-6 flex overflow-x-auto gap-1">
        {[
          { id: 'deploy', label: 'DEPLOY', icon: Send },
          { id: 'missions', label: 'NEW MISSION', icon: Zap },
          { id: 'vouchers', label: 'NEW VOUCHER', icon: Gift },
          { id: 'users', label: 'AGENTS', icon: Users },
          { id: 'submissions', label: 'QUEUED', icon: ListChecks },
          { id: 'ledger', label: 'LEDGER', icon: FileText },
          { id: 'brands', label: 'ALLIANCE', icon: Building2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} 
            className={`flex items-center gap-2 px-6 py-4 border-t-4 border-x-4 ${border} font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? `${card} -mb-[4px] z-10` : 'bg-gray-800 text-white/50 border-transparent'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className={`mx-6 border-4 ${border} ${card} min-h-[600px] p-6 shadow-[8px_8px_0px_0px_#000]`}>
        
        {activeTab === 'deploy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-8 flex flex-col gap-4 h-[700px]">
              <div className="flex justify-between items-center bg-gray-100 p-3 border-2 border-black">
                <h3 className="text-lg font-black text-black italic uppercase flex items-center gap-2"><Users size={18}/> CREATOR INTELLIGENCE</h3>
                <span className="text-xs font-bold bg-blue-500 text-white px-3 py-1 border border-black shadow-[2px_2px_0px_0px_#000]">SELECTED: {selectedCreatorIds.length}</span>
              </div>
              <div className="flex-1 overflow-auto border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
                <table className="w-full text-left text-black">
                  <thead className="bg-black text-white text-[9px] uppercase font-black sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center"><CheckSquare size={14}/></th>
                      <th className="p-3">Identity (Name/ID)</th>
                      <th className="p-3">Profile Stats</th>
                      <th className="p-3">Performance Data</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-bold">
                    {users.map(u => {
                      const stats = getAgentStats(u.firebase_uid);
                      const isSelected = selectedCreatorIds.includes(u.firebase_uid);
                      return (
                        <tr key={u.id} onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
                            className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-100' : ''}`}>
                          <td className="p-3 text-center">
                            <div className={`w-4 h-4 border-2 border-black mx-auto ${isSelected ? 'bg-blue-600' : 'bg-white'}`}/>
                          </td>
                          <td className="p-3">
                            <div className="font-black uppercase text-xs">{u.display_name}</div>
                            <div className="text-[9px] text-gray-500 font-mono mb-1">{u.email}</div>
                            <div className="text-[8px] bg-gray-200 inline-block px-1 rounded">{u.firebase_uid}</div>
                          </td>
                          <td className="p-3 space-y-1">
                             <div className="flex items-center gap-1"><Instagram size={10}/> {u.followers || 0} Followers</div>
                             <div className="text-gray-500 uppercase">{u.niche || 'General'}</div>
                          </td>
                          <td className="p-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                               <div className="bg-emerald-100 p-1 border border-black"><div className="text-emerald-700">{stats.completed}</div><div className="text-[7px]">DONE</div></div>
                               <div className="bg-purple-100 p-1 border border-black"><div className="text-purple-700">{stats.claimed}</div><div className="text-[7px]">USED</div></div>
                               <div className="bg-blue-100 p-1 border border-black"><div className="text-blue-700">{stats.active}</div><div className="text-[7px]">ACTIVE</div></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 h-[700px] border-l-4 border-black pl-8 border-dashed">
              <div className="bg-black text-white p-3 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <h3 className="text-lg font-black italic uppercase flex items-center gap-2"><Send size={18}/> DEPLOYMENT CONSOLE</h3>
              </div>
              <div className="bg-[#111] p-4 border-2 border-gray-700 mb-2">
                <p className="text-[9px] font-black uppercase text-gray-500 mb-2">TARGET SUMMARY</p>
                {selectedCreatorIds.length > 0 ? (
                  <div className="text-sm font-black text-blue-400">Targeting {selectedCreatorIds.length} Nodes</div>
                ) : (
                  <div className="text-sm font-black text-rose-500 animate-pulse">GLOBAL BROADCAST (ALL)</div>
                )}
              </div>
              <div className="flex-1 overflow-auto space-y-3 pr-2 custom-scrollbar">
                <p className="text-[10px] font-black uppercase bg-gray-800 text-white px-2 py-1 sticky top-0">MISSIONS</p>
                {missions.map(m => {
                   const isDraft = m.assigned_to?.includes('DRAFT');
                   return (
                    <div key={m.id} 
                        onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                        className={`border-2 p-3 cursor-pointer transition-all relative ${selectedProtocol?.id === m.id && selectedProtocol.type === 'mission' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-[#1a1a1a] hover:border-gray-500'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-black text-xs uppercase truncate pr-6">{m.title}</span>
                        <button onClick={(e) => handleDeleteProtocol(e, m.id, 'mission')} className="text-gray-500 hover:text-rose-500 p-1 transition-colors"><Trash2 size={12}/></button>
                      </div>
                      <div className="flex gap-2 mt-1 items-center">
                         {isDraft && <span className="text-[8px] bg-yellow-500 text-black px-1 font-bold">DRAFT</span>}
                         <span className="text-[9px] text-gray-400">{m.reward_amount} RC</span>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] font-black uppercase bg-gray-800 text-white px-2 py-1 sticky top-0 mt-4">VOUCHERS</p>
                {vouchers.map(v => {
                   const isDraft = v.assigned_to?.includes('DRAFT');
                   return (
                    <div key={v.id} 
                        onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                        className={`border-2 p-3 cursor-pointer transition-all relative ${selectedProtocol?.id === v.id && selectedProtocol.type === 'voucher' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-[#1a1a1a] hover:border-gray-500'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-black text-xs uppercase truncate pr-6">{v.title}</span>
                        <button onClick={(e) => handleDeleteProtocol(e, v.id, 'voucher')} className="text-gray-500 hover:text-rose-500 p-1 transition-colors"><Trash2 size={12}/></button>
                      </div>
                      <div className="flex gap-2 mt-1 items-center">
                         {isDraft && <span className="text-[8px] bg-yellow-500 text-black px-1 font-bold">DRAFT</span>}
                         <span className="text-[9px] text-gray-400">{v.cost} RC</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={handleExecuteDeploy}
                disabled={submitting || !selectedProtocol}
                className="w-full py-4 bg-[#834bf1] text-white border-2 border-white font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#fff] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                {submitting ? <Loader2 className="animate-spin mx-auto"/> : "EXECUTE DEPLOYMENT"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Zap className="text-purple-500"/> CREATE MISSION TEMPLATE</h2>
            <form onSubmit={createDraftMission} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Partner Brand</label>
                <select className="w-full p-4 border-4 border-black font-bold text-black bg-gray-50" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                  <option value="">-- SELECT ALLIANCE NODE --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Mission Title</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="e.g. VISUAL CAPTURE: CABIN17" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Reward (RC)</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" placeholder="000" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
              </div>
              <div className="bg-gray-100 p-4 border-2 border-black space-y-2">
                <p className="text-xs font-black text-black flex items-center gap-2"><ShieldCheck size={14}/> VERIFICATION FACTORS</p>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 1 (e.g. Primary Tag)" value={missionForm.checkpoint1} onChange={e => setMissionForm({...missionForm, checkpoint1: e.target.value})}/>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 2 (e.g. Visual Match)" value={missionForm.checkpoint2} onChange={e => setMissionForm({...missionForm, checkpoint2: e.target.value})}/>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 3 (e.g. Caption Check)" value={missionForm.checkpoint3} onChange={e => setMissionForm({...missionForm, checkpoint3: e.target.value})}/>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase border-2 border-transparent hover:bg-gray-800 transition-all">
                {submitting ? 'SYNCING...' : 'SAVE AS DRAFT'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Gift className="text-blue-500"/> CREATE VOUCHER TEMPLATE</h2>
            <form onSubmit={createDraftVoucher} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Alliance Node</label>
                <select className="w-full p-4 border-4 border-black font-bold text-black bg-gray-50" required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}>
                  <option value="">-- SELECT BRAND --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Voucher Identity</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="e.g. 50% OFF PREMIUM DINING" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-gray-400">Acquisition Cost (RC)</label>
                   <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" placeholder="COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase text-gray-400">System Hash Code</label>
                   <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="OPTIONAL HASH" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})}/>
                 </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Briefing (Optional)</label>
                <textarea className="w-full p-4 border-4 border-black font-bold text-black resize-none" rows={3} placeholder="Describe the voucher perks..." value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})}></textarea>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-gray-900 transition-all">
                {submitting ? 'SYNCING...' : 'SAVE AS DRAFT'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}
        
        {activeTab === 'users' && (
          <div className="bg-white text-black p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-black mb-6 text-xl uppercase italic font-display">Full Agent Roster</h3>
            <div className="overflow-auto max-h-[600px]">
              {users.map(u => (
                <div key={u.id} className="border-b-2 border-gray-100 py-4 flex justify-between items-center hover:bg-gray-50 px-4 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black italic">{u.display_name?.charAt(0)}</div>
                      <div>
                        <div className="font-bold uppercase text-sm tracking-tight">{u.display_name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{u.email}</div>
                      </div>
                   </div>
                   <div className="flex gap-6 items-center">
                      <div className="text-right">
                         <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Liquid Assets</div>
                         <div className="font-bold text-emerald-600 text-sm">{u.reelcoins} RC</div>
                      </div>
                      <div className="flex items-center gap-2">
                         {u.card_status === 'pending' ? (
                           <div className="flex gap-2">
                             <button onClick={() => handleUpdateStatus(u.firebase_uid, 'rejected')} className="p-2 border-2 border-black bg-rose-500 text-white hover:bg-rose-600 transition-colors" title="Reject"><X size={14} strokeWidth={3}/></button>
                             <button onClick={() => handleUpdateStatus(u.firebase_uid, 'approved')} className="p-2 border-2 border-black bg-emerald-500 text-white hover:bg-emerald-600 transition-colors" title="Approve"><Check size={14} strokeWidth={3}/></button>
                           </div>
                         ) : (
                           <span className={`px-3 py-1 border-2 border-black text-[9px] font-black uppercase h-fit tracking-widest ${u.card_status === 'approved' ? 'bg-emerald-400 text-black' : 'bg-rose-400 text-black'}`}>{u.card_status}</span>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {submissions.filter(s => s.status === 'pending').length === 0 && <div className="col-span-full py-20 text-center opacity-40 font-black uppercase text-xs tracking-[0.5em] italic">No pending transmissions detected.</div>}
             {submissions.filter(s => s.status === 'pending').map(sub => (
               <div key={sub.id} className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] text-black hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-lg uppercase leading-tight italic">{sub.profiles?.display_name}</h4>
                    <span className="text-[8px] bg-slate-100 px-2 py-1 font-bold border border-black uppercase tracking-widest italic">Mission Signal</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Deployment: {sub.missions?.title || sub.mission?.title}</p>
                  <button onClick={() => setSelectedSubmission(sub)} className="bg-yellow-400 w-full py-3 font-black text-xs border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-widest italic">Verify Evidence</button>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white text-black p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
            <h3 className="font-black mb-8 text-2xl uppercase italic font-display tracking-tight">Global Transaction Ledger</h3>
            <div className="overflow-auto max-h-[600px] border-[3px] border-black">
              {transactions.map(t => (
                <div key={t.id} className="border-b-2 border-slate-100 last:border-b-0 py-4 px-6 flex justify-between items-center text-[11px] font-bold hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-6">
                     <span className="text-gray-400 font-mono text-[9px] uppercase">{new Date(t.created_at).toLocaleDateString()}</span>
                     <span className="uppercase tracking-tight">{t.description}</span>
                   </div>
                   <span className={`italic font-black text-sm ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.amount > 0 ? '+' : ''}{t.amount} RC</span>
                </div>
              ))}
              {transactions.length === 0 && <div className="p-12 text-center opacity-30 font-black uppercase text-[10px] tracking-widest italic">Ledger empty. No assets shifted.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};