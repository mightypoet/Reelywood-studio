import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Layout, Users, Zap, Gift, LogOut, Search, 
  Check, X, Shield, Plus, Moon, Sun, Trash2,
  Loader2, ArrowRight, Activity, Terminal,
  Target, FileText, ArrowDownLeft, ArrowUpRight,
  Clock, Bell, Megaphone, Info
} from 'lucide-react';

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
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      alert("⛔ ACCESS DENIED: Admins Only");
      onLogout();
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'vouchers' | 'ledger'>('users');
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
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const [missionForm, setMissionForm] = useState({ title: '', desc: '', reward: '', assignTo: 'all' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', code: '' });

  useEffect(() => {
    fetchAllData();
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchAllData = async () => {
    console.log("🛠️ [ADMIN] Initializing Global Data Fetch...");
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const [profilesRes, missionsRes, rewardsRes, transRes, logsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (missionsRes.error) throw missionsRes.error;
      if (rewardsRes.error) throw rewardsRes.error;
      if (transRes.error) throw transRes.error;
      if (logsRes.error) throw logsRes.error;

      setUsers(profilesRes.data || []);
      setMissions(missionsRes.data || []);
      setVouchers(rewardsRes.data || []);
      setTransactions(transRes.data || []);
      setAdminLogs(logsRes.data || []);

      console.log("✅ [ADMIN] Data Sync Successful");

    } catch (error: any) {
      console.error("❌ [ADMIN] Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    setSubmitting(true);
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ card_status: 'approved' })
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
      
      // 1. Create Mission
      const { error: missionError } = await supabase!.from('missions').insert([{
        title: missionForm.title,
        description: missionForm.desc,
        reward_amount: rewardInt,
        assigned_to: assignedVal
      }]);
      if (missionError) throw missionError;

      // 2. Broadcast Notification
      const { error: notifError } = await supabase!.from('notifications').insert([{
        user_id: assignedVal || 'global',
        title: "🚀 NEW MISSION DEPLOYED",
        message: `Mission: ${missionForm.title} is now active. Check your dashboard.`,
        is_read: false
      }]);
      if (notifError) console.error("Broadcast Error:", notifError.message);

      setMissionForm({ title: '', desc: '', reward: '', assignTo: 'all' });
      await fetchAllData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.title || !voucherForm.cost) return alert("Title and Cost required");
    setSubmitting(true);
    try {
      const costInt = parseInt(voucherForm.cost);
      
      // 1. Create Reward
      const { error: rewardError } = await supabase!.from('rewards').insert([{
        title: voucherForm.title,
        cost: costInt,
        code: voucherForm.code.toUpperCase(),
      }]);
      if (rewardError) throw rewardError;

      // 2. Broadcast Notification
      const { error: notifError } = await supabase!.from('notifications').insert([{
        user_id: 'global',
        title: "🎁 NEW REWARD ADDED",
        message: `New inventory available in the Vault: ${voucherForm.title}`,
        is_read: false
      }]);
      if (notifError) console.error("Broadcast Error:", notifError.message);

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

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.card_status === filter;
  });

  if (loading && users.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center space-y-4`}>
        <Loader2 className="animate-spin text-[#834bf1]" size={48} />
        <p className={`font-black uppercase tracking-widest ${textColor} text-xs`}>Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} font-lexend transition-colors duration-500 overflow-x-hidden`}>
      <header className={`border-b-4 ${borderColor} ${cardColor} px-8 py-6 flex items-center justify-between sticky top-0 z-[100]`}>
        <div className="flex items-center space-x-6">
          <div className={`${primaryAccent} w-12 h-12 flex items-center justify-center border-4 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <Terminal size={24} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className={`p-3 border-4 ${borderColor} bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all relative`}
            >
              <Bell size={20} strokeWidth={3} />
              {adminLogs.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-none border-2 border-black animate-pulse"></div>
              )}
            </button>
            
            {showNotifMenu && (
              <div className={`absolute top-full right-0 mt-4 w-80 ${cardColor} border-4 ${borderColor} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[200] overflow-hidden animate-in slide-in-from-top-2 duration-200`}>
                <div className={`p-4 border-b-2 ${borderColor} flex justify-between items-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                   <span className="font-black uppercase text-[10px] tracking-widest">Broadcast Log</span>
                   <button onClick={() => setShowNotifMenu(false)}><X size={14} strokeWidth={3}/></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {adminLogs.length === 0 ? (
                    <div className="p-8 text-center opacity-40 text-[10px] font-black uppercase tracking-widest italic">No Transmission Logs</div>
                  ) : (
                    adminLogs.map((log, i) => (
                      <div key={i} className={`p-4 border-b-2 ${borderColor} last:border-0 hover:bg-black/5 transition-colors`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-black uppercase text-[9px] tracking-tight truncate mr-2">{log.title}</span>
                          <span className="text-[8px] font-mono opacity-40">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[9px] font-bold opacity-60 leading-tight">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 bg-black/5 text-center">
                   <button onClick={fetchAllData} className="text-[9px] font-black uppercase tracking-widest hover:text-[#834bf1]">Refresh Grid</button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 border-4 ${borderColor} ${isDark ? 'bg-[#ffde59] text-black' : 'bg-black text-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          <button onClick={() => { auth.signOut(); onLogout(); }} className={`flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 ${isDark ? 'border-white' : 'border-black'} font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            <span>Exit</span>
            <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Agents', val: users.length, icon: Users },
            { label: 'Pending', val: users.filter(u => u.card_status === 'pending').length, icon: Search },
            { label: 'Missions', val: missions.length, icon: Zap },
            { label: 'Tx Volume', val: transactions.length, icon: Activity }
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
            { id: 'users', label: 'User Command', icon: <Users size={18}/> },
            { id: 'missions', label: 'Mission Console', icon: <Target size={18}/> },
            { id: 'vouchers', label: 'Voucher Vault', icon: <Gift size={18}/> },
            { id: 'ledger', label: 'Global Ledger', icon: <FileText size={18}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id ? `${primaryAccent} border-2 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` : 'opacity-40 hover:opacity-100'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
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
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Status</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`border-b-2 ${borderColor} hover:bg-black/5 transition-colors group`}>
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 border-2 ${borderColor} ${primaryAccent} flex items-center justify-center font-black text-lg`}>
                              {user.display_name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="font-black uppercase italic leading-none mb-1">{user.display_name}</p>
                              <p className="text-[10px] font-mono opacity-40">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          {user.platform && <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-blue-500">{user.platform}</div>}
                          <div className="text-[10px] font-mono opacity-60">FOLLOWERS: {user.followers || 0}</div>
                        </td>
                        <td className="p-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border-2 ${borderColor} ${user.card_status === 'approved' ? 'bg-green-500 text-white' : user.card_status === 'pending' ? 'bg-yellow-400 text-black animate-pulse' : 'bg-slate-300 text-slate-600'}`}>
                            {user.card_status || 'none'}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          {user.card_status === 'pending' && (
                            <button onClick={() => handleApprove(user.firebase_uid)} disabled={submitting} className="bg-green-500 text-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all disabled:opacity-50">
                              <Check size={18} strokeWidth={3} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <form onSubmit={handleCreateMission} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black uppercase italic flex items-center space-x-3"><Plus className="text-pink-500" strokeWidth={4} /><span>Deploy Mission</span></h3>
                     <div className="bg-black text-white px-3 py-1 border-2 border-white text-[8px] font-black uppercase tracking-widest flex items-center space-x-1">
                        <Megaphone size={10} className="text-[#ffde59]" />
                        <span>Auto-Broadcast</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Mission Title</label>
                      <input required type="text" value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`} placeholder="E.G. REEL PRODUCTION"/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Objective Brief</label>
                      <textarea required rows={3} value={missionForm.desc} onChange={e => setMissionForm({...missionForm, desc: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none resize-none`} placeholder="DEFINE THE DELIVERABLES..."/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-40">Reward (RC)</label><input required type="number" value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}/></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Sync</label>
                        <select value={missionForm.assignTo} onChange={e => setMissionForm({...missionForm, assignTo: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none appearance-none cursor-pointer`}>
                          <option value="all" className="text-black">🌍 ALL AGENTS</option>
                          {users.filter(u => u.card_status === 'approved').map(u => (<option key={u.id} value={u.firebase_uid} className="text-black">👤 {u.display_name}</option>))}
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full ${secondaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}>{submitting ? 'EXECUTING...' : 'INITIALIZE PROTOCOL'}</button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Active Deployments ({missions.length})</h3>
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin">
                  {missions.map(m => (
                    <div key={m.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start group`}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${borderColor}`}>{m.assigned_to ? 'DIRECT' : 'GLOBAL'}</span><span className="text-[9px] font-mono opacity-40">ID: {m.id}</span></div>
                        <h4 className="text-xl font-black uppercase italic group-hover:text-pink-500 transition-colors">{m.title}</h4>
                        <p className="text-[11px] font-bold opacity-40 uppercase max-w-md">{m.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-4">
                        <div className={`${primaryAccent} border-2 ${borderColor} px-4 py-2 font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>+{m.reward_amount} RC</div>
                        <button onClick={() => handleDelete('missions', m.id)} className="text-rose-500 hover:scale-110 transition-transform"><Trash2 size={18} strokeWidth={3} /></button>
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
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black uppercase italic flex items-center space-x-3"><Plus className="text-blue-500" strokeWidth={4} /><span>Mint Voucher</span></h3>
                     <div className="bg-black text-white px-3 py-1 border-2 border-white text-[8px] font-black uppercase tracking-widest flex items-center space-x-1">
                        <Megaphone size={10} className="text-[#834bf1]" />
                        <span>Auto-Broadcast</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-40">Voucher Name</label><input required type="text" value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`} placeholder="E.G. EXCLUSIVE ACCESS"/></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sync Cost (RC)</label><input required type="number" value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}/></div>
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Code</label><input required type="text" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})} className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none uppercase`} placeholder="RW-XXX"/></div>
                    </div>
                    <button type="submit" disabled={submitting} className={`w-full ${primaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}>{submitting ? 'MINTING...' : 'SECURE IN VAULT'}</button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Vault Inventory ({vouchers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map(v => (
                    <div key={v.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group relative`}>
                      <div className="flex justify-between items-start mb-6"><div className={`w-10 h-10 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} border-2 ${borderColor} flex items-center justify-center`}><Gift size={20} strokeWidth={3} /></div><button onClick={() => handleDelete('rewards', v.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity"><Trash2 size={16} /></button></div>
                      <h4 className="text-xl font-black uppercase italic mb-1">{v.title}</h4>
                      <p className={`text-2xl font-black ${isDark ? 'text-[#39ff14]' : 'text-[#834bf1]'}`}>{v.cost} RC</p>
                      <div className="mt-4 pt-4 border-t-2 border-black/10"><code className="text-[10px] font-mono opacity-40 uppercase tracking-widest">SYNC CODE: {v.code}</code></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-8">
              <div className={`${cardColor} border-4 ${borderColor} shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b-4 ${borderColor} ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Timestamp</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Agent Identity</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Mission/Protocol</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center opacity-20 font-black uppercase text-xs tracking-widest italic">No Ledger Records Found</td>
                      </tr>
                    ) : (
                      transactions.map((tx, i) => (
                        <tr key={i} className={`border-b-2 ${borderColor} hover:bg-black/5 transition-colors group`}>
                          <td className="p-6">
                            <div className="flex items-center space-x-3">
                              <Clock size={14} className="opacity-40" />
                              <span className="text-[10px] font-mono font-bold">
                                {new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} {new Date(tx.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 border-2 ${borderColor} ${secondaryAccent} flex items-center justify-center font-black text-xs`}>
                                {getUserName(tx.user_uid).charAt(0)}
                              </div>
                              <span className="text-xs font-black uppercase italic">{getUserName(tx.user_uid)}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-tight">{tx.description || 'System Audit Log'}</span>
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {tx.amount >= 0 ? <ArrowDownLeft size={14} className="text-emerald-500" /> : <ArrowUpRight size={14} className="text-rose-500" />}
                              <span className={`text-sm font-black italic tracking-tighter ${tx.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {tx.amount >= 0 ? '+' : ''}{tx.amount} RC
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={`mt-20 border-t-4 ${borderColor} p-12 text-center bg-black/5`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] opacity-30">REELYWOOD STUDIO • SECURE COMMAND CENTER • VER 4.8.8</p>
          <div className="flex items-center space-x-10 opacity-30 text-[10px] font-black uppercase tracking-widest italic">
             <div className="flex items-center space-x-2"><Shield size={14} className={isDark ? 'text-[#39ff14]' : 'text-black'} /><span>Encryption Active</span></div>
             <div className="flex items-center space-x-2"><Activity size={14} className={isDark ? 'text-[#ff00ff]' : 'text-black'} /><span>System Healthy</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};