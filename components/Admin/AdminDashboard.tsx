
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Layout, Users, Zap, Gift, LogOut, Search, 
  Check, X, Shield, Plus, Moon, Sun, Trash2,
  Loader2, ArrowRight, Activity, Terminal,
  Target, FileText, ArrowDownLeft, ArrowUpRight,
  Clock, Bell, Megaphone, Info, CheckCircle2,
  Building2, Image as ImageIcon, MapPin, ListChecks
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

interface AdminDashboardProps {
  onLogout: () => void;
}

export interface Profile {
  firebase_uid: string;
  email: string;
  display_name: string;
  card_status: string;
  role: string;
  reelcoins: number;
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'vouchers' | 'ledger' | 'brands' | 'submissions'>('users');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved ? saved === 'dark' : true;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const [missionForm, setMissionForm] = useState({ 
    title: '', 
    desc: '', 
    reward: '', 
    assignTo: 'all',
    brand_id: '',
    location: '',
    image_url: '',
    checkpoints: ['', '', '']
  });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', code: '' });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      alert("⛔ ACCESS DENIED: Admins Only");
      onLogout();
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const [profilesRes, missionsRes, rewardsRes, transRes, logsRes, brandsRes, submissionsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name, email), missions(title, reward_amount, checkpoints)').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      setUsers(profilesRes.data || []);
      setMissions(missionsRes.data || []);
      setVouchers(rewardsRes.data || []);
      setTransactions(transRes.data || []);
      setAdminLogs(logsRes.data || []);
      setBrands(brandsRes.data || []);
      setSubmissions(submissionsRes.data || []);
    } catch (error: any) {
      console.error("❌ [ADMIN] Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setMissionForm({
        ...missionForm,
        brand_id: brandId,
        title: `Protocol: ${brand.name}`,
        location: brand.location_text || '',
        image_url: brand.cover_image_url || ''
      });
    } else {
      setMissionForm({ ...missionForm, brand_id: '', location: '', image_url: '' });
    }
  };

  const handleUpdateStatus = async (uid: string, status: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ card_status: status })
        .eq('firebase_uid', uid);
      if (error) throw error;
      await fetchAllData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionForm.title || !missionForm.reward) return alert("Title and Reward required");
    setSubmitting(true);
    try {
      const rewardInt = parseInt(missionForm.reward);
      const assignedVal = missionForm.assignTo === 'all' ? null : missionForm.assignTo;
      
      const { error: missionError } = await supabase!.from('missions').insert([{
        title: missionForm.title,
        description: missionForm.desc,
        reward_amount: rewardInt,
        assigned_to: assignedVal,
        brand_id: missionForm.brand_id || null,
        location: missionForm.location,
        image_url: missionForm.image_url,
        checkpoints: missionForm.checkpoints.filter(c => c.trim() !== '')
      }]);
      if (missionError) throw missionError;

      await supabase!.from('notifications').insert([{
        user_id: assignedVal || 'global',
        title: "🚀 NEW MISSION DEPLOYED",
        message: `Objective: ${missionForm.title} is now active. Check Dashboard.`,
        is_read: false
      }]);

      setMissionForm({ title: '', desc: '', reward: '', assignTo: 'all', brand_id: '', location: '', image_url: '', checkpoints: ['', '', ''] });
      await fetchAllData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * FIX: Added handleCreateVoucher to process the voucher creation form.
   */
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.title || !voucherForm.cost || !voucherForm.code) {
      return alert("Title, Cost, and Hash Code are required.");
    }
    setSubmitting(true);
    try {
      if (!supabase) throw new Error("Supabase client unavailable.");
      const { error } = await supabase.from('rewards').insert([{
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost),
        code: voucherForm.code.toUpperCase()
      }]);
      if (error) throw error;
      setVoucherForm({ title: '', cost: '', code: '' });
      await fetchAllData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (table: string, id: any) => {
    if (!confirm("Delete this item permanently?")) return;
    try {
      const { error } = await supabase!.from(table).delete().eq('id', id);
      if (error) throw error;
      await fetchAllData();
    } catch (error: any) {
      console.error("❌ [ADMIN] Delete error:", error.message);
    }
  };

  const isDark = darkMode;
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white' : 'border-black';
  const cardColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#f3f4f6]';
  const primaryAccent = isDark ? 'bg-[#39ff14] text-black' : 'bg-[#834bf1] text-white';
  const secondaryAccent = isDark ? 'bg-[#ffde59] text-black' : 'bg-[#ff00ff] text-white';

  const getUserName = (uid: string) => {
    const user = users.find(u => u.firebase_uid === uid);
    return user ? user.display_name : 'Unknown Agent';
  };

  const filteredUsers = users.filter(u => filter === 'all' ? true : u.card_status === filter);

  if (loading && users.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center space-y-4`}>
        <Loader2 className="animate-spin text-[#834bf1]" size={48} strokeWidth={4} />
        <p className={`font-black uppercase tracking-[0.4em] ${textColor} text-[10px]`}>Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} font-lexend transition-colors duration-500 overflow-x-hidden pb-32`}>
      {selectedSubmission && (
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
          onRefresh={fetchAllData} 
        />
      )}
      
      <header className={`border-b-4 ${borderColor} ${cardColor} px-8 py-6 flex items-center justify-between sticky top-0 z-[100] backdrop-blur-md bg-opacity-80`}>
        <div className="flex items-center space-x-6">
          <div className={`${primaryAccent} w-12 h-12 flex items-center justify-center border-4 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <Terminal size={24} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setShowNotifMenu(!showNotifMenu)} className={`p-3 border-4 ${borderColor} bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all relative`}>
            <Bell size={20} strokeWidth={3} />
            {adminLogs.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border-2 border-black animate-pulse"></div>}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 border-4 ${borderColor} ${isDark ? 'bg-[#ffde59] text-black' : 'bg-black text-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          <button onClick={() => { auth.signOut(); onLogout(); }} className={`flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 ${isDark ? 'border-white' : 'border-black'} font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            <span>Exit</span> <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {[
            { label: 'Agents', val: users.length, icon: Users, accent: 'bg-[#834bf1]' },
            { label: 'Pending', val: users.filter(u => u.card_status === 'pending').length, icon: Search, accent: 'bg-[#ffde59]' },
            { label: 'Alliance', val: brands.length, icon: Building2, accent: 'bg-[#39ff14]' },
            { label: 'Missions', val: missions.length, icon: Zap, accent: 'bg-[#ff00ff]' },
            { label: 'Queued', val: submissions.length, icon: ListChecks, accent: 'bg-rose-500' },
            { label: 'Tx Volume', val: transactions.length, icon: Activity, accent: 'bg-white' }
          ].map((stat, i) => (
            <div key={i} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">{stat.label}</p>
                  <h3 className="text-5xl font-black italic tracking-tighter leading-none">{stat.val.toString().padStart(2, '0')}</h3>
                </div>
                <stat.icon className={`w-10 h-10 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`} />
              </div>
            </div>
          ))}
        </div>

        <div className={`flex border-4 ${borderColor} p-1.5 ${cardColor} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
          {[
            { id: 'users', label: 'Command', icon: <Users size={18}/> },
            { id: 'submissions', label: 'Queued', icon: <ListChecks size={18}/> },
            { id: 'brands', label: 'Alliance', icon: <Building2 size={18}/> },
            { id: 'missions', label: 'Console', icon: <Target size={18}/> },
            { id: 'vouchers', label: 'Vault', icon: <Gift size={18}/> },
            { id: 'ledger', label: 'Ledger', icon: <FileText size={18}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id ? `${primaryAccent} border-2 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` : 'opacity-40 hover:opacity-100'}`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                {['all', 'pending', 'approved'].map(f => (
                  <button key={f} onClick={() => setFilter(f as any)} className={`px-6 py-2 border-2 ${borderColor} font-black uppercase text-[10px] tracking-widest transition-all ${filter === f ? secondaryAccent + ' shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-40'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className={`${cardColor} border-4 ${borderColor} shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b-4 ${borderColor} ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Agent Identity</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Platform Info</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`border-b-2 ${borderColor} hover:bg-black/5 transition-colors group`}>
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 border-2 ${borderColor} ${primaryAccent} flex items-center justify-center font-black text-lg`}>{user.display_name?.charAt(0) || 'A'}</div>
                            <div>
                              <p className="font-black uppercase italic mb-1">{user.display_name}</p>
                              <p className="text-[10px] font-mono opacity-40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          {user.platform && <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-500">{user.platform}</div>}
                          <div className="text-[10px] font-mono opacity-60">F: {user.followers || 0} • {user.niche}</div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleUpdateStatus(user.firebase_uid, 'rejected')} className="px-4 py-2 border-2 border-black bg-gray-200 hover:bg-rose-500 hover:text-white font-black text-[10px] shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all uppercase">Reject</button>
                             <button onClick={() => handleUpdateStatus(user.firebase_uid, 'approved')} className={`px-4 py-2 border-2 border-black ${user.card_status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-emerald-400 text-black hover:bg-emerald-500'} font-black text-[10px] shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center gap-2`}>{user.card_status === 'approved' ? <Check size={14}/> : <Plus size={14}/>} {user.card_status === 'approved' ? 'Verified' : 'Approve'}</button>
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
            <div className="space-y-8">
              <h3 className="text-3xl font-black italic uppercase font-display">Mission Queue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {submissions.map(sub => (
                  <div key={sub.id} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-6 group hover:-translate-y-1 transition-all`}>
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-[#834bf1] border-2 border-black flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#000]">
                        <Clock size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Submitted At</p>
                        <p className="text-xs font-bold">{new Date(sub.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-xl uppercase italic mb-1">{sub.profiles?.display_name || 'Agent'}</h4>
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{sub.missions?.title}</p>
                    </div>
                    <div className="bg-white border-2 border-black p-4 text-xs font-bold text-blue-600 underline truncate shadow-[2px_2px_0px_0px_#000]">
                      {sub.link}
                    </div>
                    <button 
                      onClick={() => setSelectedSubmission(sub)}
                      className="w-full bg-[#ffde59] py-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center justify-center space-x-3"
                    >
                      <ListChecks size={18} />
                      <span>Execute Verification</span>
                    </button>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div className="col-span-full py-24 text-center opacity-30 font-black uppercase tracking-[0.4em] text-xs">
                    Clear Terminal. No Submissions Queued.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'brands' && <BrandManager />}

          {activeTab === 'missions' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <form onSubmit={handleCreateMission} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black uppercase italic flex items-center space-x-3 font-display"><Plus className="text-pink-500" strokeWidth={4} /><span>Mission Console</span></h3>
                     <div className="bg-black text-white px-3 py-1 border-2 border-white text-[8px] font-black uppercase tracking-widest flex items-center space-x-1"><Megaphone size={10} className="text-[#ffde59]" /><span>Auto-Signal</span></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Link Ecosystem Partner</label>
                      <select className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none appearance-none cursor-pointer shadow-[4px_4px_0px_0px_#000] text-black`} value={missionForm.brand_id} onChange={(e) => handleBrandSelect(e.target.value)}>
                        <option value="">-- Manual Config (No Link) --</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Objective Header</label>
                      <input required type="text" value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none shadow-[4px_4px_0px_0px_#000] text-black`} placeholder="PROTOCOL NAME"/>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Intelligence Brief</label>
                      <textarea required rows={3} value={missionForm.desc} onChange={e => setMissionForm({...missionForm, desc: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none resize-none shadow-[4px_4px_0px_0px_#000] text-black`} placeholder="DELIVERABLES..."/>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Mission Checkpoints (Criteria)</label>
                       {missionForm.checkpoints.map((pt, idx) => (
                          <input 
                            key={idx}
                            type="text" 
                            placeholder={`Checkpoint ${idx + 1}`}
                            className={`w-full bg-white border-2 ${borderColor} p-2 font-black text-[10px] focus:outline-none shadow-[2px_2px_0px_0px_#000] text-black mb-1`}
                            value={pt}
                            onChange={(e) => {
                               const pts = [...missionForm.checkpoints];
                               pts[idx] = e.target.value;
                               setMissionForm({ ...missionForm, checkpoints: pts });
                            }}
                          />
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Reward (RC)</label><input required type="number" value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none shadow-[4px_4px_0px_0px_#000] text-black`}/></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Target Agent</label>
                        <select value={missionForm.assignTo} onChange={e => setMissionForm({...missionForm, assignTo: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none appearance-none cursor-pointer shadow-[4px_4px_0px_0px_#000] text-black`}>
                          <option value="all">🌍 GLOBAL</option>
                          {users.filter(u => u.card_status === 'approved').map(u => (<option key={u.id} value={u.firebase_uid}>👤 {u.display_name}</option>))}
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full ${secondaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50 active:translate-y-0.5 active:shadow-none`}>{submitting ? 'EXECUTING...' : 'DEPLOY MISSION PROTOCOL'}</button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest font-display">Active Sync Grid</h3>
                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4 scrollbar-hide">
                  {missions.map(m => (
                    <div key={m.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start group`}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3"><span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${borderColor} ${m.assigned_to ? 'bg-pink-500 text-white' : 'bg-emerald-400 text-black'}`}>{m.assigned_to ? 'DIRECT' : 'GLOBAL'}</span></div>
                        <h4 className="text-xl font-black uppercase italic group-hover:text-pink-500 transition-colors font-display">{m.title}</h4>
                        <p className="text-[10px] font-bold opacity-60 uppercase max-w-md italic">{m.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-4">
                        <div className={`${primaryAccent} border-2 ${borderColor} px-4 py-2 font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm`}>+{m.reward_amount} RC</div>
                        <button onClick={() => handleDelete('missions', m.id)} className="text-rose-500 hover:scale-125 transition-transform"><Trash2 size={20} strokeWidth={3} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <form onSubmit={handleCreateVoucher} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <h3 className="text-2xl font-black uppercase italic flex items-center space-x-3 font-display"><Gift className="text-blue-500" strokeWidth={4} /><span>Mint Voucher</span></h3>
                  <div className="space-y-4">
                    <div><label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block italic">Inventory Label</label><input required type="text" value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none shadow-[4px_4px_0px_0px_#000] text-black`} placeholder="VOUCHER NAME"/></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block italic">Vault Cost (RC)</label><input required type="number" value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none shadow-[4px_4px_0px_0px_#000] text-black`}/></div>
                      <div><label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block italic">Unlock Hash</label><input required type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} className={`w-full bg-white border-4 ${borderColor} p-4 font-black focus:outline-none uppercase shadow-[4px_4px_0px_0px_#000] text-black`} placeholder="RW-XXX"/></div>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full ${primaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs transition-all active:shadow-none`}>{submitting ? 'SYNCING...' : 'AUTHORIZE INVENTORY'}</button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest font-display">Vault Grid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map(v => (
                    <div key={v.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group relative`}>
                      <div className="flex justify-between items-start mb-6"><div className={`w-10 h-10 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} border-2 ${borderColor} flex items-center justify-center`}><Gift size={20} strokeWidth={3} /></div><button onClick={() => handleDelete('rewards', v.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 size={16} /></button></div>
                      <h4 className="text-xl font-black uppercase italic mb-1 font-display">{v.title}</h4>
                      <p className={`text-2xl font-black ${isDark ? 'text-[#39ff14]' : 'text-[#834bf1]'}`}>{v.cost} RC</p>
                      <div className="mt-4 pt-4 border-t-2 border-black/10"><code className="text-[8px] font-mono opacity-40 uppercase tracking-widest">HASH: {v.code}</code></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className={`${cardColor} border-4 ${borderColor} shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-x-auto`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b-4 ${borderColor} ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Timestamp</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Identity</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-widest">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={i} className={`border-b-2 ${borderColor} hover:bg-black/5 transition-colors`}>
                      <td className="p-6 font-mono text-[9px] opacity-40">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="p-6 font-black uppercase text-xs italic">{getUserName(tx.user_uid)}</td>
                      <td className="p-6 text-right"><span className={`font-black italic ${tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.amount >= 0 ? '+' : ''}{tx.amount} RC</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
