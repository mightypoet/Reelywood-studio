import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Send, FileText, CheckCircle, AlertCircle, Filter, ShieldCheck, Ticket, Calendar,
  Layout, ChevronDown, ChevronUp, TrendingUp, DollarSign, BarChart3
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

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

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'missions' | 'vouchers' | 'users' | 'ledger' | 'brands' | 'submissions'>('deploy');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Core Data State
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  
  // Selection State
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Forms
  const [missionForm, setMissionForm] = useState({ 
    title: '', reward: '', brand_id: '', expires_at: '', description: '', 
    factor1: '', factor2: '', factor3: '' 
  });
  
  const [voucherForm, setVoucherForm] = useState({ 
    title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' 
  });

  useEffect(() => {
    fetchAllData();
    const pollId = window.setInterval(fetchAllData, 8000); 
    return () => clearInterval(pollId);
  }, []);

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [uRes, mRes, vRes, bRes, sRes, tRes, uvRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('vouchers').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name), missions(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('user_vouchers').select('*')
      ]);

      if (uRes.data) setUsers(uRes.data);
      if (mRes.data) setMissions(mRes.data);
      if (vRes.data) setVouchers(vRes.data);
      if (bRes.data) setBrands(bRes.data);
      if (sRes.data) setSubmissions(sRes.data);
      if (tRes.data) setTransactions(tRes.data);
      if (uvRes.data) setUserVouchers(uvRes.data);

    } catch (e) { 
      console.error("TERMINAL_FETCH_ERROR:", e); 
    }
  };

  // --- MONITORING LOGIC ---

  const getDetailedAgentStats = (uid: string) => {
    const approvedSubs = submissions.filter(s => s.user_id === uid && (s.status === 'approved' || s.status === 'completed'));
    const assignedMissions = missions.filter(m => Array.isArray(m.assigned_to) && m.assigned_to.includes(uid));
    const redeemed = userVouchers.filter(uv => uv.user_uid === uid).length;
    const lifetimeSpent = transactions
      .filter(t => t.user_uid === uid && t.amount < 0)
      .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    return { 
      completed: approvedSubs.length, 
      active: assignedMissions.length,
      redeemedCount: redeemed,
      spent: lifetimeSpent
    };
  };

  const getBrandHealth = (brandId: string) => {
    const brandMissions = missions.filter(m => m.brand_id === brandId);
    const brandVouchers = vouchers.filter(v => v.brand_id === brandId);
    const brandMissionIds = brandMissions.map(m => m.id);
    const brandSubmissions = submissions.filter(s => brandMissionIds.includes(s.mission_id)).length;
    
    return {
      missionCount: brandMissions.length,
      voucherCount: brandVouchers.length,
      engagement: brandSubmissions
    };
  };

  // --- ACTIONS ---

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleExecuteDeploy = async () => {
    if (!supabase || !selectedProtocol) return;
    
    let targetList: string[] = selectedCreatorIds;
    if (selectedCreatorIds.length === 0) {
       if (!confirm("DEPLOY GLOBALLY (TO ALL USERS)?")) return;
       targetList = []; 
    }

    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      const { error } = await supabase
        .from(table)
        .update({ assigned_to: targetList })
        .eq('id', selectedProtocol.id);

      if (error) throw error;
      
      showToast('success', `${selectedProtocol.type.toUpperCase()} DEPLOYED SUCCESSFULLY`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { 
      showToast('error', e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !missionForm.brand_id) return alert("Select an Alliance Node (Brand) first.");

    setSubmitting(true);
    const vFactors = [missionForm.factor1, missionForm.factor2, missionForm.factor3].filter(f => f.trim() !== '');
    try {
      const payload = {
        title: missionForm.title,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        description: missionForm.description,
        verification_factors: vFactors,
        assigned_to: ['DRAFT'],
        expires_at: missionForm.expires_at ? new Date(missionForm.expires_at).toISOString() : null
      };
      
      const { error } = await supabase.from('missions').insert([payload]);
      if (error) throw error;

      showToast('success', "MISSION SYNCED TO HUB");
      setMissionForm({ title: '', reward: '', brand_id: '', expires_at: '', description: '', factor1: '', factor2: '', factor3: '' });
      fetchAllData();
    } catch (e: any) { 
      showToast('error', e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !voucherForm.brand_id) return alert("Select an Alliance Node (Brand) first.");

    setSubmitting(true);
    try {
      const payload = {
        brand_id: voucherForm.brand_id,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost) || 0,
        description: voucherForm.description,
        expires_at: voucherForm.expires_at ? new Date(voucherForm.expires_at).toISOString() : null,
        status: 'draft',
        assigned_to: ['DRAFT'],
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      };
      
      const { error } = await supabase.from('vouchers').insert([payload]);
      if (error) throw error;
      
      showToast('success', "VOUCHER GENERATED");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });
      fetchAllData(); 
    } catch (e: any) { 
      showToast('error', e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handlePurge = async (id: string, type: 'mission' | 'voucher') => {
    if (!supabase || !confirm(`PURGE ${type.toUpperCase()}?`)) return;
    const table = type === 'mission' ? 'missions' : 'vouchers';
    await supabase.from(table).delete().eq('id', id);
    fetchAllData();
  };

  const bg = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-black';
  const card = darkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = darkMode ? 'border-white' : 'border-black';

  return (
    <div className={`min-h-[100svh] ${bg} ${text} font-mono pb-10`}>
      {notify && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-4 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            <span className="font-black text-[10px] uppercase">{notify.msg}</span>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchAllData} />
      )}

      <header className={`border-b-4 ${border} ${card} px-4 py-3 flex justify-between items-center sticky top-0 z-50`}>
        <div className="flex items-center gap-2"><Terminal size={18}/><h1 className="text-sm font-black italic uppercase font-display tracking-tight tracking-tighter">Terminal <span className="opacity-40 text-[10px] not-italic ml-2">v2.1 Master</span></h1></div>
        <div className="flex gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'} active:scale-90 transition-all`}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-1 text-[10px] font-black uppercase border-2 border-black active:scale-90 shadow-[2px_2px_0px_0px_#000]">Exit</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {[
          { l: 'AGENTS', v: users.length, i: Users },
          { l: 'MISSIONS', v: missions.length, i: Zap },
          { l: 'VOUCHERS', v: vouchers.length, i: Gift },
          { l: 'QUEUED', v: submissions.filter(s=>s.status==='pending').length, i: Activity }
        ].map((s, i) => (
          <div key={i} className={`${card} border-2 ${border} p-3 shadow-[3px_3px_0px_0px_#000]`}>
            <p className="text-[7px] font-black uppercase opacity-40">{s.l}</p>
            <div className="flex justify-between items-end"><h3 className="text-xl font-black italic">{s.v}</h3><s.i size={14} className="opacity-20"/></div>
          </div>
        ))}
      </div>

      <div className="px-4 flex overflow-x-auto gap-1 no-scrollbar pt-2 pb-1">
        {[
          { id: 'deploy', label: 'DEPLOY', icon: Send },
          { id: 'missions', label: 'MISSIONS', icon: Zap },
          { id: 'vouchers', label: 'VOUCHERS', icon: Gift },
          { id: 'users', label: 'AGENTS', icon: Users },
          { id: 'submissions', label: 'QUEUE', icon: ListChecks },
          { id: 'brands', label: 'BRANDS', icon: Building2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} 
            className={`flex items-center gap-2 px-4 py-3 border-t-2 border-x-2 ${border} font-black text-[9px] uppercase whitespace-nowrap active:scale-95 transition-all ${activeTab === t.id ? `${card} -mb-[2px] z-10` : 'bg-gray-800 text-white/50 border-transparent'}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div className={`mx-4 border-[3px] ${border} ${card} min-h-[500px] p-4 shadow-[4px_4px_0px_0px_#000]`}>
        
        {activeTab === 'deploy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-3 h-[600px]">
              <div className="flex justify-between items-center bg-gray-100 p-2 border-2 border-black text-black">
                <h3 className="text-xs font-black uppercase">Creator Intelligence</h3>
                <span className="text-[8px] font-bold bg-blue-500 text-white px-2 py-0.5 border border-black">SELECTED: {selectedCreatorIds.length}</span>
              </div>
              <div className="flex-1 overflow-auto border-2 border-black bg-white">
                <table className="w-full text-left text-black">
                    <thead className="bg-black text-white text-[8px] uppercase font-black sticky top-0 z-10">
                      <tr><th className="p-2 w-8"><CheckSquare size={10}/></th><th className="p-2">Identity</th><th className="p-2">Deep Monitor</th></tr>
                    </thead>
                    <tbody className="text-[9px] font-bold">
                      {users.map(u => {
                        const stats = getDetailedAgentStats(u.firebase_uid);
                        return (
                          <tr key={u.id} onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
                              className={`border-b border-gray-100 cursor-pointer ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-50' : ''}`}>
                            <td className="p-2"><div className={`w-3 h-3 border border-black ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-600' : 'bg-white'}`}/></td>
                            <td className="p-2 truncate">
                              <div className="font-black uppercase truncate w-32">{u.display_name}</div>
                              <div className="text-[7px] text-gray-400 font-mono">{u.email}</div>
                            </td>
                            <td className="p-2">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1 border border-black">DONE: {stats.completed}</span>
                                  <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1 border border-black">ACT: {stats.active}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[9px] font-black text-[#834bf1]">VAULT: {u.reelcoins} RC</span>
                                   <span className="text-[8px] font-bold text-gray-400">(Redeemed: {stats.redeemedCount})</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 h-[600px]">
              <h3 className="text-xs font-black uppercase flex items-center gap-2 italic"><Send size={12}/> Deployment Console</h3>
              <div className="bg-[#111] p-3 border border-gray-800 text-[8px] font-bold">
                 {selectedCreatorIds.length > 0 ? <span className="text-blue-400">Targeting {selectedCreatorIds.length} Nodes</span> : <span className="text-rose-500 animate-pulse">Global Broadcast Active (No Sel)</span>}
              </div>
              <div className="flex-1 overflow-auto space-y-2 pr-1">
                <p className="text-[7px] font-black uppercase text-gray-500 bg-gray-900 p-1 sticky top-0">Missions</p>
                {missions.map(item => (
                  <div key={`m-${item.id}`} onClick={() => setSelectedProtocol({id: item.id, type: 'mission'})}
                       className={`border-2 p-2 cursor-pointer transition-all flex justify-between items-center ${selectedProtocol?.id === item.id && selectedProtocol?.type === 'mission' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-[#1a1a1a]'}`}>
                    <div className="min-w-0">
                      <div className="font-black text-[9px] uppercase truncate">{item.title}</div>
                      <div className="text-[7px] text-gray-500">{item.reward_amount} RC</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handlePurge(item.id, 'mission'); }} className="opacity-20 hover:opacity-100 hover:text-rose-500 transition-all"><Trash2 size={10}/></button>
                  </div>
                ))}
                <p className="text-[7px] font-black uppercase text-gray-500 bg-gray-900 p-1 sticky top-0 mt-2">Vouchers</p>
                {vouchers.map(item => (
                  <div key={`v-${item.id}`} onClick={() => setSelectedProtocol({id: item.id, type: 'voucher'})}
                       className={`border-2 p-2 cursor-pointer transition-all flex justify-between items-center ${selectedProtocol?.id === item.id && selectedProtocol?.type === 'voucher' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-[#1a1a1a]'}`}>
                    <div className="min-w-0">
                      <div className="font-black text-[9px] uppercase truncate">{item.title}</div>
                      <div className="text-[7px] text-gray-500">{item.cost} RC</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handlePurge(item.id, 'voucher'); }} className="opacity-20 hover:opacity-100 hover:text-rose-500 transition-all"><Trash2 size={10}/></button>
                  </div>
                ))}
              </div>
              <button onClick={handleExecuteDeploy} disabled={submitting || !selectedProtocol}
                className="w-full py-4 bg-[#834bf1] text-white border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
                Execute Deployment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-md mx-auto py-4">
             <form onSubmit={handleMissionSubmit} className="space-y-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-black">
               <h3 className="font-black text-sm uppercase italic flex items-center gap-2"><Zap size={16} className="text-purple-500"/> Create Mission</h3>
               <select className="w-full p-3 border-2 border-black font-bold text-xs" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                  <option value="">-- ALLIANCE NODE --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
               <input className="w-full p-3 border-2 border-black font-bold text-xs" placeholder="MISSION IDENTITY" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
               <div className="grid grid-cols-2 gap-3">
                 <input className="w-full p-3 border-2 border-black font-bold text-xs" type="number" placeholder="BOUNTY (RC)" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                 <input className="w-full p-3 border-2 border-black font-bold text-[10px]" type="datetime-local" value={missionForm.expires_at} onChange={e => setMissionForm({...missionForm, expires_at: e.target.value})}/>
               </div>
               <textarea className="w-full p-3 border-2 border-black font-bold text-xs h-24 resize-none" placeholder="MISSION BRIEF..." required value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})}/>
               <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_#834bf1] active:scale-[0.98]">Save as Draft</button>
             </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-md mx-auto py-4">
            <form onSubmit={handleVoucherSubmit} className="space-y-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-black">
              <h3 className="font-black text-sm uppercase italic flex items-center gap-2"><Gift size={16} className="text-blue-500"/> Create Voucher Template</h3>
              <select className="w-full p-3 border-2 border-black font-bold text-xs" required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}>
                <option value="">-- ALLIANCE NODE --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input className="w-full p-3 border-2 border-black font-bold text-xs" placeholder="VOUCHER IDENTITY" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full p-3 border-2 border-black font-bold text-xs" type="number" placeholder="ACQUISITION COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                <input className="w-full p-3 border-2 border-black font-bold text-xs uppercase" placeholder="SYSTEM HASH (OPT)" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})}/>
              </div>
              <textarea className="w-full p-3 border-2 border-black font-bold text-xs h-20 resize-none" placeholder="VOUCHER PERKS / TERMS..." required value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})}/>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_#ffde59] active:scale-[0.98]">Save as Draft</button>
            </form>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="space-y-10">
            <BrandManager />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
               {brands.map(brand => {
                 const health = getBrandHealth(brand.id);
                 return (
                   <div key={`health-${brand.id}`} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] text-black">
                      <div className="flex items-center gap-4 mb-4">
                         <img src={brand.logo_url} className="w-10 h-10 border-2 border-black object-contain" />
                         <h4 className="font-black text-sm uppercase italic truncate">{brand.name}</h4>
                      </div>
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-black/10 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xl font-black italic">{health.missionCount}</div>
                          <div className="text-[7px] font-bold uppercase tracking-widest text-gray-400">Missions</div>
                        </div>
                        <div>
                          <div className="text-xl font-black italic">{health.voucherCount}</div>
                          <div className="text-[7px] font-bold uppercase tracking-widest text-gray-400">Rewards</div>
                        </div>
                        <div>
                          <div className="text-xl font-black italic text-[#834bf1]">{health.engagement}</div>
                          <div className="text-[7px] font-bold uppercase tracking-widest text-gray-400">Subs</div>
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white text-black p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <h3 className="font-black mb-4 text-xs uppercase italic">Agent Roster</h3>
            <div className="overflow-auto max-h-[500px]">
              {users.map(u => {
                const stats = getDetailedAgentStats(u.firebase_uid);
                return (
                  <div key={u.id} className="border-b border-gray-100 py-3 flex justify-between items-center px-2 hover:bg-gray-50">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black italic shrink-0">{u.display_name?.charAt(0)}</div>
                        <div className="min-w-0">
                          <div className="font-bold uppercase text-[10px] truncate">{u.display_name}</div>
                          <div className="text-[7px] text-gray-400 font-mono truncate">{u.email}</div>
                        </div>
                     </div>
                     <div className="flex gap-4 shrink-0 items-center">
                        <div className="text-right flex flex-col gap-1">
                          <div className="flex gap-2">
                             <div className="text-[8px] font-black px-1 border border-black bg-blue-50">ACT: {stats.active}</div>
                             <div className="text-[8px] font-black px-1 border border-black bg-emerald-50">OK: {stats.completed}</div>
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600">{u.reelcoins} RC VAULT</div>
                        </div>
                        {u.card_status === 'pending' ? (
                          <div className="flex gap-1">
                            <button onClick={() => supabase!.from('profiles').update({ card_status: 'approved' }).eq('firebase_uid', u.firebase_uid).then(fetchAllData)} className="p-1.5 border border-black bg-emerald-50 text-emerald-600 active:scale-90"><Check size={10}/></button>
                            <button onClick={() => supabase!.from('profiles').update({ card_status: 'rejected' }).eq('firebase_uid', u.firebase_uid).then(fetchAllData)} className="p-1.5 border border-black bg-rose-50 text-rose-600 active:scale-90"><X size={10}/></button>
                          </div>
                        ) : <span className={`px-2 py-0.5 border border-black text-[7px] font-black uppercase ${u.card_status === 'approved' ? 'bg-emerald-400' : 'bg-rose-400'}`}>{u.card_status}</span>}
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {submissions.filter(s=>s.status==='pending').map(sub => (
               <div key={sub.id} className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-black">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-sm uppercase italic truncate pr-4">{sub.profiles?.display_name}</h4>
                    <div className="bg-yellow-400 w-2 h-2 rounded-full animate-pulse border border-black"></div>
                  </div>
                  <p className="text-[9px] text-gray-500 uppercase truncate mb-4">DEPLOYMENT: {sub.missions?.title}</p>
                  <button onClick={() => setSelectedSubmission(sub)} className="bg-black text-[#ffde59] w-full py-2 font-black text-[9px] border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] active:translate-y-0.5 active:shadow-none transition-all uppercase italic">Verify Evidence</button>
               </div>
             ))}
             {submissions.filter(s=>s.status==='pending').length === 0 && <div className="col-span-full py-20 text-center opacity-20 font-black uppercase text-[10px] tracking-widest italic">Grid silent. No signals detected.</div>}
           </div>
        )}

        {activeTab === 'ledger' && (
          <div className="bg-white text-black p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
            <h3 className="font-black mb-4 text-xs uppercase italic">Global Transaction Ledger</h3>
            <div className="overflow-auto max-h-[500px]">
              {transactions.map(t => (
                <div key={t.id} className="border-b border-gray-100 py-3 flex justify-between items-center text-[10px]">
                   <div className="flex gap-4">
                     <span className="opacity-30 font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                     <span className="font-bold uppercase">{t.description}</span>
                   </div>
                   <span className={`font-black ${t.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{t.amount > 0 ? '+' : ''}{t.amount} RC</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};