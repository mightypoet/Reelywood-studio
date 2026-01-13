
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
  Layout, ChevronDown, ChevronUp
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
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Core Data State
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Form State
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
    const pollId = window.setInterval(() => { fetchAllData(); }, 8000);
    return () => { if (pollId) clearInterval(pollId); };
  }, []);

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [u, m, v, t, b, s] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('vouchers').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').ilike('description', '%voucher%').order('created_at', { ascending: false }),
        // CRITICAL FIX: Fetch real Brand IDs (UUIDs) and Names
        supabase.from('partner_brands').select('id, name').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name), missions(*)').order('created_at', { ascending: false })
      ]);
      
      if (u.data) setUsers(u.data);
      if (m.data) setMissions(m.data);
      if (v.data) setVouchers(v.data);
      if (t.data) setTransactions(t.data);
      if (b.data) {
        console.log('SYNC: Alliance Nodes Fetched:', b.data);
        setBrandOptions(b.data);
      }
      if (s.data) setSubmissions(s.data);
    } catch (e) { console.error("TERMINAL_FETCH_ERROR:", e); }
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
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      const { error } = await supabase.from(table).update({ assigned_to: targetList }).eq('id', selectedProtocol.id);
      if (error) throw error;
      showToast('success', `${selectedProtocol.type.toUpperCase()} DEPLOYED TO ${targetList ? targetList.length : 'ALL'}`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!missionForm.brand_id) return alert("Select an Alliance Node (Brand) first.");

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
      
      console.log('SYNC: Saving Mission Draft:', payload);
      const { error } = await supabase.from('missions').insert([payload]);
      if (error) throw error;

      showToast('success', "MISSION SYNCED TO HUB");
      setMissionForm({ title: '', reward: '', brand_id: '', expires_at: '', description: '', factor1: '', factor2: '', factor3: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // GUARDRAIL: Prevent Foreign Key Violations (Ensures brand_id is a UUID)
    if (!voucherForm.brand_id) {
      alert("⚠️ PROTOCOL ERROR: Please select a valid Alliance Node (Brand) from the database.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        brand_id: voucherForm.brand_id, // This is the UUID from partner_brands
        name: voucherForm.title,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost) || 0,
        description: voucherForm.description,
        expires_at: voucherForm.expires_at ? new Date(voucherForm.expires_at).toISOString() : null,
        status: 'draft',
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      };
      
      console.log('SYNC: Transmitting Voucher Payload:', payload);
      
      const { error } = await supabase.from('vouchers').insert([payload]);
      if (error) throw error;
      
      showToast('success', "VOUCHER TEMPLATE SAVED AS DRAFT");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });
      fetchAllData();
    } catch (e: any) { 
      console.error('SYNC_FATAL_ERROR:', e);
      showToast('error', e.message); 
    } finally { setSubmitting(false); }
  };

  const bg = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-black';
  const card = darkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = darkMode ? 'border-white' : 'border-black';

  const deployableItems = [
    ...missions.map(m => ({ id: m.id, title: m.title, value: m.reward_amount, type: 'mission' })),
    ...vouchers.map(v => ({ id: v.id, title: v.title || v.name, value: v.cost, type: 'voucher' }))
  ].sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  return (
    <div className={`min-h-[100svh] ${bg} ${text} font-lexend pb-10`}>
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
        <div className="flex items-center gap-2"><Terminal size={18}/><h1 className="text-sm font-black italic font-display">ADMIN PORTAL</h1></div>
        <div className="flex gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'} active:scale-90 transition-all`}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-3 py-1 text-[10px] font-black uppercase border-2 border-black active:scale-90">Terminate</button>
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
            <div className="flex justify-between items-end"><h3 className="text-xl font-black italic font-display">{s.v}</h3><s.i size={14} className="opacity-20"/></div>
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
              <h3 className="text-xs font-black uppercase flex items-center gap-2">DEPLOYMENT CONSOLE</h3>
              <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
                {deployableItems.map(item => (
                  <div key={`${item.type}-${item.id}`} onClick={() => setSelectedProtocol({id: item.id, type: item.type as any})}
                       className={`border-2 p-2 cursor-pointer active:scale-[0.98] transition-all relative ${selectedProtocol?.id === item.id && selectedProtocol?.type === item.type ? (item.type === 'mission' ? 'border-purple-500 bg-purple-500/10' : 'border-blue-500 bg-blue-500/10') : 'border-gray-200 bg-[#1a1a1a]'}`}>
                    <div className="flex justify-between items-center">
                        <div className="font-black text-[9px] uppercase truncate pr-4">{item.title}</div>
                        <div className="shrink-0">{item.type === 'mission' ? <Zap size={10} className="text-[#834bf1]"/> : <Gift size={10} className="text-blue-500"/>}</div>
                    </div>
                    <div className="text-[7px] text-gray-400">{item.value} RC</div>
                  </div>
                ))}
              </div>
              <button onClick={handleExecuteDeploy} disabled={submitting || !selectedProtocol}
                className="w-full py-3 bg-[#834bf1] text-white border-2 border-black font-black uppercase text-[9px] shadow-[3px_3px_0px_0px_#000] active:scale-95 transition-all disabled:opacity-50">
                EXECUTE DEPLOYMENT
              </button>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-xl mx-auto py-4">
             <form onSubmit={handleMissionSubmit} className="space-y-4 bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
               <h3 className="font-black text-black text-sm uppercase mb-4 italic flex items-center gap-2 font-display"><Zap size={16}/> MISSION CREATOR</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2 border-[3px] border-black p-2 bg-white">
                  <label className="block font-black text-[9px] uppercase mb-1 text-black/40 italic">ALLIANCE NODE</label>
                  <select 
                    className="w-full bg-transparent outline-none font-black uppercase text-black text-xs" 
                    required 
                    value={missionForm.brand_id} 
                    onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}
                  >
                    <option value="">-- SELECT NODE --</option>
                    {brandOptions.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                 </div>
                 <input className="col-span-2 w-full p-3 border-2 border-black font-bold text-black text-xs" placeholder="MISSION TITLE" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
                 <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="number" placeholder="BOUNTY (RC)" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                 <input className="w-full p-3 border-2 border-black font-bold text-black text-xs" type="datetime-local" value={missionForm.expires_at} onChange={e => setMissionForm({...missionForm, expires_at: e.target.value})}/>
               </div>
               <textarea className="w-full p-3 border-2 border-black font-bold text-black text-xs h-32 resize-none" placeholder="FULL MISSION BRIEF..." required value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})}/>
               <div className="space-y-2">
                 <label className="text-[8px] font-black uppercase text-[#834bf1]">VERIFICATION CHECKPOINTS</label>
                 {['factor1', 'factor2', 'factor3'].map((f, i) => (
                   <input key={f} className="w-full p-2 border-2 border-black font-bold text-black text-[10px]" placeholder={`QC Factor ${i+1}`} value={(missionForm as any)[f]} onChange={e => setMissionForm({...missionForm, [f]: e.target.value})} />
                 ))}
               </div>
               <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase text-[10px] active:scale-95 shadow-[4px_4px_0px_0px_#834bf1]">SAVE AS DRAFT</button>
             </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-md mx-auto py-4">
            <form onSubmit={handleVoucherSubmit} className="space-y-4 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <h3 className="font-black text-black text-sm uppercase mb-4 italic flex items-center gap-2 font-display"><Gift size={16}/> VOUCHER GENERATOR</h3>
              
              {/* REWRITTEN DROPDOWN: DYNAMIC FETCHING FROM DATABASE */}
              <div className="border-4 border-black p-3 mb-4 bg-white">
                <label className="block font-black text-[10px] uppercase mb-1 text-black/40 italic">ALLIANCE NODE</label>
                <select
                  className="w-full bg-transparent outline-none font-black uppercase text-black text-xs"
                  required
                  value={voucherForm.brand_id} 
                  onChange={(e) => setVoucherForm({ ...voucherForm, brand_id: e.target.value })}
                >
                  <option value="">-- SELECT ALLIANCE NODE --</option>
                  {brandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 border-[3px] border-black font-black uppercase text-black text-xs" placeholder="VOUCHER NAME (e.g. 50% OFF)" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
                <input className="w-full p-4 border-[3px] border-black font-black uppercase text-black text-xs" type="number" placeholder="COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-black/40 italic ml-1">Transmission Expiry</label>
                  <input className="w-full p-4 border-[3px] border-black font-black text-black text-xs" type="datetime-local" value={voucherForm.expires_at} onChange={e => setVoucherForm({...voucherForm, expires_at: e.target.value})}/>
                </div>
                <textarea className="w-full p-4 border-[3px] border-black font-black uppercase text-black text-xs h-24 resize-none" placeholder="VOUCHER DESCRIPTION / TERMS..." required value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})}/>
              </div>

              <button disabled={submitting} className="w-full py-5 bg-black text-white font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#ffde59] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-3">
                {submitting ? <Loader2 className="animate-spin"/> : <Save size={16}/>}
                <span>AUTHORIZE DRAFT</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}
      </div>
    </div>
  );
};

const Save = ({ size }: { size: number }) => <FileText size={size} />;
