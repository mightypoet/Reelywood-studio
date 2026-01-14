
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, Terminal, 
  Building2, ListChecks, Send, 
  CheckSquare, Loader2, Moon, 
  Sun, Trash2, CheckCircle, 
  AlertCircle, ChevronRight, RefreshCw,
  Search, Filter
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

// --- TYPES ---
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

  // --- DATA STATE ---
  const [brands, setBrands] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  
  // --- UI STATE ---
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- FORM STATES ---
  const [missionForm, setMissionForm] = useState({ title: '', reward: '', brand_id: '', description: '' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', brand_id: '', code: '', description: '' });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  // --- CENTRALIZED DATA FETCHING (Independent Fetches) ---
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setIsRefreshing(true);
    
    // Fetch brands independently
    const fetchBrands = async () => {
      const { data } = await supabase.from('partner_brands').select('*').order('name');
      if (data) setBrands(data);
    };

    // Fetch missions independently
    const fetchMissions = async () => {
      const { data } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
      if (data) setMissions(data);
    };

    // Fetch vouchers independently
    const fetchVouchers = async () => {
      const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
      if (data) setVouchers(data);
    };

    // Fetch users independently
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setUsers(data);
    };

    // Fetch queue independently with null-safe joins
    const fetchQueue = async () => {
      const { data } = await supabase.from('submissions')
        .select('*, missions(title), profiles(display_name, email)')
        .order('created_at', { ascending: false });
      if (data) setQueue(data);
    };

    // Execute all in parallel without crashing each other
    await Promise.allSettled([fetchBrands(), fetchMissions(), fetchVouchers(), fetchUsers(), fetchQueue()]);
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

  // --- ACTIONS ---
  const handleDeploy = async () => {
    if (!selectedProtocol || selectedUserIds.length === 0) {
      alert("SELECT USERS AND A PROTOCOL FIRST.");
      return;
    }
    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      const { error } = await supabase!
        .from(table)
        .update({ assigned_to: selectedUserIds })
        .eq('id', selectedProtocol.id);
      
      if (error) throw error;
      showToast('success', `DEPLOYED TO ${selectedUserIds.length} AGENTS`);
      setSelectedUserIds([]);
      setSelectedProtocol(null);
      fetchData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase!.from('missions').insert([{
        title: missionForm.title,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        description: missionForm.description,
        assigned_to: ['DRAFT']
      }]);
      if (error) throw error;
      showToast('success', "MISSION SYNCED");
      setMissionForm({ title: '', reward: '', brand_id: '', description: '' });
      fetchData();
      setActiveTab('deploy');
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase!.from('vouchers').insert([{
        title: voucherForm.title,
        name: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        brand_id: voucherForm.brand_id,
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        description: voucherForm.description,
        status: 'draft'
      }]);
      if (error) throw error;
      showToast('success', "VOUCHER DRAFTED");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '' });
      fetchData();
      setActiveTab('deploy');
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  // --- STYLES ---
  const theme = {
    bg: darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    card: darkMode ? 'bg-[#1a1a1a]' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-black',
    border: darkMode ? 'border-white' : 'border-black'
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-lexend`}>
      {/* Notifications */}
      {notify && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4">
          <div className={`px-6 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase text-xs ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            {notify.msg}
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchData} />
      )}

      {/* Header */}
      <header className={`border-b-4 ${theme.border} ${theme.card} p-4 flex justify-between items-center sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <Terminal size={20} className="text-[#834bf1]" />
          <h1 className="font-black italic font-display uppercase text-sm md:text-lg tracking-tighter">Command Centre Alpha</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className={`p-2 border-2 ${theme.border} hover:bg-[#834bf1] transition-all`}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${theme.border}`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-2 border-2 border-black font-black text-[10px] uppercase">Terminate</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b-2 border-black/10 px-4 bg-black/5 no-scrollbar">
        {[
          { id: 'deploy', label: 'Deploy', icon: Send },
          { id: 'missions', label: 'Mission Ctrl', icon: Zap },
          { id: 'vouchers', label: 'Vouchers', icon: Gift },
          { id: 'queue', label: 'Queue', icon: ListChecks },
          { id: 'brands', label: 'Brands', icon: Building2 },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-[#834bf1] text-white' : 'opacity-40 hover:opacity-100'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {activeTab === 'deploy' && (
          <div className="grid lg:grid-cols-12 gap-8 h-[700px]">
            {/* Left: User Select */}
            <div className={`lg:col-span-7 flex flex-col border-[4px] ${theme.border} ${theme.card} shadow-[8px_8px_0px_0px_#000]`}>
              <div className="bg-black text-white p-4 font-black text-xs uppercase flex justify-between items-center">
                <span className="flex items-center gap-2"><Users size={14}/> Agents List [{users.length}]</span>
                <span className="bg-[#834bf1] px-2 py-0.5 text-[8px]">{selectedUserIds.length} Selected</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <table className="w-full text-left text-[11px] font-bold">
                  <thead className="opacity-40 uppercase border-b-2 border-black/5">
                    <tr>
                      <th className="pb-3 w-10 text-center"><CheckSquare size={12}/></th>
                      <th className="pb-3">Agent</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} 
                        onClick={() => setSelectedUserIds(prev => prev.includes(u.firebase_uid) ? prev.filter(id => id !== u.firebase_uid) : [...prev, u.firebase_uid])}
                        className={`border-b border-black/5 cursor-pointer hover:bg-[#834bf1]/5 ${selectedUserIds.includes(u.firebase_uid) ? 'bg-[#834bf1]/10' : ''}`}>
                        <td className="py-4 text-center">
                          <div className={`w-4 h-4 border-2 ${theme.border} mx-auto ${selectedUserIds.includes(u.firebase_uid) ? 'bg-[#39ff14]' : 'bg-white'}`}/>
                        </td>
                        <td className="py-4 uppercase truncate max-w-[120px]">{u.display_name}</td>
                        <td className="py-4 font-mono text-[9px] opacity-60 lowercase">{u.email}</td>
                        <td className="py-4 font-display italic">{u.reelcoins} RC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Protocol Select */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className={`flex-1 flex flex-col border-[4px] ${theme.border} ${theme.card} shadow-[8px_8px_0px_0px_#000]`}>
                <div className="bg-black text-white p-4 font-black text-xs uppercase">Deployable Protocols</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {[...missions, ...vouchers].map(item => {
                    const type = 'reward_amount' in item ? 'mission' : 'voucher';
                    const isSelected = selectedProtocol?.id === item.id && selectedProtocol?.type === type;
                    return (
                      <div key={item.id} onClick={() => setSelectedProtocol({id: item.id, type: type as any})}
                        className={`p-4 border-[3px] cursor-pointer transition-all hover:-translate-y-1 ${isSelected ? 'bg-[#ffde59] border-black shadow-[4px_4px_0px_0px_#000] text-black' : `border-black/10 ${theme.card}`}`}>
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[8px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-widest">{type}</span>
                           <span className="font-display italic text-xs">{type === 'mission' ? item.reward_amount : item.cost} RC</span>
                        </div>
                        <h4 className="font-black uppercase text-xs truncate">{item.title || item.name || 'UNTITLED'}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleDeploy} disabled={submitting || !selectedProtocol || selectedUserIds.length === 0}
                className="w-full py-6 bg-[#39ff14] text-black border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black uppercase text-sm tracking-[0.4em] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-30">
                {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'Execute Deployment'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleCreateMission} className={`p-10 border-[6px] border-black shadow-[16px_16px_0px_0px_#834bf1] ${theme.card}`}>
              <h2 className="text-4xl font-black italic uppercase font-display mb-10 text-center">New Mission</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Alliance Node (Brand)</label>
                  <select required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}
                    className="w-full bg-white border-[3px] border-black p-4 font-black uppercase text-xs text-black">
                    <option value="">-- SELECT BRAND --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <input required placeholder="MISSION TITLE" className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black"
                  value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} />
                <input required type="number" placeholder="BOUNTY (RC)" className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black"
                  value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})} />
                <textarea required rows={5} placeholder="FULL MISSION BRIEF..." className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black resize-none"
                  value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})} />
                <button type="submit" disabled={submitting} className="w-full py-6 bg-black text-white border-[4px] border-black font-black uppercase text-xs tracking-[0.4em] shadow-[8px_8px_0px_0px_#ffde59]">
                   {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'Initialize Protocol'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleCreateVoucher} className={`p-10 border-[6px] border-black shadow-[16px_16px_0px_0px_#ffde59] ${theme.card}`}>
              <h2 className="text-4xl font-black italic uppercase font-display mb-10 text-center">Gift Generator</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Alliance Node (Brand)</label>
                  <select required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}
                    className="w-full bg-white border-[3px] border-black p-4 font-black uppercase text-xs text-black">
                    <option value="">-- SELECT BRAND --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <input required placeholder="VOUCHER NAME (E.G. 50% OFF)" className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black"
                  value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} />
                <input required type="number" placeholder="RC COST" className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black"
                  value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})} />
                <input placeholder="SECRET CODE (OPTIONAL)" className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black"
                  value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} />
                <textarea required rows={5} placeholder="VOUCHER TERMS..." className="w-full border-[3px] border-black p-4 font-black uppercase text-xs text-black resize-none"
                  value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})} />
                <button type="submit" disabled={submitting} className="w-full py-6 bg-black text-white border-[4px] border-black font-black uppercase text-xs tracking-[0.4em] shadow-[8px_8px_0px_0px_#834bf1]">
                   {submitting ? <Loader2 className="animate-spin mx-auto"/> : 'Authorize Assets'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-4 border-black pb-4">
               <h2 className="text-4xl font-black italic uppercase font-display">Approval Queue</h2>
               <div className="bg-black text-white px-4 py-2 font-black text-[10px] uppercase tracking-widest">{queue.length} Pending</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {queue.map(item => (
                <div key={item.id} className={`p-6 border-[4px] ${theme.border} ${theme.card} shadow-[8px_8px_0px_0px_#000] flex flex-col gap-4 group`}>
                   <div className="flex justify-between items-start">
                      <div className="bg-[#834bf1] text-white px-2 py-1 text-[8px] font-black uppercase">SIGNAL DETECTED</div>
                      <span className="font-black text-[10px] opacity-40">{new Date(item.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-black uppercase text-sm truncate">{item.missions?.title || 'UNKNOWN MISSION'}</h4>
                      <p className="text-[10px] font-black opacity-50 uppercase">{item.profiles?.display_name || 'ANON AGENT'}</p>
                   </div>
                   <div className="bg-black/5 p-3 border-2 border-black border-dashed flex items-center justify-between">
                      <span className="font-mono text-[9px] truncate mr-4">{item.link}</span>
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-[#834bf1]"><Send size={14}/></a>
                   </div>
                   <button onClick={() => setSelectedSubmission(item)}
                    className="w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-[4px_4px_0px_0px_#39ff14] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                      Validate & Pay
                   </button>
                </div>
              ))}
              {queue.length === 0 && (
                <div className="col-span-full py-40 text-center border-4 border-dashed border-black/10">
                   <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                   <p className="font-black uppercase text-xs opacity-20 tracking-widest">Queue Purified. All Signals Synchronized.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}
      </main>
    </div>
  );
};
