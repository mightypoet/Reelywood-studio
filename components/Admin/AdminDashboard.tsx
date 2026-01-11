
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Zap, Gift, LogOut, Search, 
  Check, X, Shield, Plus, Moon, Sun, Trash2,
  Loader2, Activity, Terminal,
  Target, FileText,
  Clock, Bell, Megaphone, Info,
  Building2, Image as ImageIcon, MapPin, ListChecks, ExternalLink
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
  handle?: string;
  photo_url?: string;
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
        supabase.from('submissions').select(`
          *,
          profiles!user_id ( display_name, handle, photo_url, email ),
          missions!mission_id ( title, reward_amount, checkpoints )
        `).eq('status', 'pending').order('created_at', { ascending: false })
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

  const handleApprove = async (sub: any) => {
    if(!window.confirm(`Authorize reward of ${sub.missions.reward_amount} RC for this agent?`)) return;
    setSubmitting(true);
    try {
      const { error } = await supabase!.rpc('grant_mission_reward', {
        submission_id_param: sub.id,
        user_id_param: sub.user_id,
        amount_param: sub.missions.reward_amount
      });
      if (error) throw error;
      alert("✅ APPROVED: Bounty transferred.");
      fetchAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (sub: any) => {
    const reason = prompt("Enter Rejection Reason (Required):");
    if (!reason) return;
    setSubmitting(true);
    try {
      const { error } = await supabase!.rpc('reject_submission', {
        submission_id_param: sub.id,
        user_id_param: sub.user_id,
        reason_param: reason
      });
      if (error) throw error;
      alert("❌ REJECTED: Agent informed.");
      fetchAllData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
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
      <header className={`border-b-4 ${borderColor} ${cardColor} px-8 py-6 flex items-center justify-between sticky top-0 z-[100] backdrop-blur-md bg-opacity-80`}>
        <div className="flex items-center space-x-6">
          <div className={`${primaryAccent} w-12 h-12 flex items-center justify-center border-4 ${borderColor} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <Terminal size={24} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 border-4 ${borderColor} ${isDark ? 'bg-[#ffde59] text-black' : 'bg-black text-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            {isDark ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          <button onClick={() => { auth.signOut(); onLogout(); }} className={`flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 ${isDark ? 'border-white' : 'border-black'} font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            <span>Exit</span> <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-12">
        <div className={`flex border-4 ${borderColor} p-1.5 ${cardColor} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
          {[
            { id: 'users', label: 'Command', icon: <Users size={18}/> },
            { id: 'submissions', label: 'Incoming', icon: <ListChecks size={18}/> },
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

        <div className="animate-in fade-in duration-500">
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
                             <button onClick={() => handleUpdateStatus(user.firebase_uid, 'rejected')} className="px-4 py-2 border-2 border-black bg-gray-200 hover:bg-rose-500 hover:text-white font-black text-[10px] shadow-[2px_2px_0px_0px_#000] transition-all uppercase">Reject</button>
                             <button onClick={() => handleUpdateStatus(user.firebase_uid, 'approved')} className={`px-4 py-2 border-2 border-black ${user.card_status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-emerald-400 text-black hover:bg-emerald-500'} font-black text-[10px] shadow-[2px_2px_0px_0px_#000] transition-all uppercase flex items-center gap-2`}>{user.card_status === 'approved' ? <Check size={14}/> : <Plus size={14}/>} {user.card_status === 'approved' ? 'Verified' : 'Approve'}</button>
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
            <div className="bg-slate-50 dark:bg-black/20 p-8 border-4 border-black mt-12">
              <h2 className="text-4xl font-black italic uppercase mb-8 flex items-center gap-4 font-display">
                <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
                📡 INCOMING SIGNALS ({submissions.length})
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {submissions.length === 0 ? (
                  <div className="text-gray-400 font-bold text-center py-20 border-4 border-dashed border-gray-300 uppercase tracking-widest bg-white">
                    NO PENDING ACTIVITY. THE NETWORK IS QUIET.
                  </div>
                ) : (
                  submissions.map((item) => (
                    <div key={item.id} className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                      
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#ffde59]"></div>

                      {/* 1. AGENT IDENTITY */}
                      <div className="min-w-[250px] border-b-2 md:border-b-0 md:border-r-2 border-gray-100 pb-6 md:pb-0 md:pr-8">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-[#834bf1] border-2 border-black flex items-center justify-center text-white font-black">
                              {item.profiles?.display_name?.charAt(0) || "A"}
                           </div>
                           <div>
                              <h4 className="font-black text-xl uppercase italic leading-none">{item.profiles?.display_name || "Unknown Agent"}</h4>
                              <p className="text-[10px] font-bold text-[#834bf1] mt-1 tracking-widest uppercase">@{item.profiles?.handle || "unlinked"}</p>
                           </div>
                        </div>
                        <div className="mt-4 inline-block bg-black text-[#ffde59] text-[9px] font-black px-3 py-1.5 uppercase tracking-widest italic">
                           Waiting for Authorization
                        </div>
                      </div>

                      {/* 2. MISSION INTEL */}
                      <div className="flex-1 space-y-4">
                         <div className="flex flex-col">
                            <span className="font-black text-[#834bf1] text-[10px] uppercase tracking-widest mb-1">Assigned Mission</span>
                            <h3 className="font-black italic text-2xl uppercase tracking-tighter text-black font-display">{item.missions?.title}</h3>
                         </div>
                         
                         <div className="bg-slate-50 p-4 border-[3px] border-black flex items-center justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="min-w-0">
                               <p className="text-[8px] font-black uppercase text-black/40 mb-1 tracking-widest">Evidence Deliverable</p>
                               <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline truncate block text-sm italic">
                                  {item.link}
                               </a>
                            </div>
                            <a href={item.link} target="_blank" rel="noreferrer" className="bg-[#ffde59] border-2 border-black p-3 hover:shadow-[2px_2px_0px_0px_#000] active:scale-95 transition-all shrink-0">
                               <ExternalLink size={20} strokeWidth={3} />
                            </a>
                         </div>
                      </div>

                      {/* 3. CONTROL CONSOLE */}
                      <div className="flex flex-col gap-3 min-w-[180px] justify-center">
                         <button 
                           onClick={() => handleApprove(item)}
                           disabled={submitting}
                           className="bg-[#4ade80] text-black border-[3px] border-black py-4 font-black uppercase text-xs tracking-widest hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                         >
                           <Check size={18} strokeWidth={4} /> AUTHORIZE
                         </button>
                         <button 
                           onClick={() => handleReject(item)}
                           disabled={submitting}
                           className="bg-rose-500 text-white border-[3px] border-black py-4 font-black uppercase text-xs tracking-widest hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                         >
                           <X size={18} strokeWidth={4} /> TERMINATE
                         </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'brands' && <BrandManager />}
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
