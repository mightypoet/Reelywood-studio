import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  Users, Layout, ShieldCheck, Check, X, 
  ExternalLink, Bell, CreditCard, LogOut, 
  Terminal, RefreshCw, Loader2, Building2,
  Target, FileText, Plus, Moon, Sun, Trash2
} from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

interface AdminDashboardProps {
  onLogout: () => void;
}

const ADMIN_EMAILS = ['calcutta16store@gmail.com', 'rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'console' | 'alliance' | 'users' | 'ledger'>('incoming');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // --- 1. ROBUST FETCH LOGIC ---
  const fetchAllData = async () => {
    if (!supabase) return;
    setLoading(true);
    
    try {
      const [submissionsRes, usersRes] = await Promise.all([
        supabase
          .from('submissions')
          .select(`
            *,
            profiles!user_id ( display_name, handle, photo_url, email ),
            missions!mission_id ( title, reward_amount, checkpoints )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (submissionsRes.error) throw submissionsRes.error;
      setSubmissions(submissionsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      alert("Terminal Sync Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      onLogout();
    }
    fetchAllData();
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-black'} font-lexend pb-20 transition-colors duration-500`}>
      
      {/* HEADER */}
      <header className={`border-b-4 ${darkMode ? 'border-white bg-[#111]' : 'border-black bg-white'} px-8 py-6 flex items-center justify-between sticky top-0 z-[100] backdrop-blur-md bg-opacity-80`}>
        <div className="flex items-center space-x-6">
          <div className="bg-[#834bf1] w-12 h-12 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Terminal size={24} strokeWidth={3} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Terminal <span className="opacity-40">Admin</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={fetchAllData} className="p-3 border-4 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} strokeWidth={3} />
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-3 border-4 border-black ${darkMode ? 'bg-[#ffde59] text-black' : 'bg-black text-white'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all`}>
            {darkMode ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
          </button>
          <button onClick={() => { auth.signOut(); onLogout(); }} className="flex items-center space-x-2 bg-black text-white px-6 py-3 border-4 border-white font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#ff00ff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
            <span>Exit</span> <LogOut size={16} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* TABS */}
      <nav className={`border-b-4 ${darkMode ? 'border-white bg-[#1a1a1a]' : 'border-black bg-white'} sticky top-[92px] z-[90]`}>
        <div className="max-w-[1600px] mx-auto flex overflow-x-auto no-scrollbar">
           {[
             { id: 'incoming', label: 'Incoming Signals', count: submissions.length, icon: Bell },
             { id: 'users', label: 'Agent Command', count: 0, icon: Users },
             { id: 'alliance', label: 'Alliance Nodes', count: 0, icon: Building2 },
             { id: 'console', label: 'Mission Console', count: 0, icon: Target },
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 min-w-[200px] py-6 font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                 activeTab === tab.id 
                 ? 'bg-[#834bf1] text-white' 
                 : 'hover:bg-black/5 opacity-40 hover:opacity-100'
               }`}
             >
                <tab.icon size={18} strokeWidth={3} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 border-2 border-white animate-pulse">
                    {tab.count}
                  </span>
                )}
             </button>
           ))}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-[1400px] mx-auto p-8 lg:p-12">
        
        {/* 1. INCOMING SIGNALS TAB */}
        {activeTab === 'incoming' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black italic uppercase font-display tracking-tighter">Verification Queue</h2>
              <div className="bg-[#ffde59] text-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black text-xs uppercase italic">
                {submissions.length} Signals Pending
              </div>
            </div>

            {loading && submissions.length === 0 ? (
               <div className="py-24 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#834bf1] mb-4" size={48} strokeWidth={3} />
                  <p className="font-black uppercase tracking-[0.4em] text-xs opacity-40">Scanning Operational Grid...</p>
               </div>
            ) : submissions.length === 0 ? (
               <div className={`border-4 border-dashed ${darkMode ? 'border-white/10' : 'border-gray-200'} p-24 text-center`}>
                  <ShieldCheck size={64} className="mx-auto mb-6 opacity-10" />
                  <p className="text-2xl font-black opacity-20 uppercase italic font-display">No Pending Activity</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-10 mt-4">Terminal Status: Standby</p>
               </div>
            ) : (
               <div className="grid gap-8">
                 {submissions.map((sub) => (
                   <div key={sub.id} className={`${darkMode ? 'bg-[#111] border-white' : 'bg-white border-black'} border-4 p-0 shadow-[12px_12px_0px_0px_#000] flex flex-col md:flex-row relative group hover:-translate-y-1 transition-all`}>
                      
                      {/* STATUS ACCENT */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffde59]"></div>

                      <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                         {/* AGENT IDENTITY */}
                         <div className="flex items-center gap-6 min-w-[280px]">
                            <div className="w-20 h-20 bg-[#834bf1] border-[3px] border-black shrink-0 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                               <img 
                                 src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.user_id}`} 
                                 alt="Agent" className="w-full h-full object-cover"
                               />
                            </div>
                            <div className="min-w-0">
                               <h3 className="font-black text-2xl uppercase italic tracking-tighter truncate leading-none mb-2">
                                 {sub.profiles?.display_name || "Unknown Agent"}
                               </h3>
                               <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest bg-[#834bf1]/10 px-2 py-1 inline-block border border-[#834bf1]/20">
                                 @{sub.profiles?.handle || "unlinked"}
                               </p>
                            </div>
                         </div>

                         {/* MISSION INTEL */}
                         <div className="flex-1 space-y-4">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] mb-1">Assigned Mission</span>
                               <h4 className="text-xl font-black italic uppercase font-display leading-tight">{sub.missions?.title}</h4>
                            </div>
                            
                            {/* EVIDENCE LINK */}
                            <div className={`flex items-center justify-between gap-6 ${darkMode ? 'bg-white/5' : 'bg-gray-100'} p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]`}>
                               <div className="min-w-0 flex-1">
                                  <p className="text-[8px] font-black uppercase opacity-40 mb-1">Proof Deliverable</p>
                                  <a href={sub.link} target="_blank" rel="noreferrer" className="text-blue-500 font-bold underline truncate block text-sm italic hover:text-[#834bf1]">
                                     {sub.link}
                                  </a>
                                </div>
                                <a href={sub.link} target="_blank" rel="noreferrer" className="bg-[#ffde59] text-black border-2 border-black p-2 hover:shadow-[2px_2px_0px_0px_#000] active:scale-95 transition-all">
                                   <ExternalLink size={18} strokeWidth={3}/>
                                </a>
                            </div>
                         </div>

                         {/* BOUNTY & ACTION */}
                         <div className="flex flex-col items-center gap-4 min-w-[200px]">
                            <div className="bg-black text-[#ffde59] px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#834bf1] text-center w-full">
                               <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-1 opacity-50">Bounty</p>
                               <p className="text-3xl font-black italic tracking-tighter">+{sub.missions?.reward_amount} RC</p>
                            </div>

                            <button 
                               onClick={() => setSelectedSubmission(sub)}
                               className="w-full bg-[#4ade80] text-black px-8 py-5 border-[4px] border-black font-black uppercase text-xs tracking-[0.2em] shadow-[6px_6px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                               <ShieldCheck size={18} strokeWidth={3}/> Verify Signal
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {/* 2. USER COMMAND TAB */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-4xl font-black italic uppercase font-display tracking-tighter">Agent Command</h2>
             <div className={`${darkMode ? 'bg-[#111]' : 'bg-white'} border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-x-auto`}>
               <table className="w-full text-left">
                  <thead className="bg-black text-white border-b-4 border-black">
                     <tr>
                        <th className="p-6 uppercase text-[10px] font-black tracking-widest">Agent Identity</th>
                        <th className="p-6 uppercase text-[10px] font-black tracking-widest">Network Stats</th>
                        <th className="p-6 uppercase text-[10px] font-black tracking-widest text-right">Access Level</th>
                     </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b-2 border-black/10 hover:bg-black/5 transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#ffde59] border-2 border-black flex items-center justify-center font-black text-black">{u.display_name?.charAt(0) || 'A'}</div>
                              <div>
                                <p className="font-black uppercase italic leading-none mb-1">{u.display_name}</p>
                                <p className="text-[10px] font-mono opacity-40">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-black uppercase tracking-widest text-[#834bf1]">{u.platform || 'OFFLINE'}</p>
                           <p className="text-[10px] font-bold opacity-40">F: {u.followers || 0} • {u.niche || 'General'}</p>
                        </td>
                        <td className="p-6 text-right">
                           <span className={`px-4 py-1.5 border-2 border-black font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] ${
                             u.card_status === 'approved' ? 'bg-[#4ade80] text-black' : 'bg-gray-200 text-black/40'
                           }`}>
                             {u.card_status === 'approved' ? 'Verified' : 'Access Denied'}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'alliance' && <BrandManager />}

        {activeTab === 'console' && (
           <div className="py-24 text-center border-4 border-dashed border-black/20 opacity-20">
              <h2 className="text-4xl font-black italic uppercase font-display">Mission Console Standby</h2>
              <p className="font-black uppercase tracking-[0.4em] mt-4">Module Integration in Progress</p>
           </div>
        )}

      </main>

      {/* MODAL RENDER */}
      {selectedSubmission && (
        <VerificationModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)}
          onRefresh={fetchAllData} 
        />
      )}
    </div>
  );
};