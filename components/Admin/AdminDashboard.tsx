import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { 
  Users, Zap, Gift, Trash2,
  Activity, Terminal,
  Building2, ListChecks, X,
  Instagram, Send, CheckSquare, 
  Moon, Sun, Loader2, Search,
  MapPin, Check
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
  const [activeTab, setActiveTab] = useState<'deploy' | 'missions' | 'vouchers' | 'users' | 'ledger' | 'brands' | 'submissions'>('deploy');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [notify, setNotify] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Core Data State
  const [users, setUsers] = useState<Profile[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]); // Target vouchers table
  const [brands, setBrands] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userVouchers, setUserVouchers] = useState<any[]>([]);
  
  // Selection State
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<{id: string, type: 'mission' | 'voucher'} | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Forms
  const [missionForm, setMissionForm] = useState({ 
    title: '', reward: '', brand_id: '', expires_at: '', description: ''
  });
  
  const [voucherForm, setVoucherForm] = useState({ 
    title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' 
  });

  useEffect(() => {
    fetchAllData();
    const pollId = window.setInterval(fetchAllData, 8000); 
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

  const showToast = (type: 'success' | 'error', msg: string) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleExecuteDeploy = async () => {
    if (!supabase || !selectedProtocol) return;
    
    setSubmitting(true);
    try {
      const table = selectedProtocol.type === 'mission' ? 'missions' : 'vouchers';
      
      // Update the assigned_to array in the selected protocol
      const { error } = await supabase
        .from(table)
        .update({ 
          assigned_to: selectedCreatorIds,
          status: 'active' 
        })
        .eq('id', selectedProtocol.id);

      if (error) throw error;
      
      showToast('success', `${selectedProtocol.type.toUpperCase()} DEPLOYED TO ${selectedCreatorIds.length || 'ALL'} NODES`);
      setSelectedCreatorIds([]);
      setSelectedProtocol(null);
      fetchAllData();
    } catch (e: any) { 
      showToast('error', e.message); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !missionForm.brand_id) return alert("Select an Alliance Node first.");
    setSubmitting(true);
    try {
      const { error } = await supabase.from('missions').insert([{
        title: missionForm.title,
        reward_amount: parseInt(missionForm.reward),
        brand_id: missionForm.brand_id,
        description: missionForm.description,
        assigned_to: ['DRAFT'],
        status: 'draft',
        expires_at: missionForm.expires_at ? new Date(missionForm.expires_at).toISOString() : null
      }]);
      if (error) throw error;
      showToast('success', "MISSION ARCHIVED AS DRAFT");
      setMissionForm({ title: '', reward: '', brand_id: '', expires_at: '', description: '' });
      fetchAllData();
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !voucherForm.brand_id) return alert("Select an Alliance Node first.");
    setSubmitting(true);
    try {
      const { error } = await supabase.from('vouchers').insert([{
        brand_id: voucherForm.brand_id,
        title: voucherForm.title,
        cost: parseInt(voucherForm.cost) || 0,
        description: voucherForm.description,
        expires_at: voucherForm.expires_at ? new Date(voucherForm.expires_at).toISOString() : null,
        status: 'draft',
        assigned_to: ['DRAFT'],
        code: voucherForm.code || 'REEL-' + Math.random().toString(36).substr(2, 6).toUpperCase()
      }]);
      if (error) throw error;
      showToast('success', "VOUCHER ARCHIVED AS DRAFT");
      setVoucherForm({ title: '', cost: '', brand_id: '', code: '', description: '', expires_at: '' });
      fetchAllData(); 
    } catch (e: any) { showToast('error', e.message); }
    finally { setSubmitting(false); }
  };

  const handlePurge = async (id: string, type: 'mission' | 'voucher') => {
    if (!supabase || !confirm(`PURGE ${type.toUpperCase()}?`)) return;
    const table = type === 'mission' ? 'missions' : 'vouchers';
    await supabase.from(table).delete().eq('id', id);
    fetchAllData();
  };

  const getDetailedAgentStats = (uid: string) => {
    const approvedSubs = submissions.filter(s => s.user_id === uid && (s.status === 'approved' || s.status === 'completed'));
    const assignedMissions = missions.filter(m => Array.isArray(m.assigned_to) && m.assigned_to.includes(uid));
    const redeemed = userVouchers.filter(uv => uv.user_uid === uid).length;
    return { completed: approvedSubs.length, active: assignedMissions.length, redeemedCount: redeemed };
  };

  const bg = darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const text = darkMode ? 'text-white' : 'text-black';
  const card = darkMode ? 'bg-[#1a1a1a]' : 'bg-white';
  const border = darkMode ? 'border-white' : 'border-black';

  return (
    <div className={`min-h-screen ${bg} ${text} font-mono pb-10`}>
      {notify && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-4 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] ${notify.type === 'success' ? 'bg-[#39ff14] text-black' : 'bg-rose-500 text-white'}`}>
            <span className="font-black text-[10px] uppercase">{notify.msg}</span>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchAllData} />
      )}

      <header className={`border-b-4 ${border} ${card} px-4 py-3 flex justify-between items-center sticky top-0 z-50`}>
        <div className="flex items-center gap-2"><Terminal size={18}/><h1 className="text-sm font-black italic uppercase font-display tracking-tighter leading-none">Terminal <span className="opacity-40 text-[10px] not-italic ml-2">v2.1 Master</span></h1></div>
        <div className="flex gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className={`p-2 border-2 ${border} ${darkMode ? 'bg-yellow-400 text-black' : 'bg-black text-white'} active:scale-90 transition-all`}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={onLogout} className="bg-rose-600 text-white px-4 py-1 text-[10px] font-black uppercase border-2 border-black active:scale-90 shadow-[2px_2px_0px_0px_#000]">Exit</button>
        </div>
      </header>

      {/* Deployment War Room */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-2 space-y-2">
          {[
            { id: 'deploy', label: 'WAR ROOM', icon: Send },
            { id: 'missions', label: 'MISSIONS', icon: Zap },
            { id: 'vouchers', label: 'VOUCHERS', icon: Gift },
            { id: 'users', label: 'AGENTS', icon: Users },
            { id: 'submissions', label: 'QUEUE', icon: ListChecks },
            { id: 'brands', label: 'BRANDS', icon: Building2 },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 ${border} font-black text-[10px] uppercase transition-all shadow-[2px_2px_0px_0px_#000] ${activeTab === t.id ? 'bg-[#834bf1] text-white translate-x-1 translate-y-1 shadow-none' : `${card}`}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Main Console */}
        <div className={`lg:col-span-10 border-[4px] ${border} ${card} p-6 shadow-[8px_8px_0px_0px_#000]`}>
          
          {activeTab === 'deploy' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Creator Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black text-white p-3 border-2 border-white">
                  <h3 className="text-xs font-black uppercase italic">Creator Intelligence</h3>
                  <span className="text-[10px] bg-blue-600 px-2 border border-white">SEL: {selectedCreatorIds.length}</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto border-2 border-black bg-white text-black">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-[8px] font-black uppercase sticky top-0">
                      <tr><th className="p-2 w-10">SEL</th><th className="p-2">Agent</th><th className="p-2">Stats</th></tr>
                    </thead>
                    <tbody className="text-[10px] font-bold">
                      {users.map(u => (
                        <tr key={u.id} onClick={() => setSelectedCreatorIds(p => p.includes(u.firebase_uid) ? p.filter(id => id !== u.firebase_uid) : [...p, u.firebase_uid])}
                            className={`border-b cursor-pointer transition-colors ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <td className="p-2 text-center">
                            <div className={`w-4 h-4 mx-auto border-2 border-black ${selectedCreatorIds.includes(u.firebase_uid) ? 'bg-blue-600' : 'bg-white'}`}/>
                          </td>
                          <td className="p-2 truncate max-w-[150px]">
                            <div className="font-black uppercase">{u.display_name}</div>
                            <div className="text-[8px] text-gray-400 font-mono truncate">{u.email}</div>
                          </td>
                          <td className="p-2">
                             <div className="flex gap-2">
                               <span className="text-[8px] border border-black px-1">VAULT: {u.reelcoins}</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Protocol Selection */}
              <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase italic flex items-center gap-2"><Send size={14}/> Deployment Console</h3>
                  <div className="bg-[#111] p-4 border-2 border-gray-800 text-[10px] font-bold text-gray-400">
                    {selectedCreatorIds.length > 0 
                      ? <span className="text-[#39ff14]">NODES ARMED: {selectedCreatorIds.length}</span>
                      : <span className="text-rose-500 animate-pulse">NO NODES SELECTED (GLOBAL BROADCAST)</span>
                    }
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-2">
                  {/* Missions List */}
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase opacity-40">Mission Drafts</p>
                    {missions.filter(m => m.status === 'draft').map(m => (
                      <div key={`m-${m.id}`} onClick={() => setSelectedProtocol({id: m.id, type: 'mission'})}
                           className={`p-3 border-2 cursor-pointer transition-all flex justify-between items-center ${selectedProtocol?.id === m.id && selectedProtocol?.type === 'mission' ? 'bg-[#834bf1] text-white border-white scale-[1.02]' : 'bg-[#1a1a1a] border-gray-800 hover:border-white'}`}>
                        <div className="min-w-0">
                          <div className="font-black text-[10px] uppercase truncate">{m.title}</div>
                          <div className="text-[8px] opacity-60">BOUNTY: {m.reward_amount} RC</div>
                        </div>
                        <Trash2 size={12} className="opacity-20 hover:opacity-100 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handlePurge(m.id, 'mission'); }}/>
                      </div>
                    ))}
                  </div>

                  {/* Vouchers List */}
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase opacity-40">Voucher Drafts</p>
                    {vouchers.filter(v => v.status === 'draft').map(v => (
                      <div key={`v-${v.id}`} onClick={() => setSelectedProtocol({id: v.id, type: 'voucher'})}
                           className={`p-3 border-2 cursor-pointer transition-all flex justify-between items-center ${selectedProtocol?.id === v.id && selectedProtocol?.type === 'voucher' ? 'bg-[#ffde59] text-black border-black scale-[1.02]' : 'bg-[#1a1a1a] border-gray-800 hover:border-white'}`}>
                        <div className="min-w-0">
                          <div className="font-black text-[10px] uppercase truncate">{v.title}</div>
                          <div className="text-[8px] opacity-60">COST: {v.cost} RC</div>
                        </div>
                        <Trash2 size={12} className="opacity-20 hover:opacity-100 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handlePurge(v.id, 'voucher'); }}/>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleExecuteDeploy}
                  disabled={submitting || !selectedProtocol}
                  className="w-full py-5 bg-[#39ff14] text-black border-[3px] border-black font-black uppercase text-xs italic shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {submitting ? 'EXECUTING PROTOCOL...' : 'EXECUTE DEPLOYMENT'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleMissionSubmit} className="space-y-6 bg-white p-8 border-4 border-black shadow-[10px_10px_0px_0px_#834bf1] text-black">
                <h3 className="font-black text-xl italic uppercase font-display border-b-4 border-black pb-2">Create Mission Node</h3>
                <div className="space-y-4">
                  <select className="w-full p-4 border-[3px] border-black font-bold text-xs bg-slate-50" required value={missionForm.brand_id} onChange={e => setMissionForm({...missionForm, brand_id: e.target.value})}>
                    <option value="">-- SELECT ALLIANCE NODE --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input className="w-full p-4 border-[3px] border-black font-bold text-xs" placeholder="MISSION IDENTITY" required value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})}/>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 border-[3px] border-black font-bold text-xs" type="number" placeholder="BOUNTY (RC)" required value={missionForm.reward} onChange={e => setMissionForm({...missionForm, reward: e.target.value})}/>
                    <input className="w-full p-4 border-[3px] border-black font-bold text-[10px]" type="datetime-local" value={missionForm.expires_at} onChange={e => setMissionForm({...missionForm, expires_at: e.target.value})}/>
                  </div>
                  <textarea className="w-full p-4 border-[3px] border-black font-bold text-xs h-32 resize-none" placeholder="MISSION BRIEFING..." required value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})}/>
                </div>
                <button disabled={submitting} className="w-full py-5 bg-black text-white font-black uppercase text-sm italic shadow-[6px_6px_0px_0px_#39ff14] active:scale-95 transition-all">Archive as Draft</button>
              </form>
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleVoucherSubmit} className="space-y-6 bg-white p-8 border-4 border-black shadow-[10px_10px_0px_0px_#ffde59] text-black">
                <h3 className="font-black text-xl italic uppercase font-display border-b-4 border-black pb-2">Generate Voucher Block</h3>
                <div className="space-y-4">
                  <select className="w-full p-4 border-[3px] border-black font-bold text-xs bg-slate-50" required value={voucherForm.brand_id} onChange={e => setVoucherForm({...voucherForm, brand_id: e.target.value})}>
                    <option value="">-- SELECT ALLIANCE NODE --</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <input className="w-full p-4 border-[3px] border-black font-bold text-xs" placeholder="VOUCHER IDENTITY (e.g. 50% OFF)" required value={voucherForm.title} onChange={e => setVoucherForm({...voucherForm, title: e.target.value})}/>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="w-full p-4 border-[3px] border-black font-bold text-xs" type="number" placeholder="COST (RC)" required value={voucherForm.cost} onChange={e => setVoucherForm({...voucherForm, cost: e.target.value})}/>
                    <input className="w-full p-4 border-[3px] border-black font-bold text-xs uppercase" placeholder="OPTIONAL HASH" value={voucherForm.code} onChange={e => setVoucherForm({...voucherForm, code: e.target.value})}/>
                  </div>
                  <textarea className="w-full p-4 border-[3px] border-black font-bold text-xs h-32 resize-none" placeholder="VOUCHER PERKS..." required value={voucherForm.description} onChange={e => setVoucherForm({...voucherForm, description: e.target.value})}/>
                </div>
                <button disabled={submitting} className="w-full py-5 bg-black text-white font-black uppercase text-sm italic shadow-[6px_6px_0px_0px_#834bf1] active:scale-95 transition-all">Archive as Draft</button>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white text-black p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
              <h3 className="font-black text-xl uppercase italic font-display border-b-4 border-black pb-2 mb-6">Agent Roster Intelligence</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map(u => {
                  const stats = getDetailedAgentStats(u.firebase_uid);
                  return (
                    <div key={u.id} className="border-[3px] border-black p-4 flex justify-between items-center group hover:bg-slate-50 transition-all">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black italic border-2 border-black group-hover:scale-105 transition-transform">{u.display_name?.charAt(0)}</div>
                          <div className="min-w-0">
                            <div className="font-black uppercase text-xs truncate">{u.display_name}</div>
                            <div className="text-[8px] text-gray-400 font-mono truncate">{u.email}</div>
                          </div>
                       </div>
                       <div className="text-right space-y-1">
                          <div className="text-[10px] font-black text-[#834bf1]">{u.reelcoins} RC</div>
                          <div className="flex gap-1 justify-end">
                             <div className="text-[7px] border border-black px-1">ACT: {stats.active}</div>
                             <div className="text-[7px] border border-black px-1 bg-emerald-50 text-emerald-700">OK: {stats.completed}</div>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {submissions.filter(s=>s.status==='pending').map(sub => (
                 <div key={sub.id} className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#ffde59] text-black flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-lg uppercase italic font-display">{sub.profiles?.display_name}</h4>
                        <div className="bg-yellow-400 w-3 h-3 border-2 border-black animate-pulse"></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-l-4 border-[#834bf1] pl-3">
                        DEPLOYMENT: {sub.missions?.title}
                      </p>
                    </div>
                    <button onClick={() => setSelectedSubmission(sub)} className="mt-8 bg-black text-[#39ff14] w-full py-3 font-black text-[10px] border-2 border-black shadow-[4px_4px_0px_0px_#834bf1] active:translate-y-1 active:shadow-none transition-all uppercase italic">Verify Submission</button>
                 </div>
               ))}
               {submissions.filter(s=>s.status==='pending').length === 0 && (
                 <div className="col-span-full py-32 text-center border-4 border-dashed border-black/10">
                   <p className="font-black uppercase text-xs tracking-[0.5em] opacity-20 italic">Grid Silent. No incoming transmissions.</p>
                 </div>
               )}
             </div>
          )}

          {activeTab === 'brands' && <BrandManager />}
        </div>
      </div>
    </div>
  );
};