import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { Users, Layout, Activity, Bell, LogOut, Terminal, RefreshCw } from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { BrandManager } from './BrandManager';

const ADMIN_EMAILS = ['rohan00as@gmail.com', 'reelywood@gmail.com'];

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [loading, setLoading] = useState(false);
  
  // Data States using type casting to avoid generic parser issues
  const [submissions, setSubmissions] = useState([] as any[]);
  const [logs, setLogs] = useState([] as any[]);
  const [brands, setBrands] = useState([] as any[]);
  const [selectedSubmission, setSelectedSubmission] = useState(null as any);

  // Form States
  const [consoleMode, setConsoleMode] = useState('MISSION');
  
  const [newMission, setNewMission] = useState({
    title: '', 
    description: '', 
    reward: 100, 
    location: '', 
    brand_id: '', 
    image_url: '', 
    checkpoints: ['', '', '']
  });

  const [newVoucher, setNewVoucher] = useState({
    title: '', 
    cost: 500, 
    code: '', 
    brand_id: ''
  });

  // Fetch Logic
  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // 1. Submissions
      const { data: subData } = await supabase
        .from('submissions')
        .select(`*, missions(*)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      const rawSubs = (subData || []) as any[];
      const userIds = rawSubs.map(s => s.user_id);
      
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('firebase_uid', userIds);
      
      const userList = (users || []) as any[];

      const combined = rawSubs.map(sub => ({
        ...sub, 
        profiles: userList.find(u => u.firebase_uid === sub.user_id) || { display_name: 'Unknown', handle: 'unknown' }
      }));
      
      setSubmissions(combined);

      // 2. Logs
      const { data: logData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setLogs((logData || []) as any[]);

      // 3. Brands
      const { data: brandData } = await supabase.from('partner_brands').select('*');
      
      setBrands((brandData || []) as any[]);

    } catch (err) { 
      console.error("Admin Terminal Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // Handlers
  const handleDeployMission = async () => {
    if (!supabase) return;
    if (!newMission.brand_id) return alert("SELECT A BRAND FIRST");
    const { error } = await supabase.from('missions').insert([{
      title: newMission.title,
      description: newMission.description,
      reward_amount: newMission.reward,
      brand_id: newMission.brand_id,
      location: newMission.location,
      image_url: newMission.image_url,
      checkpoints: newMission.checkpoints.filter(c => c.trim() !== '')
    }]);
    if (error) alert("Error: " + error.message);
    else { 
      alert("🚀 MISSION DEPLOYED"); 
      fetchData(); 
      setNewMission({ ...newMission, title: '', description: '' }); 
    }
  };

  const handleDeployVoucher = async () => {
    if (!supabase) return;
    if (!newVoucher.brand_id) return alert("SELECT A BRAND FIRST");
    const { error } = await supabase.from('rewards').insert([{
      title: newVoucher.title,
      cost: newVoucher.cost,
      code: newVoucher.code.toUpperCase()
    }]);
    if (error) alert("Error: " + error.message);
    else { 
      alert("🎟️ VOUCHER CREATED"); 
      fetchData(); 
    }
  };

  const handleBrandSelect = (e: any) => {
    const id = e.target.value;
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    
    if (consoleMode === 'MISSION') {
      setNewMission({ 
        ...newMission, 
        brand_id: id, 
        location: brand.location_text, 
        image_url: brand.cover_image_url, 
        title: `Protocol: ${brand.name}` 
      });
    } else {
      setNewVoucher({ 
        ...newVoucher, 
        brand_id: id, 
        title: `₹500 OFF @ ${brand.name}` 
      });
    }
  };

  const updateCheckpoint = (index: number, val: string) => {
    const cp = [...newMission.checkpoints];
    cp[index] = val;
    setNewMission({ ...newMission, checkpoints: cp });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-lexend text-black">
      {/* HEADER */}
      <div className="bg-black text-white p-6 border-b-4 border-[#834bf1] sticky top-0 z-[100] shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Terminal className="text-[#834bf1]" size={28} />
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">TERMINAL <span className="text-[#834bf1]">ADMIN</span></h1>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={fetchData} className="p-2 bg-white/10 hover:bg-white/20 border-2 border-white/20 transition-all">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button onClick={() => { auth.signOut(); onLogout(); }} className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                <span>Exit</span> <LogOut size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b-4 border-black sticky top-[88px] z-50">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar">
           {[
             { id: 'incoming', label: 'INCOMING', icon: Bell, count: submissions.length },
             { id: 'console', label: 'CONSOLE', icon: Layout, count: 0 },
             { id: 'ledger', label: 'LEDGER', icon: Activity, count: 0 },
             { id: 'alliance', label: 'ALLIANCE', icon: Users, count: 0 },
           ].map((tab) => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id)}
               className={`flex-1 py-5 min-w-[150px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === tab.id ? 'bg-[#834bf1] text-white' : 'hover:bg-gray-100 text-gray-400'}`}>
                <tab.icon size={18} /> {tab.label}
                {(tab.count > 0) && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 border-2 border-white animate-pulse">{tab.count}</span>}
             </button>
           ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* TAB 1: INCOMING */}
        {activeTab === 'incoming' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-4xl font-black italic uppercase mb-8 font-display">VERIFICATION QUEUE</h2>
            {submissions.length === 0 ? (
               <div className="p-24 text-center border-4 border-dashed border-gray-300 text-gray-400 font-bold uppercase tracking-widest">No signals detected in grid.</div>
            ) : (
               submissions.map((sub: any) => (
                 <div key={sub.id} className="bg-white border-4 border-black p-8 flex flex-col md:flex-row gap-8 items-center shadow-[10px_10px_0px_0px_#000] hover:shadow-[14px_14px_0px_0px_#834bf1] transition-all">
                    <div className="w-16 h-16 border-4 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden bg-[#ffde59]">
                       <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.user_id}`} className="w-full h-full object-cover" alt="avatar"/>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className="font-black text-2xl uppercase font-display italic leading-none mb-1">{sub.profiles?.display_name || "Agent"}</h3>
                       <p className="font-bold text-[#834bf1] text-sm uppercase tracking-widest mb-3 italic">@{sub.profiles?.handle || "unlinked"}</p>
                       <div className="bg-gray-50 border-2 border-black/5 p-2 inline-block max-w-full">
                          <a href={sub.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 underline break-all">{sub.link}</a>
                       </div>
                    </div>
                    <button onClick={() => setSelectedSubmission(sub)} className="w-full md:w-auto bg-black text-white px-10 py-5 font-black uppercase tracking-widest text-xs hover:bg-[#4ade80] hover:text-black border-2 border-transparent hover:border-black shadow-[6px_6px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">VERIFY SIGNAL</button>
                 </div>
               ))
            )}
          </div>
        )}

        {/* TAB 2: CONSOLE */}
        {activeTab === 'console' && (
           <div className="bg-white border-[6px] border-black p-8 lg:p-12 shadow-[16px_16px_0px_0px_#000] animate-in fade-in zoom-in-95">
              <div className="flex gap-4 mb-10">
                 <button onClick={() => setConsoleMode('MISSION')} className={`flex-1 py-5 font-black uppercase border-4 border-black transition-all ${consoleMode === 'MISSION' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🚀 DEPLOY MISSION</button>
                 <button onClick={() => setConsoleMode('VOUCHER')} className={`flex-1 py-5 font-black uppercase border-4 border-black transition-all ${consoleMode === 'VOUCHER' ? 'bg-[#ffde59] shadow-[6px_6px_0px_0px_#000]' : 'bg-gray-100 opacity-50'}`}>🎟️ CREATE VOUCHER</button>
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="block font-black text-[10px] uppercase tracking-[0.3em] mb-4 text-black/40 italic">Link Alliance Node (Auto-Fill)</label>
                    <select className="w-full bg-slate-50 border-[3px] border-black p-5 font-black text-sm focus:bg-[#ffde59] transition-colors outline-none" onChange={handleBrandSelect}>
                       <option value="">-- SELECT ALLIANCE PARTNER --</option>
                       {brands.map((b) => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                    </select>
                 </div>

                 {consoleMode === 'MISSION' ? (
                    <div className="space-y-6">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-black/40">Identification</label>
                             <input type="text" placeholder="Mission Title" className="w-full border-[3px] border-black p-5 font-black bg-slate-50" value={newMission.title} onChange={(e) => setNewMission({...newMission, title: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-black/40">Bounty (RC)</label>
                             <input type="number" placeholder="RC Allocation" className="w-full border-[3px] border-black p-5 font-black bg-slate-50" value={newMission.reward} onChange={(e) => setNewMission({...newMission, reward: parseInt(e.target.value)})} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-black/40">Operation Intelligence</label>
                          <textarea placeholder="Briefing / Objectives" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 min-h-[120px]" value={newMission.description} onChange={(e) => setNewMission({...newMission, description: e.target.value})} />
                       </div>
                       <div className="space-y-4">
                          <label className="font-black text-[9px] uppercase text-black/40 italic">Checkpoints (QC Steps)</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {[0, 1, 2].map((i) => (
                                <input key={i} type="text" placeholder={`QC Step ${i+1}`} className="w-full border-2 border-black p-3 text-xs font-black bg-slate-50" value={newMission.checkpoints[i]} onChange={(e) => updateCheckpoint(i, e.target.value)} />
                             ))}
                          </div>
                       </div>
                       <button onClick={handleDeployMission} className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.4em] text-sm border-4 border-black shadow-[8px_8px_0px_0px_#834bf1] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">INITIALIZE MISSION NODE</button>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-black/40">Designation</label>
                             <input type="text" placeholder="Reward Title" className="w-full border-[3px] border-black p-5 font-black bg-slate-50" value={newVoucher.title} onChange={(e) => setNewVoucher({...newVoucher, title: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-black/40">Cost (RC)</label>
                             <input type="number" placeholder="RC Price" className="w-full border-[3px] border-black p-5 font-black bg-slate-50" value={newVoucher.cost} onChange={(e) => setNewVoucher({...newVoucher, cost: parseInt(e.target.value)})} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-black/40">Encrypted Redemption Key</label>
                          <input type="text" placeholder="CABIN50-RW-XXXX" className="w-full border-[3px] border-black p-5 font-black bg-slate-50 uppercase" value={newVoucher.code} onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value})} />
                       </div>
                       <button onClick={handleDeployVoucher} className="w-full bg-black text-white py-6 font-black uppercase tracking-[0.4em] text-sm border-4 border-black shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">AUTHORIZE VOUCHER MINT</button>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* TAB 3: LEDGER */}
        {activeTab === 'ledger' && (
           <div className="bg-black text-[#4ade80] p-10 border-[6px] border-[#4ade80] font-mono shadow-[16px_16px_0px_0px_#000] animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-3xl font-black mb-10 flex items-center gap-4 font-display italic"><Activity className="animate-pulse" /> SYSTEM LOGS_V4.0</h2>
              <div className="space-y-4 h-[600px] overflow-y-auto pr-4 no-scrollbar">
                 {logs.map((log: any) => (
                    <div key={log.id} className="border-b border-[#4ade80]/10 pb-4 mb-4 flex gap-6 hover:bg-white/5 p-2 transition-colors">
                       <span className="text-gray-500 text-[10px] shrink-0 pt-1">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                       <div className="flex-1">
                          <span className="text-[#ffde59] font-black mr-3">[{log.title || 'NOTIF'}]</span>
                          <span className="text-sm leading-relaxed">{log.message}</span>
                       </div>
                    </div>
                 ))}
                 {logs.length === 0 && <div className="flex flex-col items-center justify-center h-full opacity-20 italic uppercase tracking-widest text-xs">Initializing secure tracking... Standby for data.</div>}
              </div>
           </div>
        )}

        {/* TAB 4: ALLIANCE */}
        {activeTab === 'alliance' && <BrandManager />}
      </div>

      {selectedSubmission && (
        <VerificationModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onRefresh={fetchData} />
      )}
    </div>
  );
};