import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, LogOut, Search, 
  Check, Plus, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Building2, ListChecks, Clock, X,
  Crosshair, CheckSquare, Box,
  Instagram, Youtube, Twitter, MapPin,
  FileText, ShieldCheck, CheckCircle, AlertCircle
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

export type Agent = Profile;

interface AdminDashboardProps {
  onLogout: () => void;
}

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com', 'adityad102000@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'vouchers' | 'ledger' | 'brands' | 'submissions'>('missions');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved ? saved === 'dark' : true;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Notification State (Replaces Alerts)
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Data Stores
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Forms
  const [missionForm, setMissionForm] = useState({ 
    title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' 
  });
  const [voucherForm, setVoucherForm] = useState({ brandId: '', title: '', cost: '', code: '' });

  // Targeting
  const [targetMode, setTargetMode] = useState<'ALL' | 'SELECT'>('ALL');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      onLogout();
    }
    fetchAllData();

    // --- INTELLIGENT AUTO-REFRESH (Realtime) ---
    if (!supabase) return;

    const channel = supabase
      .channel('admin-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => triggerRefresh('Missions Updated'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => triggerRefresh('New Submission'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => triggerRefresh('Ledger Activity'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, () => triggerRefresh('Voucher Updated'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => triggerRefresh('User Status Change'))
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, []);

  const triggerRefresh = (reason: string) => {
    console.log(`⚡ Live Update: ${reason}`);
    fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      if (!supabase) return;
      const [profilesRes, missionsRes, rewardsRes, transRes, brandsRes, submissionsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name, email), missions(title, reward_amount, checkpoints)').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      if (profilesRes.data) setUsers(profilesRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setVouchers(rewardsRes.data);
      if (transRes.data) setTransactions(transRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
      if (submissionsRes.data) setSubmissions(submissionsRes.data);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
    }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  // --- ACTIONS ---

  const handleDeployMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionForm.title || !missionForm.reward || !missionForm.brand_id) {
      showToast('error', "MISSING DATA: Please fill all mission fields.");
      return;
    }
    if (targetMode === 'SELECT' && selectedAgentIds.length === 0) {
      showToast('error', "TARGET ERROR: Select agents or switch to Global Broadcast.");
      return;
    }

    setSubmitting(true);
    try {
      const brand = brands.find(b => b.id === missionForm.brand_id);
      
      const missionPayload = {
        title: missionForm.title,
        description: brand?.description || "Mission Brief Loading...",
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        location: brand?.location_text || 'Global',
        image_url: brand?.cover_image_url || '',
        checkpoints: [missionForm.checkpoint1, missionForm.checkpoint2, missionForm.checkpoint3].filter(c => c && c.trim() !== ''),
        assigned_to: targetMode === 'ALL' ? null : selectedAgentIds
      };

      const { error } = await supabase!.from('missions').insert([missionPayload]);
      if (error) throw error;

      setMissionForm({ title: '', reward: '', brand_id: '', checkpoint1: '', checkpoint2: '', checkpoint3: '' });
      setSelectedAgentIds([]);
      showToast('success', "🚀 MISSION PROTOCOL DEPLOYED SUCCESSFULLY");
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeployVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.brandId || !voucherForm.title || !voucherForm.cost || !voucherForm.code) {
      showToast('error', "DATA MISSING: Please fill all voucher fields.");
      return;
    }
    if (targetMode === 'SELECT' && selectedAgentIds.length === 0) {
      showToast('error', "TARGET ERROR: Select agents or switch to Global.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        brand_id: voucherForm.brandId,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        code: voucherForm.code,
        assigned_to: targetMode === 'ALL' ? null : selectedAgentIds
      };

      const { error } = await supabase!.from('rewards').insert([payload]);
      if (error) throw error;
      
      showToast('success', "🎟️ VOUCHER MINTED & DEPLOYED");
      setVoucherForm({ brandId: '', title: '', cost: '', code: '' });
      setSelectedAgentIds([]);
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mission?")) return;
    try {
      const { error } = await supabase!.from('missions').delete().eq('id', id);
      if (error) throw error;
      showToast('success', "MISSION DELETED FROM NETWORK");
    } catch (error: any) {
      showToast('error', error.message);
    }
  };

  const handleUpdateStatus = async (uid: string, status: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase!.from('profiles').update({ card_status: status }).eq('firebase_uid', uid);
      if (error) throw error;
      showToast('success', `AGENT STATUS UPDATED: ${status.toUpperCase()}`);
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAgentSelection = (id: string) => {
    setSelectedAgentIds(prev => prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]);
  };

  // --- UI CONSTANTS ---
  const isDark = darkMode;
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white' : 'border-black';
  const cardColor = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const accent = isDark ? 'bg-[#39ff14] text-black' : 'bg-[#834bf1] text-white';
  const filteredUsers = users.filter(u => filter === 'all' ? true : u.card_status === filter);

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} font-mono transition-colors duration-500 pb-20`}>
      
      {/* --- STATUS TOAST NOTIFICATION --- */}
      {notify && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-300 w-full max-w-md px-4">
          <div className={`flex items-center gap-4 px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            {notify.type === 'success' ? <CheckCircle size={24} strokeWidth={3}/> : <AlertCircle size={24} strokeWidth={3}/>}
            <div className="flex-1">
              <h4 className="font-black uppercase text-xs tracking-[0.2em] mb-1">{notify.type === 'success' ? 'SYSTEM SUCCESS' : 'SYSTEM ERROR'}</h4>
              <p className="font-bold text-xs uppercase leading-tight">{notify.msg}</p>
            </div>
            <button onClick={() => setNotify(null)}><X size={18}/></button>
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
      
      <header className={`border-b-4 ${borderColor} ${cardColor} px-6 py-4 flex items-center justify-between sticky top-0 z-[100] bg-opacity-90 backdrop-blur-md`}>
        <div className="flex items-center space-x-4">
          <div className={`${accent} w-10 h-10 flex items-center justify-center border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
            <Terminal size={20} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${borderColor} ${isDark ? 'bg-yellow-400 text-black' : 'bg-black text-white'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => { auth.signOut(); onLogout(); }} className="bg-black text-white px-4 py-2 border-2 border-white font-black uppercase text-[10px] hover:bg-red-600 transition-colors">
            Exit
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'AGENTS', val: users.length, icon: Users },
            { label: 'PENDING', val: users.filter(u => u.card_status === 'pending').length, icon: Search },
            { label: 'ALLIANCE', val: brands.length, icon: Building2 },
            { label: 'MISSIONS', val: missions.length, icon: Zap },
            { label: 'QUEUED', val: submissions.length, icon: ListChecks },
            { label: 'TX VOL', val: transactions.length, icon: Activity }
          ].map((stat, i) => (
            <div key={i} className={`${cardColor} border-2 ${borderColor} p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
              <p className="text-[9px] font-black uppercase opacity-40 mb-1">{stat.label}</p>
              <div className="flex justify-between items-end">
                <h3 className="text-3xl font-black italic">{stat.val.toString().padStart(2, '0')}</h3>
                <stat.icon size={20} className="opacity-20" />
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION TABS */}
        <div className={`flex border-4 ${borderColor} p-1 ${cardColor} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-x-auto`}>
          {[
            { id: 'users', label: 'COMMAND', icon: <Users size={16}/> },
            { id: 'submissions', label: 'QUEUED', icon: <ListChecks size={16}/> },
            { id: 'brands', label: 'ALLIANCE', icon: <Building2 size={16}/> },
            { id: 'missions', label: 'CONSOLE', icon: <Zap size={16}/> },
            { id: 'vouchers', label: 'VAULT', icon: <Gift size={16}/> },
            { id: 'ledger', label: 'LEDGER', icon: <FileText size={16}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-3 font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? `${accent} border-2 ${borderColor} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]` : 'opacity-40 hover:opacity-100'}`}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
          
          {/* TAB: MISSIONS */}
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creator Form */}
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
                  <span className="text-purple-600">+</span> MISSION CONSOLE
                </h2>
                <form onSubmit={handleDeployMission} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  
                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-400 mb-2">LINK ECOSYSTEM PARTNER</label>
                    <select 
                      required
                      className="w-full border-4 border-black p-4 font-bold text-sm uppercase outline-none focus:bg-yellow-50 transition-colors text-black"
                      value={missionForm.brand_id}
                      onChange={(e) => setMissionForm({...missionForm, brand_id: e.target.value})}
                    >
                      <option value="">-- SELECT ACTIVE NODE --</option>
                      {brands.map(b => <option key={b.id} value={b.id} className="text-black">{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-gray-400 mb-2">OBJECTIVE HEADER</label>
                    <input 
                      required
                      className="w-full border-4 border-black p-4 font-bold text-sm outline-none focus:bg-yellow-50 transition-colors text-black"
                      placeholder="e.g. POST A REEL"
                      value={missionForm.title}
                      onChange={(e) => setMissionForm({...missionForm, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-gray-400 mb-2">REWARD (RC)</label>
                      <input 
                        required
                        type="number"
                        className="w-full border-4 border-black p-4 font-bold text-sm outline-none text-black"
                        placeholder="000"
                        value={missionForm.reward}
                        onChange={(e) => setMissionForm({...missionForm, reward: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Checkpoints */}
                  <div className="bg-slate-50 border-2 border-black p-4 space-y-3">
                     <label className="block text-[9px] font-black uppercase text-gray-400 flex items-center gap-2">
                       <ShieldCheck size={14} className="text-purple-600" /> 3 KEY VERIFICATION FACTORS
                     </label>
                     <input className="w-full p-2 border-2 border-black font-bold text-xs text-black" placeholder="Factor 1 (e.g. Follow Account)" 
                        value={missionForm.checkpoint1} onChange={e => setMissionForm({...missionForm, checkpoint1: e.target.value})} />
                     <input className="w-full p-2 border-2 border-black font-bold text-xs text-black" placeholder="Factor 2 (e.g. Like Post)" 
                        value={missionForm.checkpoint2} onChange={e => setMissionForm({...missionForm, checkpoint2: e.target.value})} />
                     <input className="w-full p-2 border-2 border-black font-bold text-xs text-black" placeholder="Factor 3 (e.g. Tag 2 Friends)" 
                        value={missionForm.checkpoint3} onChange={e => setMissionForm({...missionForm, checkpoint3: e.target.value})} />
                  </div>

                  {/* Targeting */}
                  <div className="bg-gray-100 dark:bg-black/20 border-2 border-dashed border-black dark:border-white/20 p-4">
                    <label className="block text-[9px] font-black uppercase text-black dark:text-white mb-3 flex items-center gap-2">
                      <Crosshair size={14} className="text-purple-500" /> DEPLOYMENT TARGET
                    </label>
                    <div className="flex gap-2 mb-4">
                       <button type="button" onClick={() => setTargetMode('ALL')} className={`flex-1 py-3 font-black text-[9px] uppercase border-2 border-black ${targetMode === 'ALL' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>GLOBAL BROADCAST</button>
                       <button type="button" onClick={() => setTargetMode('SELECT')} className={`flex-1 py-3 font-black text-[9px] uppercase border-2 border-black ${targetMode === 'SELECT' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>SELECTIVE UPLINK</button>
                    </div>
                    {targetMode === 'SELECT' && (
                      <div className="bg-white border-2 border-black max-h-[200px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <tbody className="text-[10px] font-bold text-black">
                            {users.map(agent => (
                              <tr key={agent.firebase_uid} onClick={() => toggleAgentSelection(agent.firebase_uid)} className={`cursor-pointer border-b border-gray-100 hover:bg-purple-50 ${selectedAgentIds.includes(agent.firebase_uid) ? 'bg-yellow-50' : ''}`}>
                                <td className="p-2 text-center">
                                  <div className={`w-4 h-4 border-2 border-black flex items-center justify-center ${selectedAgentIds.includes(agent.firebase_uid) ? 'bg-black' : 'bg-white'}`}>
                                    {selectedAgentIds.includes(agent.firebase_uid) && <CheckSquare className="w-3 h-3 text-white" />}
                                  </div>
                                </td>
                                <td className="p-2 uppercase truncate max-w-[100px]">{agent.display_name}</td>
                                <td className="p-2">{agent.followers?.toLocaleString() || '0'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={submitting} className={`w-full py-5 font-black text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase transition-all ${submitting ? 'opacity-50 bg-gray-400' : `${accent} hover:translate-y-1 hover:shadow-none`}`}>
                    {submitting ? <Loader2 className="animate-spin" /> : 'DEPLOY MISSION PROTOCOL'}
                  </button>
                </form>
              </div>
              
              {/* Active Sync Grid */}
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
                  <Activity className="text-emerald-500" /> ACTIVE SYNC GRID
                </h2>
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[800px]">
                  {missions.map((m) => (
                    <div key={m.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative group`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-emerald-400 text-black border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">
                          {m.assigned_to ? `TARGETED [${m.assigned_to.length}]` : 'GLOBAL NODE'}
                        </span>
                        <div className="flex gap-2">
                           <span className="bg-[#834bf1] text-white border-2 border-black px-2 py-0.5 text-[10px] font-black">+{m.reward_amount} RC</span>
                           <button onClick={() => handleDeleteMission(m.id)} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center mb-4">
                         <img src={m.partner_brands?.logo_url} alt="Brand" className="w-12 h-12 border-2 border-black object-cover bg-gray-200" onError={(e) => {e.currentTarget.src = 'https://via.placeholder.com/48'}}/>
                         <div>
                            <h4 className="font-black italic text-xl uppercase mb-0 leading-none">{m.title}</h4>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {m.location}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VOUCHERS */}
          {activeTab === 'vouchers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <div className={`${cardColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <h3 className="text-xl font-black uppercase italic flex items-center space-x-2"><Gift className="text-blue-500" /><span>Mint Voucher</span></h3>
                  <form onSubmit={handleDeployVoucher} className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase opacity-40 mb-1 block">Link Partner Node</label>
                      <select required className="w-full bg-white border-2 border-black p-3 font-black text-xs text-black" value={voucherForm.brandId} onChange={e => setVoucherForm({...voucherForm, brandId: e.target.value})}>
                        <option value="">-- SELECT BRAND --</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase opacity-40 mb-1 block">Voucher Label</label>
                      <input required type="text" value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} className="w-full bg-white border-2 border-black p-3 font-black text-xs text-black" placeholder="e.g. Free Coffee"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[9px] font-black uppercase opacity-40 mb-1 block">Cost (RC)</label><input required type="number" value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})} className="w-full bg-white border-2 border-black p-3 font-black text-xs text-black"/></div>
                      <div><label className="text-[9px] font-black uppercase opacity-40 mb-1 block">Hash Code</label><input required type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} className="w-full bg-white border-2 border-black p-3 font-black text-xs text-black uppercase" placeholder="RW-XXX"/></div>
                    </div>
                    
                    {/* Voucher Targeting */}
                    <div className="bg-gray-100 dark:bg-black/20 border-2 border-dashed border-black dark:border-white/20 p-4">
                      <label className="block text-[9px] font-black uppercase text-black dark:text-white mb-3 flex items-center gap-2">
                        <Crosshair size={14} className="text-purple-500" /> DEPLOYMENT TARGET
                      </label>
                      <div className="flex gap-2 mb-4">
                         <button type="button" onClick={() => setTargetMode('ALL')} className={`flex-1 py-3 font-black text-[9px] uppercase border-2 border-black ${targetMode === 'ALL' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>GLOBAL</button>
                         <button type="button" onClick={() => setTargetMode('SELECT')} className={`flex-1 py-3 font-black text-[9px] uppercase border-2 border-black ${targetMode === 'SELECT' ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>SELECTIVE</button>
                      </div>
                      {targetMode === 'SELECT' && (
                        <div className="bg-white border-2 border-black max-h-[150px] overflow-y-auto p-1">
                           {users.map(u => (
                             <div key={u.firebase_uid} onClick={() => toggleAgentSelection(u.firebase_uid)} className={`flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-50 ${selectedAgentIds.includes(u.firebase_uid) ? 'bg-blue-50' : ''}`}>
                                <div className={`w-3 h-3 border border-black ${selectedAgentIds.includes(u.firebase_uid) ? 'bg-black' : 'bg-white'}`}></div>
                                <span className="text-[9px] font-bold text-black truncate">{u.display_name}</span>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full ${accent} py-4 border-2 border-black font-black uppercase text-[10px] tracking-widest hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all`}>
                      {submitting ? 'PROCESSING...' : 'AUTHORIZE INVENTORY'}
                    </button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-7 grid md:grid-cols-2 gap-4">
                {vouchers.map(v => (
                  <div key={v.id} className={`${cardColor} border-2 ${borderColor} p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="bg-black text-white p-2 border border-white">
                        {v.partner_brands?.logo_url ? <img src={v.partner_brands.logo_url} className="w-4 h-4 object-cover" /> : <Box size={16}/>}
                      </div>
                      <span className={`text-[8px] font-black uppercase px-1 border border-black ${v.assigned_to ? 'bg-blue-300 text-black' : 'bg-yellow-400 text-black'}`}>
                        {v.assigned_to ? 'RESTRICTED' : 'PUBLIC'}
                      </span>
                    </div>
                    <h4 className="font-black uppercase text-sm">{v.title}</h4>
                    <p className="text-lg font-black text-purple-600">{v.cost} RC</p>
                    <code className="text-[8px] opacity-30 mt-2 block">HASH: {v.code}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LEDGER */}
          {activeTab === 'ledger' && (
            <div className={`${cardColor} border-4 ${borderColor} shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
              <table className="w-full text-left">
                <thead className="bg-black text-white text-[9px] uppercase font-black">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Identity</th>
                    <th className="p-4">Activity Detail</th>
                    <th className="p-4 text-right">Delta</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold">
                  {transactions.map((tx, i) => {
                    const agent = users.find(u => u.firebase_uid === tx.user_uid);
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={i} className={`border-b border-black/10 hover:bg-black/5`}>
                        <td className="p-4 font-mono opacity-40">{new Date(tx.created_at).toLocaleString()}</td>
                        <td className="p-4 uppercase italic">
                           <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 border border-black flex items-center justify-center text-[10px] ${isCredit ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                                 {agent?.display_name?.charAt(0) || '?'}
                              </div>
                              {agent?.display_name || 'Unknown Agent'}
                           </div>
                        </td>
                        <td className="p-4 uppercase text-xs tracking-wide">
                           {tx.description || (isCredit ? "Mission Reward Granted" : "Voucher Redeemed")}
                        </td>
                        <td className={`p-4 text-right italic font-black text-sm ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {isCredit ? '+' : ''}{tx.amount} RC
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                {['all', 'pending', 'approved'].map(f => (
                  <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1 border-2 ${borderColor} font-black uppercase text-[9px] ${filter === f ? 'bg-yellow-400 text-black shadow-[2px_2px_0px_0px_#000]' : 'opacity-40'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className={`${cardColor} border-4 ${borderColor} shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
                <table className="w-full text-left border-collapse">
                  <thead className={`bg-black text-white text-[10px] font-black uppercase tracking-widest`}>
                    <tr>
                      <th className="p-4 border-r border-white/20">Agent Identity</th>
                      <th className="p-4 border-r border-white/20 text-right">Balance</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`border-b-2 ${borderColor} hover:bg-black/5`}>
                        <td className="p-4 border-r-2 ${borderColor}">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 border-2 ${borderColor} ${accent} flex items-center justify-center font-black`}>{user.display_name?.charAt(0)}</div>
                            <div>
                              <p className="font-black uppercase truncate max-w-[150px]">{user.display_name}</p>
                              <p className="text-[9px] opacity-40 font-mono">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-r-2 ${borderColor} text-right font-black font-mono text-emerald-600">
                          {user.reelcoins?.toLocaleString()} RC
                        </td>
                        <td className="p-4 text-center">
                           <div className="flex items-center justify-center gap-2">
                             {user.card_status === 'pending' ? (
                               <>
                                 <button onClick={() => handleUpdateStatus(user.firebase_uid, 'rejected')} className="p-2 border-2 border-black bg-rose-500 text-white"><X size={14}/></button>
                                 <button onClick={() => handleUpdateStatus(user.firebase_uid, 'approved')} className="p-2 border-2 border-black bg-emerald-500 text-white"><Check size={14}/></button>
                               </>
                             ) : (
                               <span className={`px-2 py-1 border-2 border-black text-[9px] uppercase ${user.card_status === 'approved' ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                                 {user.card_status}
                               </span>
                             )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map(sub => (
                <div key={sub.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
                  <div className="flex justify-between mb-4">
                    <div className="w-10 h-10 bg-purple-600 border-2 border-black flex items-center justify-center text-white"><Clock size={20}/></div>
                    <p className="text-[9px] font-black opacity-30 uppercase">{new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                  <h4 className="font-black uppercase italic mb-1">{sub.profiles?.display_name}</h4>
                  <p className="text-[9px] font-bold text-rose-500 uppercase mb-4">{sub.missions?.title}</p>
                  <button onClick={() => setSelectedSubmission(sub)} className="w-full bg-yellow-400 py-3 border-2 border-black font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_#000]">Verify Signal</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'brands' && <BrandManager />}
        </div>
      </main>
    </div>
  );
};