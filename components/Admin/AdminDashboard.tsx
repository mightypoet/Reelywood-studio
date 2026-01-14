import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/clients';
import { 
  Users, Zap, Gift, Trash2, Activity, Terminal, 
  Building2, ListChecks, X, Instagram, Send, 
  CheckSquare, Moon, Sun, Loader2, Search,
  MapPin, Check, Bell, Fingerprint, TrendingUp,
  MessageSquare, ShieldAlert, ArrowRight, LayoutDashboard,
  Database, RefreshCcw, MoreVertical, CheckCircle2
} from 'lucide-react';
import { BrandManager } from './BrandManager';
import { VerificationModal } from './VerificationModal';

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

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'queue' | 'deploy' | 'agents' | 'brands'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Core Data State
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  
  // Selection/Detail State
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [inspectedAgent, setInspectedAgent] = useState<Profile | null>(null);

  useEffect(() => {
    fetchAllData();
    // Real-time Simulation: Auto-refresh every 10 seconds for metrics
    const pollId = window.setInterval(fetchAllData, 10000); 
    return () => clearInterval(pollId);
  }, []);

  const fetchAllData = async () => {
    if (!supabase) return;
    try {
      const [uRes, mRes, vRes, bRes, sRes, uvRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('missions').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('vouchers').select('*, partner_brands(*)').order('created_at', { ascending: false }),
        supabase.from('partner_brands').select('*').order('name', { ascending: true }),
        supabase.from('submissions').select('*, profiles(display_name), missions(*)').order('created_at', { ascending: false }),
        supabase.from('user_vouchers').select('*')
      ]);

      if (uRes.data) setUsers(uRes.data);
      if (mRes.data) setMissions(mRes.data);
      if (vRes.data) setVouchers(vRes.data);
      if (bRes.data) setBrands(bRes.data);
      if (sRes.data) setSubmissions(sRes.data);
      if (uvRes.data) setUserVouchers(uvRes.data);

    } catch (e) { 
      console.error("TERMINAL_FETCH_ERROR:", e); 
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleExecuteDeploy = async () => {
    if (!supabase || !selectedProtocol) return;
    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      const { error } = await supabase.from(table).update({ 
        assigned_to: selectedCreatorIds,
        status: 'active' 
      }).eq('id', selectedProtocol.id);
      if (error) throw error;
      showToast('success', `DEPLOYMENT SUCCESSFUL: ${selectedCreatorIds.length || 'GLOBAL'}`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  // Metrics Tickers
  const liveStats = useMemo(() => ({
    activeAgents: users.length,
    pendingMissions: submissions.filter(s => s.status === 'pending').length,
    vaultLiability: users.reduce((acc, u) => acc + (u.reelcoins || 0), 0),
    campaignYield: brands.length
  }), [users, submissions, brands]);

  const bg = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-black';
  const card = darkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = darkMode ? 'border-white' : 'border-black';

  return (
    <div className={`min-h-screen ${bg} ${text} font-mono pb-24 md:pb-0`}>
      {/* Real-time Toast System */}
      {notify && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-6 py-4 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : notify.type === 'error' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'}`}>
            <Terminal size={18} />
            <span className="font-black text-xs uppercase tracking-widest">{notify.msg}</span>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchAllData} />
      )}

      {/* TOP HEADER - Mobile Optimized */}
      <header className={`border-b-4 ${border} ${card} px-6 py-4 flex justify-between items-center sticky top-0 z-[100]`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#ffde59] border-2 border-white flex items-center justify-center shadow-[3px_3px_0px_0px_#834bf1]">
            <Fingerprint size={24} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter leading-none italic">RW_TERMINAL</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none">NODE_01_LIVE</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'} active:scale-90 transition-all shadow-[2px_2px_0px_0px_#000]`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-2 text-[10px] font-black uppercase border-2 border-black active:scale-90 shadow-[3px_3px_0px_0px_#000]">Exit</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* VIEW: HOME / GOD MODE HUD */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: 'ACTIVE AGENTS', v: liveStats.activeAgents, i: Users, c: 'text-[#834bf1]' },
                { l: 'REVIEW QUEUE', v: liveStats.pendingMissions, i: Activity, c: 'text-rose-500' },
                { l: 'VAULT LIABLTY', v: liveStats.vaultLiability, i: Database, c: 'text-emerald-500' },
                { l: 'ALLIANCE NODES', v: liveStats.campaignYield, i: Building2, c: 'text-[#ffde59]' }
              ].map((s, i) => (
                <div key={i} className={`${card} border-[3px] ${border} p-5 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between h-32`}>
                  <p className="text-[8px] font-black uppercase opacity-40 tracking-[0.2em]">{s.l}</p>
                  <div className="flex justify-between items-end">
                    <h3 className={`text-3xl font-black italic tracking-tighter ${s.c}`}>{s.v.toLocaleString()}</h3>
                    <s.i size={20} className="opacity-20" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-l-4 border-[#ffde59] pl-4">
                <h3 className="text-xs font-black uppercase italic">System Critical Alerts</h3>
                <Bell size={14} className="opacity-20" />
              </div>
              <div className="bg-rose-500/10 border-2 border-rose-500 p-4 flex gap-4 items-start">
                <ShieldAlert className="text-rose-500 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase text-rose-500">Node Congestion</p>
                  <p className="text-[9px] font-bold opacity-60 uppercase mt-1 leading-tight">User #842 flagged for suspicious engagement activity. Manual audit recommended.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase italic border-l-4 border-[#834bf1] pl-4">Recent Economy Logs</h3>
              <div className={`${card} border-[3px] ${border} divide-y-2 divide-black/5 max-h-64 overflow-y-auto`}>
                {submissions.slice(0, 5).map((s, i) => (
                  <div key={i} className="p-4 flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black italic border border-white">
                        {s.profiles?.display_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-black uppercase">{s.profiles?.display_name}</p>
                        <p className="opacity-40">{s.missions?.title}</p>
                      </div>
                    </div>
                    <span className="font-black text-emerald-500">+{s.missions?.reward_amount} RC</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: QUEUE / TASK VERIFICATION */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black italic uppercase font-display">Review Queue</h2>
              <div className="px-3 py-1 bg-black text-[#ffde59] text-[10px] font-black uppercase tracking-widest border border-white">
                Pending: {liveStats.pendingMissions}
              </div>
            </div>
            
            <div className="space-y-4">
              {submissions.filter(s => s.status === 'pending').map((sub) => (
                <div key={sub.id} className={`${card} border-[3px] ${border} p-6 shadow-[8px_8px_0px_0px_#000] relative group`}>
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-black text-lg uppercase italic font-display leading-none">{sub.profiles?.display_name}</h4>
                        <p className="text-[9px] font-bold text-[#834bf1] uppercase tracking-widest mt-1 italic">MISSION: {sub.missions?.title}</p>
                      </div>
                      <div className="bg-yellow-400 w-3 h-3 rounded-full animate-pulse border-2 border-black"></div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setSelectedSubmission(sub)} className="flex-1 bg-black text-[#39ff14] py-4 font-black text-[10px] uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_#834bf1] active:translate-y-1 active:shadow-none transition-all">Verify Evidence</button>
                     <button className="w-12 border-2 border-black flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><X size={20}/></button>
                   </div>
                </div>
              ))}
              {liveStats.pendingMissions === 0 && (
                <div className="py-32 text-center border-4 border-dashed border-black/10">
                   <p className="font-black uppercase text-xs tracking-[0.5em] opacity-20 italic">Grid Silent. No transmissions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: AGENTS / USER MONITORING */}
        {activeTab === 'agents' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input className={`w-full ${card} border-[3px] ${border} p-5 pl-12 font-bold text-xs uppercase tracking-widest outline-none focus:bg-[#ffde59] focus:text-black transition-all`} placeholder="Search Identity Node..." />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {users.map(u => (
                <div key={u.id} className={`${card} border-[3px] ${border} p-5 flex justify-between items-center group active:scale-[0.98] transition-all cursor-pointer`} onClick={() => setInspectedAgent(u)}>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black italic border-2 border-white shadow-[3px_3px_0px_0px_#834bf1]">
                        {u.display_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase italic truncate w-32">{u.display_name}</h4>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">@{u.handle || 'unlinked'}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-black italic text-emerald-500 leading-none">{u.reelcoins} RC</div>
                      <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] mt-1">LIQUID VAULT</p>
                   </div>
                   <MoreVertical size={16} className="opacity-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: DEPLOY / WAR ROOM */}
        {activeTab === 'deploy' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="bg-black text-white p-6 border-[4px] border-white shadow-[10px_10px_0px_0px_#834bf1]">
                <h2 className="text-2xl font-black italic uppercase font-display mb-2">Protocol Deployment</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">Precision targeting of creator nodes. Select nodes, verify protocol, and execute.</p>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Target Nodes: <span className="text-[#39ff14]">{selectedCreatorIds.length || 'ALL (GLOBAL)'}</span></p>
                   <button onClick={() => setSelectedCreatorIds(users.map(u => u.firebase_uid))} className="text-[9px] font-black uppercase text-[#834bf1] underline decoration-2">Link All Nodes</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-3">
                      <p className="text-[8px] font-black uppercase opacity-30">Missions</p>
                      {missions.filter(m => m.status === 'draft').map(m => (
                        <div key={m.id} onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                             className={`p-4 border-2 ${selectedProtocol?.id === m.id ? 'bg-[#834bf1] text-white border-white scale-105' : `${card} border-black/10`} cursor-pointer transition-all`}>
                          <p className="text-[10px] font-black uppercase truncate">{m.title}</p>
                          <p className="text-[8px] opacity-40 mt-1">{m.reward_amount} RC</p>
                        </div>
                      ))}
                   </div>
                   <div className="space-y-3">
                      <p className="text-[8px] font-black uppercase opacity-30">Vouchers</p>
                      {vouchers.filter(v => v.status === 'draft').map(v => (
                        <div key={v.id} onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                             className={`p-4 border-2 ${selectedProtocol?.id === v.id ? 'bg-[#ffde59] text-black border-black scale-105' : `${card} border-black/10`} cursor-pointer transition-all`}>
                          <p className="text-[10px] font-black uppercase truncate">{v.title}</p>
                          <p className="text-[8px] opacity-40 mt-1">{v.cost} RC</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <button onClick={handleExecuteDeploy} disabled={submitting || !selectedProtocol}
                className="w-full py-6 bg-[#39ff14] text-black border-[4px] border-black font-black uppercase text-xs italic shadow-[8px_8px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-30 disabled:grayscale">
                {submitting ? 'EXECUTING...' : 'EXECUTE GLOBAL BROADCAST'}
             </button>
          </div>
        )}

        {activeTab === 'brands' && <BrandManager />}

      </main>

      {/* MOBILE BOTTOM NAVIGATION - Thumb Optimized */}
      <nav className={`fixed bottom-0 left-0 right-0 ${card} border-t-4 ${border} z-[150] px-4 py-3 flex justify-around items-center md:hidden`}>
        {[
          { id: 'home', icon: LayoutDashboard, label: 'HUB' },
          { id: 'queue', icon: ListChecks, label: 'QUEUE' },
          { id: 'deploy', icon: Send, label: 'WAR' },
          { id: 'agents', icon: Users, label: 'AGENTS' },
          { id: 'brands', icon: Building2, label: 'BRANDS' },
        ].map(nav => (
          <button 
            key={nav.id}
            onClick={() => setActiveTab(nav.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === nav.id ? 'text-[#834bf1] scale-110' : 'opacity-30'}`}
          >
            <nav.icon size={20} strokeWidth={activeTab === nav.id ? 3 : 2} />
            <span className="text-[7px] font-black uppercase tracking-widest">{nav.label}</span>
          </button>
        ))}
      </nav>

      {/* AGENT INSPECTION DRAWER - Mobile Experience */}
      {inspectedAgent && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setInspectedAgent(null)}></div>
           <div className={`relative w-full max-w-lg bg-white text-black border-[6px] border-black shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-8 animate-in slide-in-from-bottom-10 duration-500`}>
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-2xl italic border-2 border-black shadow-[4px_4px_0px_0px_#834bf1]">
                      {inspectedAgent.display_name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase italic font-display leading-none">{inspectedAgent.display_name}</h3>
                      <p className="text-xs font-bold opacity-40 uppercase tracking-[0.2em] mt-1 italic">{inspectedAgent.email}</p>
                    </div>
                 </div>
                 <button onClick={() => setInspectedAgent(null)} className="p-2 bg-slate-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-emerald-50 border-[3px] border-emerald-500 p-5 shadow-[4px_4px_0px_0px_#000]">
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Liquid Vault</p>
                    <p className="text-2xl font-black italic text-emerald-600 font-display leading-none">{inspectedAgent.reelcoins} RC</p>
                 </div>
                 <div className="bg-blue-50 border-[3px] border-blue-500 p-5 shadow-[4px_4px_0px_0px_#000]">
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Performance</p>
                    <p className="text-2xl font-black italic text-blue-600 font-display leading-none">94%</p>
                 </div>
              </div>

              <div className="space-y-3 mb-10">
                 <button className="w-full bg-[#834bf1] text-white py-5 font-black uppercase text-xs tracking-widest border-[4px] border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center gap-3">
                    <MessageSquare size={18} /> Sync Direct Message
                 </button>
                 <button className="w-full bg-black text-white py-4 font-black uppercase text-[10px] tracking-widest border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                    Audit Identity History
                 </button>
                 <button className="w-full bg-rose-500 text-white py-4 font-black uppercase text-[10px] tracking-widest border-[4px] border-black shadow-[4px_4px_0px_0px_#000]">
                    Sever Node Link (Ban)
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};