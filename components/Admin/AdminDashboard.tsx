import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Search, 
  Check, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Send, FileText, CheckCircle, AlertCircle, Filter, ShieldCheck, Ticket, Calendar
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

  const [missionForm, setMissionForm] = useState({ title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '', expires_at: '' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        onLogout();
        return;
    }
    fetchAllData();
    const pollId = window.setInterval(fetchAllData, 5000);
    return () => { if (pollId) clearInterval(pollId); };
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

  const createDraftMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
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
        assigned_to: ['DRAFT'],
        expires_at: missionForm.expires_at || null
      }]);
      showToast('success', "MISSION DRAFTED.");
      setMissionForm({ title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '', expires_at: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
  };

  const createDraftVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    try {
      const brand = brands.find(b => b.id === voucherForm.brand_id);
      await supabase.from('rewards').insert([{
        brand_id: voucherForm.brand_id,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        description: voucherForm.description || brand?.description || 'Exclusive partner voucher.',
        assigned_to: ['DRAFT'],
        expires_at: voucherForm.expires_at || null
      }]);
      showToast('success', "VOUCHER DRAFTED.");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleExecuteDeploy = async () => {
    if (!supabase || !selectedProtocol) return;
    let targetList: string[] | null = selectedCreatorIds.length > 0 ? selectedCreatorIds : null;
    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'rewards';
      await supabase.from(table).update({ assigned_to: targetList }).eq('id', selectedProtocol.id);
      showToast('success', `PROTOCOL DEPLOYED`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); } 
    finally { setSubmitting(false); }
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
        <div className="flex items-center gap-4"><Terminal size={24}/><h1 className="text-xl font-black italic">TERMINAL <span className="text-gray-500 text-sm not-italic ml-2">v master</span></h1></div>
        <div className="flex gap-4">
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'}`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-1 text-xs font-black uppercase border-2 border-black">Exit</button>
        </div>
      </header>

      <div className="px-6 py-4 flex gap-1 overflow-x-auto">
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
            <div className="lg:col-span-8 h-[700px] flex flex-col gap-4">
              <div className="flex justify-between items-center bg-gray-100 p-3 border-2 border-black">
                <h3 className="text-lg font-black text-black italic uppercase flex items-center gap-2"><Users size={18}/> CREATOR NODES</h3>
                <span className="text-xs font-bold bg-blue-500 text-white px-3 py-1 border border-black">SELECTED: {selectedCreatorIds.length}</span>
              </div>
              <div className="flex-1 overflow-auto border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
                <table className="w-full text-left text-black">
                  <thead className="bg-black text-white text-[9px] uppercase font-black sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-10 text-center"><CheckSquare size={14}/></th>
                      <th className="p-3">Identity</th>
                      <th className="p-3">Stats</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-bold">
                    {users.map(u => (
                        <tr key={u.id} onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
                            className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-100' : ''}`}>
                          <td className="p-3 text-center"><div className={`w-4 h-4 border-2 border-black mx-auto ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-600' : 'bg-white'}`}/></td>
                          <td className="p-3"><div className="font-black uppercase">{u.display_name}</div><div className="text-[9px] opacity-40">{u.email}</div></td>
                          <td className="p-3 uppercase text-gray-500">{u.niche || 'General'}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 border-l-4 border-black pl-8 border-dashed">
              <div className="bg-black text-white p-3 border-2 border-white shadow-[4px_4px_0px_0px_#000]"><h3 className="text-lg font-black italic uppercase flex items-center gap-2"><Send size={18}/> CONSOLE</h3></div>
              <div className="flex-1 overflow-auto space-y-3 pr-2">
                <p className="text-[10px] font-black uppercase bg-gray-800 text-white px-2 py-1 sticky top-0">MISSIONS</p>
                {missions.map(m => (
                    <div key={m.id} onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                        className={`border-2 p-3 cursor-pointer relative ${selectedProtocol?.id === m.id && selectedProtocol?.type === 'mission' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-[#1a1a1a]'}`}>
                      <div className="flex justify-between items-start"><span className="font-black text-xs uppercase truncate pr-6">{m.title}</span></div>
                    </div>
                ))}
                <p className="text-[10px] font-black uppercase bg-gray-800 text-white px-2 py-1 sticky top-0 mt-4">VOUCHERS</p>
                {vouchers.map(v => (
                    <div key={v.id} onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                        className={`border-2 p-3 cursor-pointer relative ${selectedProtocol?.id === v.id && selectedProtocol?.type === 'voucher' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-[#1a1a1a]'}`}>
                      <div className="flex justify-between items-start"><span className="font-black text-xs uppercase truncate pr-6">{v.title}</span></div>
                    </div>
                ))}
              </div>
              <button onClick={handleExecuteDeploy} disabled={submitting || !selectedProtocol}
                className="w-full py-4 bg-[#834bf1] text-white border-2 border-white font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#fff] disabled:opacity-50 mt-auto">
                {submitting ? <Loader2 className="animate-spin mx-auto"/> : "EXECUTE DEPLOYMENT"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Zap className="text-purple-500"/> NEW MISSION</h2>
            <form onSubmit={createDraftMission} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Brand</label>
                <select className="w-full p-4 border-4 border-black font-bold text-black" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                  <option value="">-- SELECT BRAND --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Title</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Reward (RC)</label>
                  <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1"><Calendar size={10}/> Expiration Date</label>
                  <input className="w-full p-4 border-4 border-black font-bold text-black" type="datetime-local" value={missionForm.expires_at} onChange={e => setMissionForm({...missionForm, expires_at: e.target.value})}/>
                </div>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase shadow-[4px_4px_0px_0px_#834bf1]">DRAFT MISSION</button>
            </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-black italic uppercase mb-8 flex items-center gap-3"><Gift className="text-blue-500"/> NEW VOUCHER</h2>
            <form onSubmit={createDraftVoucher} className="space-y-6 bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Brand</label>
                <select className="w-full p-4 border-4 border-black font-bold text-black" required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}>
                  <option value="">-- SELECT BRAND --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">Identity</label>
                <input className="w-full p-4 border-4 border-black font-bold text-black" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black uppercase text-gray-400">Cost (RC)</label>
                   <input className="w-full p-4 border-4 border-black font-bold text-black" type="number" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                 </div>
                 <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1"><Calendar size={10}/> Expiration Date</label>
                  <input className="w-full p-4 border-4 border-black font-bold text-black" type="datetime-local" value={voucherForm.expires_at} onChange={e => setVoucherForm({...voucherForm, expires_at: e.target.value})}/>
                </div>
              </div>
              <button disabled={submitting} className="w-full py-4 bg-black text-white font-black uppercase shadow-[4px_4px_0px_0px_#ffde59]">DRAFT VOUCHER</button>
            </form>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}
      </div>
    </div>
  );
};