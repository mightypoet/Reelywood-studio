
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Terminal, 
  Building2, ListChecks, Send, 
  CheckSquare, Loader2, Moon, 
  Sun, Trash2, CheckCircle, 
  AlertCircle, RefreshCw,
  Search, ShieldCheck, Database,
  ArrowRight, ExternalLink
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

// --- INTERFACES ---
export interface Profile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string;
  reelcoins: number;
  card_status: string;
  created_at: string;
}

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'missions' | 'vouchers' | 'queue' | 'brands'>('deploy');
  const [darkMode, setDarkMode] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // --- DATA STATES ---
  const [brands, setBrands] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  
  // --- SELECTION STATES ---
  const [selectedUserUids, setSelectedUserUids] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- FORM STATES ---
  const [missionForm, setMissionForm] = useState({ title: '', reward: '', brand_id: '', description: '' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', brand_id: '', description: '' });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  // --- MODULAR DATA FETCHING (The Engine) ---
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    
    // Independent Fetch Logic: One node failing doesn't kill the grid
    const results = await Promise.allSettled([
      supabase.from('partner_brands').select('*').order('name'),
      supabase.from('missions').select('*').order('created_at', { ascending: false }),
      supabase.from('vouchers').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('submissions').select('*, missions(title), profiles(display_name, email)').eq('status', 'pending').order('created_at', { ascending: false })
    ]);

    if (results[0].status === 'fulfilled' && results[0].value.data) setBrands(results[0].value.data);
    if (results[1].status === 'fulfilled' && results[1].value.data) setMissions(results[1].value.data);
    if (results[2].status === 'fulfilled' && results[2].value.data) setVouchers(results[2].value.data);
    if (results[3].status === 'fulfilled' && results[3].value.data) setUsers(results[3].value.data);
    if (results[4].status === 'fulfilled' && results[4].value.data) setQueue(results[4].value.data);

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      onLogout();
      return;
    }
    fetchData();
  }, [fetchData, onLogout]);

  // --- CORE ACTIONS ---
  const handleDeployment = async () => {
    if (!supabase) return;
    if (!selectedProtocol || selectedUserUids.length === 0) {
      alert("⚠️ SYSTEM ERROR: Select Agents AND a Protocol to deploy.");
      return;
    }

    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      const { error } = await supabase
        .from(table)
        .update({ assigned_to: selectedUserUids })
        .eq('id', selectedProtocol.id);
      
      if (error) throw error;
      showToast('success', `DEPLOYED: ${selectedUserUids.length} AGENTS LINKED`);
      setSelectedUserUids([]);
      setSelectedProtocol(null);
      fetchData();
    } catch (e: any) { 
      showToast('error', e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const submitMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('missions').insert([{
        title: missionForm.title,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        description: missionForm.description,
        assigned_to: []
      }]);
      if (error) throw error;
      showToast('success', "MISSION ARCHIVED");
      setMissionForm({ title: '', reward: '', brand_id: '', description: '' });
      fetchData();
      setActiveTab('deploy');
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const submitVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('vouchers').insert([{
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        brand_id: voucherForm.brand_id,
        description: voucherForm.description,
        status: 'draft',
        assigned_to: []
      }]);
      if (error) throw error;
      showToast('success', "VOUCHER ARCHIVED");
      setVoucherForm({ title: '', cost: '', brand_id: '', description: '' });
      fetchData();
      setActiveTab('deploy');
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  // --- STYLES ---
  const theme = {
    bg: darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-100',
    card: darkMode ? 'bg-[#121212]' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-black',
    border: darkMode ? 'border-white' : 'border-black'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-lexend`}>
      {/* Neo-Brutalist Toast */}
      {notify && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-top-4">
          <div className={`px-10 py-5 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xs tracking-widest ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-600 text-white'}`}>
            {notify.msg}
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchData} />
      )}

      {/* Header Module */}
      <header className={`border-b-4 ${theme.border} ${theme.card} p-6 flex justify-between items-center sticky top-0 z-[100]`}>
        <div className="flex items-center gap-5">
          <div className="p-3 bg-black border-2 border-white shadow-[4px_4px_0px_0px_#834bf1]">
            <Terminal size={24} className="text-[#834bf1]" />
          </div>
          <h1 className="font-black italic font-display uppercase text-xl md:text-3xl tracking-tighter">Command <span className="text-[#834bf1]">Centre</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className={`p-3 border-[3px] ${theme.border} hover:bg-[#834bf1] transition-all shadow-[4px_4px_0px_0px_#000]`}>
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 border-[3px] ${theme.border} shadow-[4px_4px_0px_0px_#000]`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-6 py-2 border-[3px] border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none">Terminate</button>
        </div>
      </header>

      {/* Navigation Module */}
      <div className="flex overflow-x-auto border-b-4 border-black px-4 bg-black/40 no-scrollbar sticky top-[92px] z-[90]">
        {[
          { id: 'deploy', label: 'Deployment Hub', icon: Send, color: '#39ff14' },
          { id: 'missions', label: 'Mission Control', icon: Zap, color: '#834bf1' },
          { id: 'vouchers', label: 'Voucher Lab', icon: Gift, color: '#ffde59' },
          { id: 'queue', label: 'Verification Queue', icon: ListChecks, color: '#00e5ff' },
          { id: 'brands', label: 'Brand Alliance', icon: Building2, color: '#ffffff' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-4 px-10 py-6 font-black text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap border-r-2 border-black/10 ${activeTab === t.id ? 'bg-[#1a1a1a] text-white border-b-4 border-b-[#834bf1]' : 'opacity-40 hover:opacity-100'}`}>
            <t.icon size={18} style={{ color: t.color }} /> {t.label}
          </button>
        ))}
      </div>

      <main className="p-8 md:p-16 max-w-[1600px] mx-auto">
        {/* --- TAB 1: DEPLOYMENT HUB --- */}
        {activeTab === 'deploy' && (
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Agent Selector */}
            <div className={`lg:col-span-7 flex flex-col border-[6px] ${theme.border} ${theme.card} shadow-[16px_16px_0px_0px_#000]`}>
              <div className="bg-black text-white p-6 font-black text-sm uppercase flex justify-between items-center border-b-4 border-black">
                <span className="flex items-center gap-4"><Users size={20} className="text-[#39ff14]"/> Global Creator Network</span>
                <span className="bg-[#834bf1] px-4 py-1 text-xs border-2 border-white">{selectedUserUids.length} Selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar h-[600px]">
                <table className="w-full text-left text-xs font-bold">
                  <thead className="opacity-40 uppercase border-b-4 border-black/20">
                    <tr>
                      <th className="pb-5 w-16 text-center"><CheckSquare size={16}/></th>
                      <th className="pb-5">Identity</th>
                      <th className="pb-5">Transmissions</th>
                      <th className="pb-5 text-right">RC Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} 
                        onClick={() => setSelectedUserUids(prev => prev.includes(u.firebase_uid) ? prev.filter(id => id !== u.firebase_uid) : [...prev, u.firebase_uid])}
                        className={`border-b-2 border-black/10 cursor-pointer transition-colors ${selectedUserUids.includes(u.firebase_uid) ? 'bg-[#39ff14]/10' : 'hover:bg-white/5'}`}>
                        <td className="py-6 text-center">
                          <div className={`w-6 h-6 border-[3px] ${theme.border} mx-auto transition-all ${selectedUserUids.includes(u.firebase_uid) ? 'bg-[#39ff14] scale-110' : 'bg-transparent'}`}/>
                        </td>
                        <td className="py-6 uppercase font-black tracking-tight text-sm">{u.display_name}</td>
                        <td className="py-6 font-mono text-[10px] opacity-60 lowercase">{u.email}</td>
                        <td className="py-6 text-right font-display italic text-[#834bf1] text-lg">{u.reelcoins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Protocol Selector */}
            <div className="lg:col-span-5 flex flex-col gap-10">
              <div className={`flex-1 flex flex-col border-[6px] ${theme.border} ${theme.card} shadow-[16px_16px_0px_0px_#000]`}>
                <div className="bg-black text-white p-6 font-black text-sm uppercase border-b-4 border-black flex items-center gap-4">
                  <Database size={20} className="text-[#ffde59]"/> Target Protocols
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar h-[450px]">
                  {[...missions, ...vouchers].map(item => {
                    const type = 'reward_amount' in item ? 'mission' : 'voucher';
                    const isSelected = selectedProtocol?.id === item.id && selectedProtocol?.type === type;
                    return (
                      <div key={`${type}-${item.id}`} onClick={() => setSelectedProtocol({id: item.id, type: type as any})}
                        className={`p-6 border-[4px] cursor-pointer transition-all hover:-translate-y-2 ${isSelected ? 'bg-[#ffde59] border-black shadow-[6px_6px_0px_0px_#000] text-black' : `border-black/20 ${theme.card}`}`}>
                        <div className="flex justify-between items-start mb-4">
                           <span className={`text-[10px] font-black px-4 py-1 border-2 border-current uppercase tracking-widest ${isSelected ? 'border-black' : 'text-[#834bf1] border-[#834bf1]'}`}>{type}</span>
                           <span className="font-display italic text-base">{type === 'mission' ? item.reward_amount : item.cost} RC</span>
                        </div>
                        <h4 className="font-black uppercase text-sm leading-tight tracking-tight">{item.title || item.name || 'UNLABELED NODE'}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleDeployment} disabled={submitting || !selectedProtocol || selectedUserUids.length === 0}
                className="w-full py-10 bg-[#39ff14] text-black border-[6px] border-black shadow-[16px_16px_0px_0px_#000] font-black uppercase text-lg tracking-[0.4em] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all disabled:opacity-30 disabled:grayscale">
                {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'EXECUTE GLOBAL DEPLOYMENT'}
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: MISSION CONTROL --- */}
        {activeTab === 'missions' && (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={submitMission} className={`p-16 border-[8px] border-black shadow-[24px_24px_0px_0px_#834bf1] ${theme.card}`}>
              <h2 className="text-6xl font-black italic uppercase font-display mb-16 text-center tracking-tighter">Initialize Mission</h2>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Alliance Node (Select Brand Source)</label>
                  <select required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}
                    className="w-full bg-white border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]">
                    <option value="">-- SELECT BRAND NODE --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Mission Title</label>
                    <input required placeholder="E.G. BRAND_FILM_01" className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]"
                      value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">RC Reward Bounty</label>
                    <input required type="number" placeholder="BOUNTY AMOUNT" className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]"
                      value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Deployment Brief</label>
                  <textarea required rows={8} placeholder="FULL MISSION PARAMETERS..." className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000] resize-none"
                    value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})} />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-8 bg-black text-white border-[4px] border-white font-black uppercase text-md tracking-[0.5em] shadow-[16px_16px_0px_0px_#ffde59] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all">
                   {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'AUTHORIZE PROTOCOL'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB 3: VOUCHER LAB --- */}
        {activeTab === 'vouchers' && (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={submitVoucher} className={`p-16 border-[8px] border-black shadow-[24px_24px_0px_0px_#ffde59] ${theme.card}`}>
              <h2 className="text-6xl font-black italic uppercase font-display mb-16 text-center tracking-tighter text-[#834bf1]">Voucher Gen</h2>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Alliance Node</label>
                  <select required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}
                    className="w-full bg-white border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]">
                    <option value="">-- SELECT BRAND SOURCE --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Asset Label</label>
                    <input required placeholder="E.G. 50%_OFF_PASS" className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]"
                      value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} />
                   </div>
                   <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">RC Cost</label>
                    <input required type="number" placeholder="RC_COST" className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000]"
                      value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest opacity-60 italic">Asset Terms</label>
                  <textarea required rows={6} placeholder="VOUCHER USAGE RULES..." className="w-full border-[4px] border-black p-6 font-black uppercase text-sm text-black shadow-[8px_8px_0px_0px_#000] resize-none"
                    value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})} />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-8 bg-black text-white border-[4px] border-white font-black uppercase text-md tracking-[0.5em] shadow-[16px_16px_0px_0px_#834bf1] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all">
                   {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'INITIALIZE ASSET'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB 4: VERIFICATION QUEUE --- */}
        {activeTab === 'queue' && (
          <div className="space-y-12">
            <div className="flex justify-between items-end border-b-[8px] border-black pb-8">
               <h2 className="text-6xl font-black italic uppercase font-display tracking-tighter">Signal Queue</h2>
               <div className="bg-black text-[#39ff14] px-8 py-3 font-black text-sm border-2 border-white shadow-[8px_8px_0px_0px_#000] uppercase tracking-widest leading-none">
                {queue.length} Signals Pending
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {queue.map(item => (
                <div key={item.id} className={`p-10 border-[6px] ${theme.border} ${theme.card} shadow-[16px_16px_0px_0px_#000] flex flex-col gap-8 group hover:-translate-y-3 transition-all`}>
                   <div className="flex justify-between items-start">
                      <div className="bg-[#834bf1] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black">SYNC_SIGNAL</div>
                      <span className="font-black text-[10px] opacity-40 italic">{new Date(item.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="space-y-3">
                      <h4 className="font-black uppercase text-xl leading-tight tracking-tighter">{item.missions?.title || 'CORRUPT_MISSION_DATA'}</h4>
                      <p className="text-xs font-black opacity-60 uppercase tracking-widest flex items-center gap-3">
                        <Users size={14}/> {item.profiles?.display_name || 'ANON_AGENT'}
                      </p>
                   </div>
                   <div className="bg-black/5 p-5 border-[4px] border-black border-dashed flex items-center justify-between">
                      <span className="font-mono text-xs truncate mr-4 text-[#834bf1] font-bold">{item.link}</span>
                      <a href={item.link} target="_blank" rel="noreferrer" className="bg-[#ffde59] p-3 border-2 border-black hover:scale-110 transition-transform"><Send size={18}/></a>
                   </div>
                   <button onClick={() => setSelectedSubmission(item)}
                    className="w-full py-6 bg-black text-white font-black uppercase text-xs tracking-[0.4em] shadow-[10px_10px_0px_0px_#39ff14] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all border-[3px] border-white">
                      VALIDATE & CREDIT
                   </button>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="col-span-full py-48 text-center border-[8px] border-dashed border-black/10 rounded-[4rem]">
                   <CheckCircle size={100} className="mx-auto mb-10 text-[#39ff14] opacity-20" />
                   <p className="font-black uppercase text-2xl opacity-20 tracking-[0.5em] italic">Grid Purified. Zero Pending Signals.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brand Manager Bridge */}
        {activeTab === 'brands' && <BrandManager />}
      </main>
    </div>
  );
};
