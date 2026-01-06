import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Layout, Users, Zap, Gift, LogOut, Search, 
  Check, X, Shield, Plus, Moon, Sun, Trash2,
  Loader2, ArrowRight, Activity, Terminal,
  Target
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Added export to fix import error in EmailComposer.tsx
export interface Profile {
  firebase_uid: string;
  email: string;
  display_name: string;
  card_status: string;
  role: string;
  reelcoins: number;
}

// Define your Admin Emails here
const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  // --- SECURITY CHECK ---
  useEffect(() => {
    const user = auth.currentUser;
    // If no user, or email is not in the list -> KICK THEM OUT
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      alert("⛔ ACCESS DENIED: Admins Only");
      onLogout(); // Redirects to home
    }
  }, []);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'vouchers'>('users');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved ? saved === 'dark' : true;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Form State
  const [missionForm, setMissionForm] = useState({ title: '', desc: '', reward: '', assignTo: 'all' });
  const [voucherForm, setVoucherForm] = useState({ title: '', cost: '', code: '' });

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchAllData();
    localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchAllData = async () => {
    console.log("🛠️ [ADMIN] Initializing Global Data Fetch...");
    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const [profilesRes, missionsRes, rewardsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (missionsRes.error) throw missionsRes.error;
      if (rewardsRes.error) throw rewardsRes.error;

      setUsers(profilesRes.data || []);
      setMissions(missionsRes.data || []);
      setVouchers(rewardsRes.data || []);

      console.log("✅ [ADMIN] Data Sync Successful", {
        users: profilesRes.data?.length,
        missions: missionsRes.data?.length,
        vouchers: rewardsRes.data?.length
      });

    } catch (error: any) {
      console.error("❌ [ADMIN] Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleApprove = async (uid: string) => {
    console.log(`🚀 [ADMIN] Triggering Approval for UID: ${uid}`);
    setSubmitting(true);
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ card_status: 'approved' })
        .eq('firebase_uid', uid);

      if (error) throw error;
      console.log("✅ [ADMIN] User approved.");
      await fetchAllData();
    } catch (error: any) {
      console.error("❌ [ADMIN] Approval failed:", error.message);
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionForm.title || !missionForm.reward) return alert("Title and Reward required");
    
    const rewardInt = parseInt(missionForm.reward);
    const assignedVal = missionForm.assignTo === 'all' ? null : missionForm.assignTo;

    const payload = {
      title: missionForm.title,
      description: missionForm.desc,
      reward_amount: rewardInt,
      assigned_to: assignedVal
    };

    console.log("📤 [ADMIN] Deploying Mission Payload:", payload);
    setSubmitting(true);

    try {
      const { error } = await supabase!.from('missions').insert([payload]);
      if (error) throw error;

      console.log("✅ [ADMIN] Mission Created Successfully");
      setMissionForm({ title: '', desc: '', reward: '', assignTo: 'all' });
      await fetchAllData();
      alert("Mission Deployed!");
    } catch (error: any) {
      console.error("❌ [ADMIN] Mission Creation Failed:", error.message);
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.title || !voucherForm.cost) return alert("Title and Cost required");

    const costInt = parseInt(voucherForm.cost);
    const payload = {
      title: voucherForm.title,
      cost: costInt,
      code: voucherForm.code.toUpperCase(),
    };

    console.log("🎁 [ADMIN] Minting Voucher Payload:", payload);
    setSubmitting(true);

    try {
      const { error } = await supabase!.from('rewards').insert([payload]);
      if (error) throw error;

      console.log("✅ [ADMIN] Voucher Minted Successfully");
      setVoucherForm({ title: '', cost: '', code: '' });
      await fetchAllData();
      alert("Voucher Minted!");
    } catch (error: any) {
      console.error("❌ [ADMIN] Voucher Creation Failed:", error.message);
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (table: string, id: any) => {
    if (!confirm("Delete this item permanently?")) return;
    console.log(`🗑️ [ADMIN] Deleting from ${table}, ID: ${id}`);
    try {
      const { error } = await supabase!.from(table).delete().eq('id', id);
      if (error) throw error;
      await fetchAllData();
    } catch (error: any) {
      console.error("❌ [ADMIN] Delete error:", error.message);
    }
  };

  // --- DESIGN HELPERS ---
  const isDark = darkMode;
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white' : 'border-black';
  const cardColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#f3f4f6]';
  const primaryAccent = isDark ? 'bg-[#39ff14] text-black' : 'bg-[#834bf1] text-white';
  const secondaryAccent = isDark ? 'bg-[#ff00ff] text-white' : 'bg-[#ffde59] text-black';

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
      
      {/* HEADER */}
      <header className={`border-b-4 ${borderColor} ${cardColor} px-8 py-6 flex items-center justify-between sticky top-0 z-[100]`}>
        <div className="flex items-center space-x-6">
          <div className={`${primaryAccent} w-12 h-12 flex items-center justify-center border-4 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <Terminal size={24} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 border-4 ${borderColor} ${isDark ? 'bg-[#ffde59] text-black' : 'bg-black text-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}
          >
            {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          
          <button 
            onClick={() => { auth.signOut(); onLogout(); }}
            className={`flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 ${isDark ? 'border-white' : 'border-black'} font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}
          >
            <span>Exit</span>
            <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-12">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Network Agents', val: users.length, icon: Users, color: 'text-blue-400' },
            { label: 'Pending Auth', val: users.filter(u => u.card_status === 'pending').length, icon: Search, color: 'text-yellow-400' },
            { label: 'Active Missions', val: missions.length, icon: Zap, color: 'text-pink-500' }
          ].map((stat, i) => (
            <div key={i} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">{stat.label}</p>
                  <h3 className="text-6xl font-black italic tracking-tighter leading-none">{stat.val.toString().padStart(2, '0')}</h3>
                </div>
                <stat.icon className={`w-12 h-12 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`} />
              </div>
            </div>
          ))}
        </div>

        {/* TAB NAVIGATION */}
        <div className={`flex border-4 ${borderColor} p-1.5 ${cardColor} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
          {[
            { id: 'users', label: 'User Command', icon: <Users size={18}/> },
            { id: 'missions', label: 'Mission Console', icon: <Target size={18}/> },
            { id: 'vouchers', label: 'Voucher Vault', icon: <Gift size={18}/> }
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
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                {['all', 'pending', 'approved'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f as any)} 
                    className={`px-6 py-2 border-2 ${borderColor} font-black uppercase text-[10px] tracking-widest transition-all ${filter === f ? secondaryAccent + ' shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'opacity-40'}`}
                  >
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
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border-2 ${borderColor} ${
                            user.card_status === 'approved' ? 'bg-green-500 text-white' : 
                            user.card_status === 'pending' ? 'bg-yellow-400 text-black animate-pulse' : 
                            'bg-slate-300 text-slate-600'
                          }`}>
                            {user.card_status || 'none'}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          {user.card_status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(user.firebase_uid)}
                              disabled={submitting}
                              className="bg-green-500 text-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all disabled:opacity-50"
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                          )}
                          {user.card_status === 'approved' && (
                            <div className="text-green-500 flex items-center justify-end space-x-2">
                              <Shield size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Verified Agent</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <form onSubmit={handleCreateMission} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center space-x-3">
                    <Plus className="text-pink-500" strokeWidth={4} />
                    <span>Deploy Mission</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Mission Title</label>
                      <input 
                        required
                        type="text" 
                        value={missionForm.title}
                        onChange={e => setMissionForm({...missionForm, title: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        placeholder="E.G. REEL PRODUCTION"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Objective Brief</label>
                      <textarea 
                        required
                        rows={3}
                        value={missionForm.desc}
                        onChange={e => setMissionForm({...missionForm, desc: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none resize-none`}
                        placeholder="DEFINE THE DELIVERABLES..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Reward (RC)</label>
                        <input 
                          required
                          type="number" 
                          value={missionForm.reward}
                          onChange={e => setMissionForm({...missionForm, reward: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Sync</label>
                        <select 
                          value={missionForm.assignTo}
                          onChange={e => setMissionForm({...missionForm, assignTo: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none appearance-none cursor-pointer`}
                        >
                          <option value="all" className="text-black">🌍 ALL AGENTS</option>
                          {users.filter(u => u.card_status === 'approved').map(u => (
                            <option key={u.id} value={u.firebase_uid} className="text-black">👤 {u.display_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className={`w-full ${secondaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}
                    >
                      {submitting ? 'EXECUTING...' : 'INITIALIZE PROTOCOL'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Active Deployments ({missions.length})</h3>
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin">
                  {missions.map(m => (
                    <div key={m.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start group`}>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-2 ${borderColor}`}>
                            {m.assigned_to ? 'DIRECT' : 'GLOBAL'}
                          </span>
                          <span className="text-[9px] font-mono opacity-40">ID: {m.id}</span>
                        </div>
                        <h4 className="text-xl font-black uppercase italic group-hover:text-pink-500 transition-colors">{m.title}</h4>
                        <p className="text-[11px] font-bold opacity-40 uppercase max-w-md">{m.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-4">
                        <div className={`${primaryAccent} border-2 ${borderColor} px-4 py-2 font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                          +{m.reward_amount} RC
                        </div>
                        <button onClick={() => handleDelete('missions', m.id)} className="text-rose-500 hover:scale-110 transition-transform">
                          <Trash2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOUCHERS TAB */}
          {activeTab === 'vouchers' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <form onSubmit={handleCreateVoucher} className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-6`}>
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center space-x-3">
                    <Plus className="text-blue-500" strokeWidth={4} />
                    <span>Mint Voucher</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Voucher Name</label>
                      <input 
                        required
                        type="text" 
                        value={voucherForm.title}
                        onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        placeholder="E.G. EXCLUSIVE ACCESS"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sync Cost (RC)</label>
                        <input 
                          required
                          type="number" 
                          value={voucherForm.cost}
                          onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Code</label>
                        <input 
                          required
                          type="text" 
                          value={voucherForm.code}
                          onChange={e => setVoucherForm({...voucherForm, code: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none uppercase`}
                          placeholder="RW-XXX"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className={`w-full ${primaryAccent} py-6 border-4 ${borderColor} shadow-[6px_6px_0px_0px_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}
                    >
                      {submitting ? 'MINTING...' : 'SECURE IN VAULT'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Vault Inventory ({vouchers.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vouchers.map(v => (
                    <div key={v.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group relative`}>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-10 h-10 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} border-2 ${borderColor} flex items-center justify-center`}>
                          <Gift size={20} strokeWidth={3} />
                        </div>
                        <button onClick={() => handleDelete('rewards', v.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="text-xl font-black uppercase italic mb-1">{v.title}</h4>
                      <p className={`text-2xl font-black ${isDark ? 'text-[#39ff14]' : 'text-[#834bf1]'}`}>{v.cost} RC</p>
                      <div className="mt-4 pt-4 border-t-2 border-black/10">
                        <code className="text-[10px] font-mono opacity-40 uppercase tracking-widest">SYNC CODE: {v.code}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className={`mt-20 border-t-4 ${borderColor} p-12 text-center bg-black/5`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] opacity-30">
            REELYWOOD STUDIO • SECURE COMMAND CENTER • VER 4.8.5
          </p>
          <div className="flex items-center space-x-10 opacity-30 text-[10px] font-black uppercase tracking-widest italic">
             <div className="flex items-center space-x-2">
               <Shield size={14} className={isDark ? 'text-[#39ff14]' : 'text-black'} />
               <span>Encryption Active</span>
             </div>
             <div className="flex items-center space-x-2">
               <Activity size={14} className={isDark ? 'text-[#ff00ff]' : 'text-black'} />
               <span>Ping: 12ms</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};