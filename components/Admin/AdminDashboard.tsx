
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, 
  Target, 
  Ticket, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Zap, 
  ShieldCheck, 
  Moon, 
  Sun,
  Activity,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Search,
  BarChart3
} from 'lucide-react';

// Exporting Profile for use in other admin components
export interface Profile {
  firebase_uid: string;
  display_name: string;
  handle: string;
  email: string;
  card_status: 'none' | 'pending' | 'approved' | 'rejected';
  reelcoins: number;
  niche: string;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  reward_amount: number;
  assigned_to: string | null;
  created_at: string;
}

interface Reward {
  id: number;
  title: string;
  cost: number;
  code: string;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  // --- STATE ---
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'rewards'>('users');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [submitting, setSubmitting] = useState(false);

  // --- FORMS ---
  const [missionForm, setMissionForm] = useState({ title: '', desc: '', reward: '', assignTo: 'all' });
  const [rewardForm, setRewardForm] = useState({ title: '', cost: '', code: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    console.log("🔄 [ADMIN] Initiating global data fetch...");
    setLoading(true);
    try {
      if (!supabase) return;

      const [profilesRes, missionsRes, rewardsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (missionsRes.data) setMissions(missionsRes.data);
      if (rewardsRes.data) setRewards(rewardsRes.data);

      console.log("✅ [ADMIN] Data sync complete.", {
        users: profilesRes.data?.length,
        missions: missionsRes.data?.length,
        rewards: rewardsRes.data?.length
      });
    } catch (err) {
      console.error("❌ [ADMIN] Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (uid: string) => {
    console.log(`🚀 [ADMIN] Approving user: ${uid}`);
    setSubmitting(true);
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ card_status: 'approved' })
        .eq('firebase_uid', uid);

      if (error) throw error;
      console.log("✅ [ADMIN] User verified successfully.");
      await fetchAllData();
    } catch (err: any) {
      console.error("❌ [ADMIN] Approval failed:", err.message);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeployMission = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: missionForm.title,
      description: missionForm.desc,
      reward_amount: parseInt(missionForm.reward) || 0,
      assigned_to: missionForm.assignTo === 'all' ? null : missionForm.assignTo
    };

    console.log("📤 [ADMIN] Deploying mission payload:", payload);
    setSubmitting(true);

    try {
      const { error } = await supabase!.from('missions').insert([payload]);
      if (error) throw error;

      console.log("✅ [ADMIN] Mission deployed to grid.");
      setMissionForm({ title: '', desc: '', reward: '', assignTo: 'all' });
      await fetchAllData();
    } catch (err: any) {
      console.error("❌ [ADMIN] Mission deployment failed:", err.message);
      alert("Mission Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMintReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: rewardForm.title,
      cost: parseInt(rewardForm.cost) || 0,
      code: rewardForm.code.toUpperCase()
    };

    console.log("🎁 [ADMIN] Minting reward asset:", payload);
    setSubmitting(true);

    try {
      const { error } = await supabase!.from('rewards').insert([payload]);
      if (error) throw error;

      console.log("✅ [ADMIN] Reward minted successfully.");
      setRewardForm({ title: '', cost: '', code: '' });
      await fetchAllData();
    } catch (err: any) {
      console.error("❌ [ADMIN] Reward mint failed:", err.message);
      alert("Reward Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (userFilter === 'all') return true;
    return p.card_status === userFilter;
  });

  // --- THEME VALUES ---
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const borderColor = isDark ? 'border-white' : 'border-black';
  const cardColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#f8fafc]';
  const primaryAccent = isDark ? 'bg-[#ff00ff]' : 'bg-[#834bf1]'; // Pink in dark, Purple in light
  const secondaryAccent = isDark ? 'bg-[#39ff14]' : 'bg-[#ffde59]'; // Green in dark, Yellow in light

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center space-y-6`}>
        <Loader2 className={`animate-spin ${isDark ? 'text-[#ff00ff]' : 'text-[#834bf1]'}`} size={64} strokeWidth={4} />
        <p className={`text-xs font-mono uppercase tracking-[0.5em] ${textColor} animate-pulse`}>Initializing Admin Node...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300 font-lexend`}>
      {/* --- HEADER --- */}
      <header className={`border-b-4 ${borderColor} ${cardColor} px-8 py-6 flex items-center justify-between sticky top-0 z-[100]`}>
        <div className="flex items-center space-x-6">
          <div className={`${primaryAccent} text-white border-4 ${borderColor} w-12 h-12 flex items-center justify-center font-black italic text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            R
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter hidden sm:block">Admin Terminal</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-3 border-4 ${borderColor} ${secondaryAccent} text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}
          >
            {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          
          <button 
            onClick={onLogout}
            className={`flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 ${isDark ? 'border-white' : 'border-black'} font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}
          >
            <span>Exit</span>
            <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-10">
        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Total Agents", value: profiles.length, color: isDark ? 'bg-white' : 'bg-slate-100', tColor: 'text-black' },
            { label: "Active Deployments", value: missions.length, color: primaryAccent, tColor: 'text-white' },
            { label: "Vault Assets", value: rewards.length, color: secondaryAccent, tColor: 'text-black' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} ${stat.tColor} border-4 ${borderColor} p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group`}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">{stat.label}</p>
              <div className="text-6xl font-black font-display italic tracking-tighter leading-none">
                {stat.value.toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* --- TABS --- */}
        <div className={`flex border-4 ${borderColor} p-1.5 ${cardColor} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
          {[
            { id: 'users', label: 'User Command', icon: <Users size={18}/> },
            { id: 'missions', label: 'Mission Console', icon: <Target size={18}/> },
            { id: 'rewards', label: 'Voucher Vault', icon: <Ticket size={18}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-3 py-4 font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id ? `${primaryAccent} text-white border-2 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` : 'hover:opacity-60'}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
          
          {/* USER COMMAND TAB */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4 bg-[#1a1a1a]/5 p-4 border-2 border-dashed border-black/10 rounded-none">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Filter Status:</p>
                {['all', 'pending', 'approved'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setUserFilter(f as any)}
                    className={`px-6 py-2 border-2 ${borderColor} font-black uppercase text-[10px] tracking-widest transition-all ${userFilter === f ? secondaryAccent + ' text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent opacity-40'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className={`${cardColor} border-4 ${borderColor} shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-x-auto`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b-4 ${borderColor} ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Agent Identity</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Niche</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest">Status</th>
                      <th className="p-6 font-black uppercase text-[10px] tracking-widest text-right">Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map(user => (
                      <tr key={user.firebase_uid} className={`border-b-2 ${borderColor} hover:bg-black/5 transition-colors`}>
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 border-2 ${borderColor} ${secondaryAccent} flex items-center justify-center font-black text-black`}>
                              {user.display_name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="font-black uppercase italic leading-none mb-1">{user.display_name}</p>
                              <p className="text-[10px] font-mono opacity-40">{user.handle || user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-[11px] font-black uppercase opacity-60">{user.niche || 'General'}</td>
                        <td className="p-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border-2 ${borderColor} ${
                            user.card_status === 'approved' ? 'bg-green-500 text-white' : 
                            user.card_status === 'pending' ? 'bg-[#ffde59] text-black animate-pulse' : 
                            'bg-slate-200 text-slate-500'
                          }`}>
                            {user.card_status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          {user.card_status !== 'approved' && (
                            <button 
                              onClick={() => handleApproveUser(user.firebase_uid)}
                              disabled={submitting}
                              className={`bg-green-500 text-white p-3 border-2 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all disabled:opacity-50`}
                            >
                              <UserCheck size={18} strokeWidth={3} />
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

          {/* MISSION CONSOLE TAB */}
          {activeTab === 'missions' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`}>
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center space-x-3">
                    <Plus className={isDark ? 'text-[#ff00ff]' : 'text-[#834bf1]'} strokeWidth={4} />
                    <span>Deploy Mission</span>
                  </h3>
                  <form onSubmit={handleDeployMission} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Title</label>
                      <input 
                        required
                        type="text" 
                        value={missionForm.title}
                        onChange={e => setMissionForm({...missionForm, title: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        placeholder="E.G. CABIN17A REEL PROD"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Objective</label>
                      <textarea 
                        required
                        rows={4}
                        value={missionForm.desc}
                        onChange={e => setMissionForm({...missionForm, desc: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none resize-none`}
                        placeholder="SPECIFY DELIVERABLES..."
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
                          placeholder="500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Target Agent</label>
                        <select 
                          value={missionForm.assignTo}
                          onChange={e => setMissionForm({...missionForm, assignTo: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none appearance-none cursor-pointer`}
                        >
                          <option value="all" className="text-black">GLOBAL GRID</option>
                          {profiles.filter(p => p.card_status === 'approved').map(p => (
                            <option key={p.firebase_uid} value={p.firebase_uid} className="text-black">
                              {p.display_name.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className={`w-full ${primaryAccent} text-white py-6 border-4 ${borderColor} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}
                    >
                      {submitting ? 'EXECUTING...' : 'INITIALIZE PROTOCOL'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Active Deployments ({missions.length})</h3>
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin">
                  {missions.map(m => (
                    <div key={m.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-start`}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className={`${isDark ? 'bg-white text-black' : 'bg-black text-white'} px-2 py-0.5 text-[9px] font-black uppercase`}>M-{m.id}</span>
                          <span className={`text-[9px] font-black uppercase ${isDark ? 'text-[#ff00ff]' : 'text-[#834bf1]'}`}>{m.assigned_to ? 'DIRECT' : 'GLOBAL'}</span>
                        </div>
                        <h4 className="text-xl font-black uppercase italic">{m.title}</h4>
                        <p className="text-[11px] font-bold opacity-40 uppercase max-w-md">{m.description}</p>
                      </div>
                      <div className={`${secondaryAccent} text-black border-2 ${borderColor} px-4 py-2 font-black italic`}>
                        +{m.reward_amount} RC
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOUCHER VAULT TAB */}
          {activeTab === 'rewards' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5">
                <div className={`${cardColor} border-4 ${borderColor} p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`}>
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center space-x-3">
                    <Plus className={isDark ? 'text-[#39ff14]' : 'text-[#ffde59]'} strokeWidth={4} />
                    <span>Mint Voucher</span>
                  </h3>
                  <form onSubmit={handleMintReward} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Asset Name</label>
                      <input 
                        required
                        type="text" 
                        value={rewardForm.title}
                        onChange={e => setRewardForm({...rewardForm, title: e.target.value})}
                        className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                        placeholder="E.G. STARBUCKS EXCLUSIVE"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sync Cost (RC)</label>
                        <input 
                          required
                          type="number" 
                          value={rewardForm.cost}
                          onChange={e => setRewardForm({...rewardForm, cost: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none`}
                          placeholder="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Code</label>
                        <input 
                          required
                          type="text" 
                          value={rewardForm.code}
                          onChange={e => setRewardForm({...rewardForm, code: e.target.value})}
                          className={`w-full bg-transparent border-4 ${borderColor} p-4 font-black focus:outline-none uppercase`}
                          placeholder="RW-SYNC"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className={`w-full ${secondaryAccent} text-black py-6 border-4 ${borderColor} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-2px] transition-all disabled:opacity-50`}
                    >
                      {submitting ? 'MINTING...' : 'SECURE IN VAULT'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black uppercase italic tracking-widest">Vault Inventory ({rewards.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rewards.map(r => (
                    <div key={r.id} className={`${cardColor} border-4 ${borderColor} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group`}>
                      <div className={`w-10 h-10 ${isDark ? 'bg-white text-black' : 'bg-black text-white'} border-2 ${borderColor} flex items-center justify-center mb-4`}>
                        <Ticket size={20} strokeWidth={3} />
                      </div>
                      <h4 className="text-xl font-black uppercase italic mb-1">{r.title}</h4>
                      <p className={`text-2xl font-black ${isDark ? 'text-[#39ff14]' : 'text-[#834bf1]'}`}>{r.cost} RC</p>
                      <div className="mt-6 pt-4 border-t-2 border-black/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono opacity-40">CODE: {r.code}</span>
                        <XCircle size={18} className="text-rose-500 cursor-pointer hover:scale-110 transition-transform" />
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
            REELYWOOD STUDIO • SECURE COMMAND CENTER • VER 4.8.0
          </p>
          <div className="flex items-center space-x-10 opacity-30 text-[10px] font-black uppercase tracking-widest italic">
             <div className="flex items-center space-x-2">
               <ShieldCheck size={14} className={isDark ? 'text-[#39ff14]' : 'text-black'} />
               <span>Encryption Active</span>
             </div>
             <div className="flex items-center space-x-2">
               <Activity size={14} className={isDark ? 'text-[#ff00ff]' : 'text-black'} />
               <span>Terminal Latency: 24ms</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
