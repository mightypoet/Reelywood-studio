import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Send, FileText, CheckCircle, AlertCircle, Filter,
  ShieldCheck
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
  // SET DEFAULT TAB TO 'DEPLOY'
  const [activeTab, setActiveTab] = useState<'deploy' | 'missions' | 'vouchers' | 'users' | 'ledger' | 'brands' | 'submissions'>('deploy');
  /* Fix: Set correct boolean type for darkMode state to avoid SetStateAction<true> error */
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('admin-theme') === 'dark' || true);
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
  const [missionForm, setMissionForm] = useState({ title: '', reward: '', brand_id: '', location: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' });
  const [voucherForm, setVoucherForm] = useState({ brandId: '', title: '', cost: '', code: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) onLogout();
    fetchAllData();

    if (supabase) {
      const channel = supabase.channel('admin-live')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchAllData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
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
        supabase.from('submissions').select('*, profiles(display_name, email), missions(title, reward_amount, checkpoints)').order('created_at', { ascending: false })
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

  // --- STATS CALCULATOR ---
  const getAgentStats = (uid: string) => {
    return {
      completed: submissions.filter(s => (s.user_id === uid || s.profiles?.firebase_uid === uid) && s.status === 'approved').length,
      claimed: transactions.filter(t => t.user_uid === uid && t.amount < 0).length,
      active: missions.filter(m => Array.isArray(m.assigned_to) && m.assigned_to.includes(uid)).length
    };
  };

  // --- ACTIONS ---

  const handleExecuteDeploy = async () => {
    if (!selectedProtocol) return showToast('error', "SELECT A MISSION OR VOUCHER FIRST");
    
    // Logic: If NO creators selected -> Confirm Global Deploy. If Creators selected -> Selective Deploy.
    let targetList: string[] | null = selectedCreatorIds;
    
    if (selectedCreatorIds.length === 0) {
       if (!confirm("⚠️ NO CREATORS SELECTED.\n\nDeploy this globally to ALL users?")) return;
       targetList = null; // API expects null for Global
    }

    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'rewards';
      const { error } = await supabase!
        .from(table)
        .update({ assigned_to: targetList })
        .eq('id', selectedProtocol.id);

      if (error) throw error;
      showToast('success', `PROTOCOL DEPLOYED TO ${targetList ? targetList.length : 'ALL'} NODES`);
      
      // Reset
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
    if (!missionForm.title || !missionForm.reward || !missionForm.brand_id) return showToast('error', "MISSING FIELDS");
    setSubmitting(true);
    try {
      const brand = brands.find(b => b.id === missionForm.brand_id);
      await supabase!.from('missions').insert([{
        title: missionForm.title,
        description: brand?.description,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        location: missionForm.location || brand?.location_text,
        image_url: brand?.cover_image_url,
        checkpoints: [missionForm.checkpoint1, missionForm.checkpoint2, missionForm.checkpoint3].filter(c => c),
        assigned_to: ['DRAFT'] // HIDDEN FROM EVERYONE INITIALLY
      }]);
      showToast('success', "MISSION DRAFTED. SWITCH TO DEPLOY TAB TO LAUNCH.");
      setMissionForm({ title: '', reward: '', brand_id: '', location: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const createDraftVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.title || !voucherForm.brandId) return showToast('error', "MISSING FIELDS");
    setSubmitting(true);
    try {
      await supabase!.from('rewards').insert([{
        brand_id: voucherForm.brandId,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        code: voucherForm.code,
        assigned_to: ['DRAFT'] // HIDDEN INITIALLY
      }]);
      showToast('success', "VOUCHER DRAFTED. SWITCH TO DEPLOY TAB TO LAUNCH.");
      setVoucherForm({ brandId: '', title: '', cost: '', code: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (uid: string, status: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase!.from('profiles').update({ card_status: status }).eq('firebase_uid', uid);
      if (error) throw error;
      showToast('success', `AGENT STATUS UPDATED: ${status.toUpperCase()}`);
      fetchAllData();
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = darkMode;
  const bg = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const text = isDark ? 'text-white' : 'text-black';
  const card = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = isDark ? 'border-white' : 'border-black';

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
        <div className="flex items-center gap-4"><Terminal size={24}/><h1 className="text-xl font-black italic">TERMINAL <span className="text-gray-500 text-sm not-italic ml-2">v2.0 Deploy</span></h1></div>
        <div className="flex gap-4">
           {/* Fix: setDarkMode correctly updates boolean state */}
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${isDark ? 'bg-yellow-400 text-black' : 'bg-black text-white'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-1 text-xs font-black uppercase border-2 border-black">Exit</button>
        </div>
      </header>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          { l: 'AGENTS', v: users.length, i: Users },
          { l: 'MISSIONS', v: missions.length, i: Zap },
          { l: 'ALLIANCE', v: brands.length, i: Building2 },
          { l: 'TX VOL', v: transactions.length, i: Activity }
        ].map((s, i) => (
          <div key={i} className={`${card} border-2 ${border} p-4 shadow-[4px_4px_0px_0px_#000]`}>
            <p className="text-[9px] font-black uppercase opacity-40">{s.l}</p>
            <div className="flex justify-between items-end"><h3 className="text-3xl font-black italic">{s.v}</h3><s.i className="opacity-20"/></div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="px-6 flex overflow-x-auto gap-1">
        {[
          { id: 'deploy', label: 'DEPLOY', icon: Send },
          { id: 'missions', label: 'CREATE MISSION', icon: Zap },
          { id: 'vouchers', label: 'CREATE VOUCHER', icon: Gift },
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
        
        {/* === TAB 1: DEPLOYMENT CENTER === */}
        {activeTab === 'deploy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* LEFT: CREATOR INTELLIGENCE TABLE (8 cols) */}
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
                        <tr key={u.id} 
                            onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
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

            {/* RIGHT: PROTOCOL SELECTOR (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-[700px] border-l-4 border-black pl-8 border-dashed">
              <div className="bg-black text-white p-3 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <h3 className="text-lg font-black italic uppercase flex items-center gap-2"><Send size={18}/> DEPLOYMENT CONSOLE</h3>
              </div>
              
              <div className="bg-[#111] p-4 border-2 border-gray-700 mb-2">
                <p className="text-[9px] font-black uppercase text-gray-500 mb-2">TARGET SUMMARY</p>
                {selectedCreatorIds.length > 0 ? (
                  <div className="text-sm font-black text-blue-400">Targeting {selectedCreatorIds.length} Specific Nodes</div>
                ) : (
                  <div className="text-sm font-black text-rose-500 animate-pulse">GLOBAL BROADCAST (ALL)</div>
                )}
              </div>

              <div className="flex-1 overflow-auto space-y-3 pr-2">
                <p className="text-[10px] font-black uppercase bg-gray-800 text-white px-2 py-1 sticky top-0">SELECT PROTOCOL</p>
                
                {/* LIST MISSIONS */}
                {missions.map(m => {
                   const isDraft = m.assigned_to?.includes('DRAFT');
                   return (
                    <div key={m.id} 
                        onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                        className={`border-2 p-3 cursor-pointer transition-all relative ${selectedProtocol?.id === m.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-[#1a1a1a] hover:border-gray-500'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-black text-xs uppercase truncate pr-4">{m.title}</span>
                        <div className="flex gap-1">
                          {isDraft && <span className="text-[8px] bg-yellow-500 text-black px-1 font-bold">DRAFT</span>}
                          <Zap size={12} className="text-purple-500"/>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">{m.partner_brands?.name} • <span className="text-white">{m.reward_amount} RC</span></div>
                    </div>
                  );
                })}

                {/* LIST VOUCHERS */}
                {vouchers.map(v => {
                   const isDraft = v.assigned_to?.includes('DRAFT');
                   return (
                    <div key={v.id} 
                        onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                        className={`border-2 p-3 cursor-pointer transition-all ${selectedProtocol?.id === v.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-[#1a1a1a] hover:border-gray-500'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-black text-xs uppercase truncate pr-4">{v.title}</span>
                        <div className="flex gap-1">
                          {isDraft && <span className="text-[8px] bg-yellow-500 text-black px-1 font-bold">DRAFT</span>}
                          <Gift size={12} className="text-blue-500"/>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">{v.cost} RC</div>
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

        {/* === TAB 2: CREATE MISSION === */}
        {activeTab === 'missions' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Zap className="text-purple-500"/> CREATE MISSION TEMPLATE</h2>
            <form onSubmit={createDraftMission} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Partner Brand</label>
                <select className="w-full p-4 border-4 border-black font-bold text-black bg-gray-50" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                  <option value="">-- SELECT BRAND --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Mission Title</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="e.g. POST REEL" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Reward (RC)</label>
                    <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" placeholder="000" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-gray-400">Location</label>
                    <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="Global" value={missionForm.location} onChange={e => setMissionForm({...missionForm, location: e.target.value})}/>
                 </div>
              </div>
              <div className="bg-gray-100 p-4 border-2 border-black space-y-2">
                <p className="text-xs font-black text-black flex items-center gap-2"><ShieldCheck size={14}/> VERIFICATION FACTORS</p>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 1 (e.g. Follow)" value={missionForm.checkpoint1} onChange={e => setMissionForm({...missionForm, checkpoint1: e.target.value})}/>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 2 (e.g. Like)" value={missionForm.checkpoint2} onChange={e => setMissionForm({...missionForm, checkpoint2: e.target.value})}/>
                <input className="w-full p-2 border border-black text-black text-sm" placeholder="Factor 3 (e.g. Tag)" value={missionForm.checkpoint3} onChange={e => setMissionForm({...missionForm, checkpoint3: e.target.value})}/>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase border-2 border-transparent hover:bg-gray-800 transition-all">
                {submitting ? 'SAVING...' : 'SAVE AS DRAFT'}
              </button>
            </form>
          </div>
        )}

        {/* === TAB 3: CREATE VOUCHER === */}
        {activeTab === 'vouchers' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Gift className="text-blue-500"/> CREATE VOUCHER TEMPLATE</h2>
            <form onSubmit={createDraftVoucher} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <select className="w-full p-4 border-4 border-black font-bold text-black" required value={voucherForm.brandId} onChange={e => setVoucherForm({...voucherForm, brandId: e.target.value})}>
                <option value="">SELECT BRAND</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="VOUCHER TITLE" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                 <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" placeholder="COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                 <input className="w-full p-4 border-4 border-black font-bold text-black" placeholder="CODE / HASH" required value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})}/>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase">SAVE AS DRAFT</button>
            </form>
          </div>
        )}

        {/* === OTHER TABS === */}
        {activeTab === 'brands' && <BrandManager />}
        
        {activeTab === 'users' && (
          <div className="bg-white text-black p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-black mb-6 text-xl uppercase">FULL AGENT ROSTER</h3>
            <div className="overflow-auto max-h-[600px]">
              {users.map(u => (
                <div key={u.id} className="border-b-2 border-gray-100 py-4 flex justify-between items-center hover:bg-gray-50 px-2">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black">{u.display_name?.charAt(0)}</div>
                      <div>
                        <div className="font-bold uppercase">{u.display_name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="text-right">
                         <div className="text-[10px] font-black text-gray-400">BALANCE</div>
                         <div className="font-bold text-emerald-600">{u.reelcoins} RC</div>
                      </div>
                      <div className="flex items-center gap-2">
                         {u.card_status === 'pending' ? (
                           <>
                             <button onClick={() => handleUpdateStatus(u.firebase_uid, 'rejected')} className="p-2 border-2 border-black bg-rose-500 text-white"><X size={14}/></button>
                             <button onClick={() => handleUpdateStatus(u.firebase_uid, 'approved')} className="p-2 border-2 border-black bg-emerald-500 text-white"><Check size={14}/></button>
                           </>
                         ) : (
                           <span className={`px-2 py-1 border-2 border-black text-[10px] uppercase h-fit ${u.card_status === 'approved' ? 'bg-emerald-400' : 'bg-rose-400'}`}>{u.card_status}</span>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {submissions.filter(s => s.status === 'pending').length === 0 && <div className="p-8 text-center opacity-50 font-black">NO PENDING SUBMISSIONS</div>}
             {submissions.filter(s => s.status === 'pending').map(sub => (
               <div key={sub.id} className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] text-black">
                  <h4 className="font-black">{sub.profiles?.display_name}</h4>
                  <p className="text-xs text-gray-500 mb-2">Submitted for: {sub.missions?.title}</p>
                  <button onClick={() => setSelectedSubmission(sub)} className="bg-yellow-400 w-full py-2 font-black text-xs border-2 border-black">VERIFY PROOF</button>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white text-black p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000]">
            <h3 className="font-black mb-6 text-xl uppercase">GLOBAL TRANSACTION LEDGER</h3>
            <div className="overflow-auto max-h-[600px]">
              {transactions.map(t => (
                <div key={t.id} className="border-b border-gray-100 py-3 flex justify-between items-center text-xs font-bold">
                   <div>
                     <span className="text-gray-400 mr-4 font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                     <span className="uppercase">{t.description}</span>
                   </div>
                   <span className={t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}>{t.amount > 0 ? '+' : ''}{t.amount} RC</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};