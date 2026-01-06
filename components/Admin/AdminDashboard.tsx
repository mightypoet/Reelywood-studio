import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
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
  Search, 
  Filter,
  BarChart3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserMinus,
  // Fix: Added Activity icon to imports to resolve line 544 error
  Activity
} from 'lucide-react';

interface Profile {
  id: string;
  firebase_uid: string;
  display_name: string;
  handle: string;
  email: string;
  card_status: 'none' | 'pending' | 'approved' | 'rejected';
  reelcoins: number;
  niche: string;
}

// Fix: Exporting Application interface for compatibility with EmailComposer.tsx
export interface Application {
  id: string;
  fullName: string;
  email: string;
  status: 'none' | 'pending' | 'approved' | 'rejected';
}

interface Mission {
  id: number;
  title: string;
  description: string;
  reward_amount: number;
  assigned_to: string | 'all';
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
  const [activeTab, setActiveTab] = useState<'users' | 'missions' | 'rewards'>('users');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isActioning, setIsActioning] = useState<string | null>(null);

  // Form States
  const [missionForm, setMissionForm] = useState({ title: '', desc: '', reward: 0, assignTo: 'all' });
  const [rewardForm, setRewardForm] = useState({ title: '', cost: 0, code: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
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

    } catch (err) {
      console.error("Transmission Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (uid: string, status: Profile['card_status']) => {
    setIsActioning(uid);
    try {
      const { error } = await supabase!
        .from('profiles')
        .update({ card_status: status })
        .eq('firebase_uid', uid);
      
      if (error) throw error;
      await fetchAllData();
      alert(`User status updated to ${status.toUpperCase()}`);
    } catch (err: any) {
      alert("Status Update Failed: " + err.message);
    } finally {
      setIsActioning(null);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionForm.title || missionForm.reward <= 0) return;

    try {
      const { error } = await supabase!
        .from('missions')
        .insert([{
          title: missionForm.title,
          description: missionForm.desc,
          reward_amount: missionForm.reward,
          assigned_to: missionForm.assignTo
        }]);

      if (error) throw error;
      setMissionForm({ title: '', desc: '', reward: 0, assignTo: 'all' });
      await fetchAllData();
      alert("Mission deployed to the network.");
    } catch (err: any) {
      alert("Mission creation failed: " + err.message);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardForm.title || rewardForm.cost <= 0) return;

    try {
      const { error } = await supabase!
        .from('rewards')
        .insert([{
          title: rewardForm.title,
          cost: rewardForm.cost,
          code: rewardForm.code
        }]);

      if (error) throw error;
      setRewardForm({ title: '', cost: 0, code: '' });
      await fetchAllData();
      alert("Reward asset added to vault.");
    } catch (err: any) {
      alert("Reward creation failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#ff00ff]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-mono uppercase tracking-[0.6em] text-white animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  const pendingCount = profiles.filter(p => p.card_status === 'pending').length;
  const filteredProfiles = profiles.filter(p => userFilter === 'all' || p.card_status === userFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-lexend selection:bg-[#ff00ff] selection:text-white">
      {/* Header */}
      <header className="h-24 border-b-4 border-white flex items-center justify-between px-10 bg-[#1a1a1a] sticky top-0 z-[100] shadow-[0_4px_0_0_#ffffff]">
        <div className="flex items-center space-x-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#ff00ff] border-4 border-white flex items-center justify-center font-black italic text-2xl shadow-[4px_4px_0_0_#ffffff]">R</div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-black uppercase tracking-tighter italic">Studio Terminal</h1>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#39ff14]">Level: Super Admin</p>
            </div>
          </div>

          <nav className="flex items-center space-x-2 bg-black/40 p-1.5 border-2 border-white/20">
            {[
              { id: 'users', label: 'Users', icon: <Users size={16}/> },
              { id: 'missions', label: 'Missions', icon: <Target size={16}/> },
              { id: 'rewards', label: 'Vault', icon: <Ticket size={16}/> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-3 font-black uppercase text-[10px] tracking-widest flex items-center space-x-3 transition-all border-2 ${activeTab === tab.id ? 'bg-[#ff00ff] text-white border-white shadow-[4px_4px_0_0_#ffffff] translate-x-[-2px] translate-y-[-2px]' : 'border-transparent text-white/40 hover:text-white'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <button 
          onClick={onLogout} 
          className="flex items-center space-x-3 bg-white text-black px-6 py-3 border-4 border-black hover:bg-rose-500 hover:text-white hover:border-white transition-all font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0_0_rgba(255,0,255,1)]"
        >
          <span>Disconnect</span>
          <LogOut size={16} strokeWidth={3} />
        </button>
      </header>

      <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full space-y-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: "Total Agents", value: profiles.length, color: "bg-white", textColor: "text-black", icon: <Users /> },
            { label: "Pending Auth", value: pendingCount, color: "bg-[#ffde59]", textColor: "text-black", icon: <ShieldCheck />, alert: pendingCount > 0 },
            { label: "Active Nodes", value: missions.length, color: "bg-[#ff00ff]", textColor: "text-white", icon: <Zap /> }
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} ${stat.textColor} border-4 border-white p-8 shadow-[8px_8px_0_0_#ffffff] relative overflow-hidden group`}>
              {stat.alert && <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-mono text-[10px] border-l-4 border-b-4 border-white animate-pulse">ACTION_REQUIRED</div>}
              <div className="flex justify-between items-start mb-6">
                <p className="font-black uppercase text-[11px] tracking-[0.3em] italic">{stat.label}</p>
                <div className="opacity-40 group-hover:scale-110 transition-transform">{stat.icon}</div>
              </div>
              <p className="text-6xl font-black font-mono tracking-tighter">{stat.value.toString().padStart(2, '0')}</p>
            </div>
          ))}
        </div>

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Agent Database</h2>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Profiles logged in system: {profiles.length}</p>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#1a1a1a] p-1.5 border-4 border-white shadow-[4px_4px_0_0_#ffffff]">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setUserFilter(f as any)}
                    className={`px-5 py-2 font-black uppercase text-[9px] tracking-widest transition-all ${userFilter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border-4 border-white shadow-[12px_12px_0_0_#ff00ff] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-black border-b-4 border-black">
                    <th className="p-6 font-black uppercase text-[10px] tracking-[0.3em]">Identity Node</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-[0.3em]">Niche</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-[0.3em] text-center">Status</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-[0.3em]">Balance</th>
                    <th className="p-6 font-black uppercase text-[10px] tracking-[0.3em] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-white/10">
                  {filteredProfiles.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-[#ffde59] border-2 border-white flex items-center justify-center text-black font-black shadow-[3px_3px_0_0_#ffffff]">
                            {user.display_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="font-black text-lg uppercase italic tracking-tight group-hover:text-[#ff00ff] transition-colors">{user.display_name || 'Anonymous'}</p>
                            <p className="text-[10px] text-white/30 font-mono tracking-widest">{user.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="bg-black text-white px-4 py-1.5 border-2 border-white/20 text-[10px] font-black uppercase italic">
                          {user.niche || 'N/A'}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border-2 ${
                          user.card_status === 'approved' ? 'bg-[#39ff14] text-black border-black' :
                          user.card_status === 'pending' ? 'bg-[#ffde59] text-black border-black animate-pulse' :
                          user.card_status === 'rejected' ? 'bg-rose-600 text-white border-white' :
                          'bg-white/10 text-white/40 border-white/20'
                        }`}>
                          {user.card_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6">
                         <div className="flex items-center space-x-2">
                           <span className="text-xl font-mono font-black text-[#ffde59]">{user.reelcoins}</span>
                           <span className="text-[9px] font-black uppercase text-white/30">RC</span>
                         </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end space-x-3">
                          {user.card_status !== 'approved' && (
                            <button 
                              onClick={() => handleUpdateUserStatus(user.firebase_uid, 'approved')}
                              disabled={isActioning === user.firebase_uid}
                              className="p-3 bg-[#39ff14] text-black border-2 border-black shadow-[3px_3px_0_0_#000000] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                            >
                              <UserCheck size={18} strokeWidth={3} />
                            </button>
                          )}
                          {user.card_status !== 'rejected' && (
                            <button 
                              onClick={() => handleUpdateUserStatus(user.firebase_uid, 'rejected')}
                              disabled={isActioning === user.firebase_uid}
                              className="p-3 bg-rose-600 text-white border-2 border-white shadow-[3px_3px_0_0_#000000] hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                            >
                              <UserMinus size={18} strokeWidth={3} />
                            </button>
                          )}
                          <button className="p-3 bg-white text-black border-2 border-black shadow-[3px_3px_0_0_#000000] hover:translate-y-[-2px] active:translate-y-[0px] transition-all">
                            <BarChart3 size={18} strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-white/20 font-mono uppercase tracking-[0.4em]">No records found in current node</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white text-black border-4 border-black p-10 shadow-[12px_12px_0_0_#ff00ff]">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 bg-black flex items-center justify-center text-white shadow-[4px_4px_0_0_#ff00ff]">
                    <Target size={24} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Deploy Mission</h2>
                </div>
                
                <form onSubmit={handleCreateMission} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Mission Title</label>
                    <input 
                      type="text" 
                      value={missionForm.title}
                      onChange={e => setMissionForm({...missionForm, title: e.target.value})}
                      className="w-full bg-white border-4 border-black p-4 text-sm font-black focus:outline-none focus:bg-slate-50 transition-colors"
                      placeholder="E.G. CABIN17A REEL PRODUCTION"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Objective Details</label>
                    <textarea 
                      rows={4}
                      value={missionForm.desc}
                      onChange={e => setMissionForm({...missionForm, desc: e.target.value})}
                      className="w-full bg-white border-4 border-black p-4 text-sm font-black focus:outline-none focus:bg-slate-50 transition-colors resize-none"
                      placeholder="DESCRIBE THE DELIVERABLES..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Reward (RC)</label>
                      <input 
                        type="number" 
                        value={missionForm.reward}
                        onChange={e => setMissionForm({...missionForm, reward: parseInt(e.target.value)})}
                        className="w-full bg-white border-4 border-black p-4 text-sm font-mono font-black focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Node Assignment</label>
                      <select 
                        value={missionForm.assignTo}
                        onChange={e => setMissionForm({...missionForm, assignTo: e.target.value})}
                        className="w-full bg-white border-4 border-black p-4 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none"
                      >
                        <option value="all">ALL USERS</option>
                        {profiles.filter(p => p.card_status === 'approved').map(p => (
                          <option key={p.id} value={p.firebase_uid}>{p.display_name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#ff00ff] text-white py-6 border-4 border-black shadow-[8px_8px_0_0_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-4px] active:translate-y-[0px] transition-all"
                  >
                    Execute Protocol
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Live Deployments</h3>
                <span className="bg-[#39ff14] text-black px-4 py-1.5 border-2 border-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0_0_#ffffff]">Total: {missions.length}</span>
              </div>
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/20">
                {missions.map(m => (
                  <div key={m.id} className="bg-[#1a1a1a] border-4 border-white p-8 shadow-[8px_8px_0_0_#ffffff] group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[#ff00ff] font-mono text-[9px] uppercase tracking-[0.3em] mb-2">UID: MISSION-{m.id}</p>
                        <h4 className="text-2xl font-black uppercase italic tracking-tight">{m.title}</h4>
                      </div>
                      <div className="bg-white text-black px-5 py-3 border-2 border-black font-black shadow-[4px_4px_0_0_#ff00ff]">
                        +{m.reward_amount} RC
                      </div>
                    </div>
                    <p className="text-white/60 text-sm font-medium leading-relaxed max-w-xl uppercase tracking-tight mb-8">
                      {m.description}
                    </p>
                    <div className="flex items-center justify-between border-t-2 border-white/10 pt-6">
                      <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Assigned:</span>
                         <span className="bg-[#ffde59] text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black">
                           {m.assigned_to === 'all' ? 'Global Grid' : 'Specific Agent'}
                         </span>
                      </div>
                      <button className="text-[#39ff14] font-black uppercase text-[10px] tracking-widest flex items-center space-x-2 hover:translate-x-2 transition-transform">
                        <span>View Metrics</span>
                        <ChevronRight size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
                {missions.length === 0 && (
                   <div className="p-20 text-center border-4 border-dashed border-white/10 opacity-30">
                     <p className="text-xs font-mono uppercase tracking-[0.5em]">Scanning for active deployments...</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white text-black border-4 border-black p-10 shadow-[12px_12px_0_0_#39ff14]">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-12 bg-black flex items-center justify-center text-white shadow-[4px_4px_0_0_#39ff14]">
                    <Ticket size={24} strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Vault Asset</h2>
                </div>
                
                <form onSubmit={handleCreateReward} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Asset Title</label>
                    <input 
                      type="text" 
                      value={rewardForm.title}
                      onChange={e => setRewardForm({...rewardForm, title: e.target.value})}
                      className="w-full bg-white border-4 border-black p-4 text-sm font-black focus:outline-none"
                      placeholder="E.G. STARBUCKS EXCLUSIVE VOUCHER"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Cost (RC)</label>
                      <input 
                        type="number" 
                        value={rewardForm.cost}
                        onChange={e => setRewardForm({...rewardForm, cost: parseInt(e.target.value)})}
                        className="w-full bg-white border-4 border-black p-4 text-sm font-mono font-black focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Redemption Code</label>
                      <input 
                        type="text" 
                        value={rewardForm.code}
                        onChange={e => setRewardForm({...rewardForm, code: e.target.value})}
                        className="w-full bg-white border-4 border-black p-4 text-sm font-mono font-black focus:outline-none uppercase"
                        placeholder="RW-XXXX"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#39ff14] text-black py-6 border-4 border-black shadow-[8px_8px_0_0_#000000] font-black uppercase tracking-[0.4em] text-xs hover:translate-y-[-4px] active:translate-y-[0px] transition-all"
                  >
                    Lock into Vault
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Vault Inventory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {rewards.map(r => (
                  <div key={r.id} className="bg-[#1a1a1a] border-4 border-white p-8 shadow-[8px_8px_0_0_#39ff14] flex flex-col justify-between group">
                    <div>
                      <div className="w-12 h-12 bg-white text-black border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#39ff14] group-hover:rotate-12 transition-transform">
                        <Ticket size={24} strokeWidth={3} />
                      </div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tight mb-2">{r.title}</h4>
                      <p className="text-[#39ff14] font-mono text-xl font-black tracking-tighter">{r.cost} RC</p>
                    </div>
                    <div className="mt-8 pt-6 border-t-2 border-white/10 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Secure Code</p>
                        <code className="text-xs font-mono font-black bg-white/5 px-2 py-1 border border-white/20 uppercase">{r.code}</code>
                      </div>
                      <button className="text-rose-500 hover:text-rose-400 transition-colors">
                        <XCircle size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ))}
                {rewards.length === 0 && (
                   <div className="col-span-2 p-20 text-center border-4 border-dashed border-white/10 opacity-30">
                     <p className="text-xs font-mono uppercase tracking-[0.5em]">Vault is currently empty...</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t-4 border-white p-10 text-center bg-[#1a1a1a]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.6em] text-white/30 italic">
            REELYWOOD STUDIO • SECURE COMMAND CENTER • AUTH_STABLE_4.5.0
          </p>
          <div className="flex items-center space-x-12 opacity-30 text-[10px] font-black uppercase tracking-widest">
             <div className="flex items-center space-x-3">
               <ShieldCheck size={14} className="text-[#39ff14]" />
               <span>Encryption Active</span>
             </div>
             <div className="flex items-center space-x-3">
               <Activity size={14} className="text-[#ff00ff]" />
               <span>Grid Latency: 42ms</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};