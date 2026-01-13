
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Send, FileText, CheckCircle, AlertCircle, Filter, ShieldCheck, Ticket, Calendar,
  Layout
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

  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const [missionForm, setMissionForm] = useState({ 
    title: '', 
    reward: '', 
    brand_id: '', 
    expires_at: '',
    description: '',
    factor1: '',
    factor2: '',
    factor3: ''
  });
  
  const [voucherForm, setVoucherForm] = useState({ 
    title: '', 
    cost: '', 
    brand_id: '', 
    code: '', 
    description: '', 
    expires_at: '' 
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        onLogout();
        return;
    }
    fetchAllData();
    const pollId = window.setInterval(() => { fetchAllData(); }, 5000);
    return () => { if (pollId) clearInterval(pollId); };
  }, []);

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [u, m, v, t, b, s] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').eq('description', 'ilike', '%voucher%').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name), missions(*)').order('created_at', { ascending: false })
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

  const getAgentStats = (uid: string) => ({
    completed: submissions.filter(s => s.user_id === uid && s.status === 'approved').length,
    claimed: transactions.filter(t => t.user_uid === uid && t.amount < 0).length,
    active: missions.filter(m => Array.isArray(m.assigned_to) && m.assigned_to.includes(uid)).length
  });

  const handleExecuteDeploy = async () => {
    if (!supabase || !selectedProtocol) return;
    let targetList: string[] | null = selectedCreatorIds;
    if (selectedCreatorIds.length === 0) {
       if (!confirm("DEPLOY GLOBALLY?")) return;
       targetList = null; 
    }
    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'rewards';
      // FIX: Ensure parameters are passed as a single object to satisfy SDK typing
      await supabase.from(table).update({ assigned_to: targetList }).eq('id', selectedProtocol.id);
      showToast('success', `DEPLOYED TO ${targetList ? targetList.length : 'ALL'}`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const handleUpdateStatus = async (uid: string, status: string) => {
    if (!supabase) return;
    setSubmitting(true);
    try {
      // FIX: Standard update call is .update({col: val}).eq('id', target)
      await supabase.from('profiles').update({ card_status: status }).eq('firebase_uid', uid);
      showToast('success', `STATUS: ${status.toUpperCase()}`);
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    const vFactors = [missionForm.factor1, missionForm.factor2, missionForm.factor3].filter(f => f.trim() !== '');
    try {
      await supabase.from('missions').insert([{
        title: missionForm.title,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        description: missionForm.description,
        verification_factors: vFactors,
        assigned_to: ['DRAFT'],
        expires_at: missionForm.expires_at || null
      }]);
      showToast('success', "MISSION SYNCED TO HUB");
      setMissionForm({ title: '', reward: '', brand_id: '', expires_at: '', description: '', factor1: '', factor2: '', factor3: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
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
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
          onRefresh={fetchAllData} 
        />
      )}

      <header className={`border-b-4 ${border} ${card} px-4 py-3 flex justify-between items-center sticky top-0 z-50`}>
        <div className="flex items-center gap-2"><Terminal size={18}/><h1 className="text-sm font-black italic">ADMIN</h1></div>
        <div className="flex gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'} active:scale-90 transition-all`}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-3 py-1 text-[10px] font-black uppercase border-2 border-black active:scale-90">Exit</button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {[
          { l: 'AGENTS', v: users.length, i: Users },
          { l: 'MISSIONS', v: missions.length, i: Zap },
          { l: 'VOUCHERS', v: vouchers.length, i: Gift },
          { l: 'TX', v: transactions.length, i: Activity }
        ].map((s, i) => (
          <div key={i} className={`${card} border-2 ${border} p-3 shadow-[3px_3px_0px_0px_#000]`}>
            <p className="text-[7px] font-black uppercase opacity-40 truncate">{s.l}</p>
            <div className="flex justify-between items-end"><h3 className="text-xl font-black italic">{s.v}</h3><s.i size={14} className="opacity-20"/></div>
          </div>
        ))}
      </div>

      <div className="px-4 flex overflow-x-auto gap-1 no-scrollbar pb-1">
        {[
          { id: 'deploy', label: 'DEPLOY', icon: Send },
          { id: 'missions', label: 'MISSIONS', icon: Zap },
          { id: 'vouchers', label: 'VOUCHERS', icon: Gift },
          { id: 'users', label: 'AGENTS', icon: Users },
          { id: 'submissions', label: 'QUEUE', icon: ListChecks },
          { id: 'brands', label: 'BRANDS', icon: Building2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} 
            className={`flex items-center gap-2 px-4 py-3 border-t-2 border-x-2 ${border} font-black text-[9px] uppercase whitespace-nowrap transition-all active:scale-95 ${activeTab === t.id ? `${card} -mb-[2px] z-10` : 'bg-gray-800 text-white/50 border-transparent'}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <div className={`mx-4 border-[3px] ${border} ${card} min-h-[400px] p-4 shadow-[4px_4px_0px_0px_#000]`}>
        
        {activeTab === 'deploy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex flex-col gap-3 h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-100 p-2 border-2 border-black gap-2">
                <h3 className="text-xs font-black text-black uppercase flex items-center gap-2">CREATOR INTEL</h3>
                <span className="text-[8px] font-bold bg-blue-500 text-white px-2 py-0.5 border border-black self-start">SEL: {selectedCreatorIds.length}</span>
              </div>
              <div className="flex-1 overflow-auto border-2 border-black bg-white">
                <div className="min-w-[600px]">
                  <table className="w-full text-left text-black">
                    <thead className="bg-black text-white text-[8px] uppercase font-black sticky top-0 z-10">
                      <tr>
                        <th className="p-2 w-8 text-center"><CheckSquare size={10}/></th>
                        <th className="p-2">Identity</th>
                        <th className="p-2">Stats</th>
                        <th className="p-2">Perf</th>
                      </tr>
                    </thead>
                    <tbody className="text-[9px] font-bold">
                      {users.map(u => (
                        <tr key={u.id} onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
                            className={`border-b border-gray-100 cursor-pointer ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-50' : ''}`}>
                          <td className="p-2 text-center"><div className={`w-3 h-3 border border-black mx-auto ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-600' : 'bg-white'}`}/></td>
                          <td className="p-2 truncate"><div className="font-black truncate w-32 uppercase">{u.display_name}</div><div className="text-[7px] text-gray-400 font-mono">{u.email}</div></td>
                          <td className="p-2"><div className="flex items-center gap-1"><Instagram size={8}/> {u.followers || 0}</div></td>
                          <td className="p-2"><div className="flex gap-1"><span className="bg-emerald-100 text-emerald-700 px-1 border border-black">{getAgentStats(u.firebase_uid).completed}</span><span className="bg-blue-100 text-blue-700 px-1 border border-black">{getAgentStats(u.firebase_uid).active}</span></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 h-[400px] border-t-2 lg:border-t-0 lg:border-l-2 border-black border-dashed pt-4 lg:pt-0 lg:pl-4">
              <h3 className="text-xs font-black uppercase flex items-center gap-2">CONSOLE</h3>
              <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
                {missions.map(m => (
                  <div key={m.id} onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                       className={`border-2 p-2 cursor-pointer active:scale-[0.98] transition-all relative ${selectedProtocol?.id === m.id && selectedProtocol?.type === 'mission' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-200 bg-[#1a1a1a]'}`}>
                    <div className="font-black text-[9px] uppercase truncate pr-4">{m.title}</div>
                    <div className="text-[7px] text-gray-400">{m.reward_amount} RC</div>
                  </div>
                ))}
                {vouchers.map(v => (
                  <div key={v.id} onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                       className={`border-2 p-2 cursor-pointer active:scale-[0.98] transition-all relative ${selectedProtocol?.id === v.id && selectedProtocol?.type === 'voucher' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 bg-[#1a1a1a]'}`}>
                    <div className="font-black text-[9px] uppercase truncate pr-4">{v.title}</div>
                    <div className="text-[7px] text-gray-400">{v.cost} RC</div>
                  </div>
                ))}
              </div>
              <button onClick={handleExecuteDeploy} disabled={submitting || !selectedProtocol}
                className="w-full py-3 bg-[#834bf1] text-white border-2 border-black font-black uppercase text-[9px] shadow-[3px_3px_0px_0px_#000] active:scale-95 transition-all disabled:opacity-50">
                EXECUTE DEPLOY
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white text-black p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <h3 className="font-black mb-4 text-xs uppercase italic">AGENT ROSTER</h3>
            <div className="overflow-auto max-h-[400px]">
              {users.map(u => (
                <div key={u.id} className="border-b border-gray-100 py-3 flex justify-between items-center gap-2">
                   <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">{u.display_name?.charAt(0)}</div>
                      <div className="min-w-0"><div className="font-bold uppercase text-[10px] truncate">{u.display_name}</div><div className="text-[7px] text-gray-400 font-mono truncate">{u.email}</div></div>
                   </div>
                   <div className="flex gap-2 shrink-0">
                      {u.card_status === 'pending' ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleUpdateStatus(u.firebase_uid, 'approved')} className="p-1.5 border border-black bg-emerald-500 text-white active:scale-90"><Check size={10} strokeWidth={4}/></button>
                          <button onClick={() => handleUpdateStatus(u.firebase_uid, 'rejected')} className="p-1.5 border border-black bg-rose-500 text-white active:scale-90"><X size={10} strokeWidth={4}/></button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 border border-black text-[7px] font-black uppercase ${u.card_status === 'approved' ? 'bg-emerald-400' : 'bg-rose-400'}`}>{u.card_status}</span>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {submissions.filter(s => s.status === 'pending').length === 0 && <div className="col-span-full py-10 text-center opacity-30 font-black uppercase text-[8px] tracking-[0.4em]">Queue Empty</div>}
             {submissions.filter(s => s.status === 'pending').map(sub => (
               <div key={sub.id} className="bg-white p-4 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black">
                  <h4 className="font-black text-sm uppercase italic truncate mb-2">{sub.profiles?.display_name}</h4>
                  <p className="text-[8px] text-gray-500 uppercase truncate mb-3">M: {sub.missions?.title}</p>
                  <button onClick={() => setSelectedSubmission(sub)} className="bg-yellow-400 w-full py-2 font-black text-[9px] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:scale-95 uppercase">VERIFY</button>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-xl mx-auto py-4">
             <form onSubmit={handleMissionSubmit} className="space-y-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
               <h3 className="font-black text-black text-sm uppercase mb-4 italic flex items-center gap-2"><Zap size={16}/> New Mission Grid</h3>
               <div className="grid grid-cols-2 gap-4">
                 <select className="col-span-2 w-full p-3 border-2 border-black font-bold text-black text-xs" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                    <option value="">-- ALLIANCE NODE --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
                 <input className="col-span-2 w-full p-3 border-2 border-black font-bold text-black text-xs" placeholder="MISSION TITLE" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
                 <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="number" placeholder="BOUNTY (RC)" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                 <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="datetime-local" value={missionForm.expires_at} onChange={e => setMissionForm({...missionForm, expires_at: e.target.value})}/>
               </div>
               <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-black/40">Mission Details</label>
                 <textarea className="w-full p-3 border-2 border-black font-bold text-black text-xs h-32 resize-none" placeholder="FULL MISSION BRIEF..." required value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})}/>
               </div>
               <div className="space-y-3 pt-2 border-t-2 border-black/5">
                 <label className="text-[8px] font-black uppercase text-[#834bf1]">Verification Factors (Checklist)</label>
                 <div className="space-y-2">
                   {['factor1', 'factor2', 'factor3'].map((f, i) => (
                     <div key={f} className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-black/20">0{i+1}</span>
                       <input className="flex-1 p-2 border-2 border-black font-bold text-black text-xs" placeholder={`Key Factor ${i+1}`} value={(missionForm as any)[f]} onChange={e => setMissionForm({...missionForm, [f]: e.target.value})} required />
                     </div>
                   ))}
                 </div>
               </div>
               <button disabled={submitting} className="w-full py-4 mt-4 bg-black text-white font-black uppercase text-[10px] active:scale-95 shadow-[4px_4px_0px_0px_#834bf1] hover:shadow-none transition-all">SYNC DRAFT</button>
             </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-md mx-auto py-4">
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!supabase) return;
              setSubmitting(true);
              try {
                await supabase.from('rewards').insert([{
                  brand_id: voucherForm.brand_id,
                  title: voucherForm.title,
                  cost: parseInt(voucherForm.cost),
                  code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                  description: voucherForm.description,
                  assigned_to: ['DRAFT'],
                  expires_at: voucherForm.expires_at || null
                }]);
                showToast('success', "VOUCHER DRAFTED");
                setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });
                fetchAllData();
              } catch (e: any) { showToast('error', e.message); }
              finally { setSubmitting(false); }
            }} className="space-y-4 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              <h3 className="font-black text-black text-sm uppercase mb-4 italic flex items-center gap-2"><Gift size={16}/> New Voucher Drop</h3>
              <select className="w-full p-3 border-2 border-black font-bold text-black text-xs" required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}>
                <option value="">-- ALLIANCE NODE --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" placeholder="VOUCHER NAME" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
              <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="number" placeholder="COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
              <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="datetime-local" value={voucherForm.expires_at} onChange={e => setVoucherForm({...voucherForm, expires_at: e.target.value})}/>
              <textarea className="w-full p-3 border-2 border-black font-bold text-black text-xs h-24 resize-none" placeholder="VOUCHER DESCRIPTION..." required value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})}/>
              <button disabled={submitting} className="w-full py-3 bg-black text-white font-black uppercase text-[10px] active:scale-95">SAVE VOUCHER</button>
            </form>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}
      </div>
    </div>
  );
};
