
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  LogOut, 
  Target, 
  Users, 
  TrendingUp, 
  Wallet, 
  Loader2,
  Building2,
  Activity,
  Maximize2,
  Flame,
  Zap,
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  Gift,
  LayoutDashboard,
  Bell,
  ChevronRight,
  Inbox,
  Plus,
  Terminal,
  Home,
  User,
  History,
  LayoutGrid,
  Send
} from 'lucide-react';

interface BrandDashboardProps {
  onBack?: () => void;
}

type TabType = 'hub' | 'campaigns' | 'inbox' | 'profile';

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [brand, setBrand] = useState<any>(null);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [activeRewards, setActiveRewards] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [missionSubmissions, setMissionSubmissions] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    reward_amount: '',
    requirements: ''
  });

  const [stats, setStats] = useState({
    activeMissionsCount: 0,
    totalMissionsCount: 0,
    rcDistributed: 0,
    engagement: 0,
    mediaValue: "₹0"
  });

  const handleLogout = async () => {
    await auth.signOut();
    if (onBack) onBack();
  };

  const handleRequestMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !brand) return;
    
    setIsRequesting(true);
    console.log("SYNC_LOG: Initiating mission request for brand:", brand.id);

    try {
      const payload = {
        brand_id: brand.id,
        title: requestForm.title,
        description: `${requestForm.description}${requestForm.requirements ? `\n\nREQUIREMENTS:\n${requestForm.requirements}` : ''}`,
        reward_amount: parseInt(requestForm.reward_amount),
        status: 'pending_approval'
      };

      const { data, error } = await supabase.from('missions').insert([payload]).select();

      if (error) {
        console.error("SYNC_ERROR_DATABASE:", error);
        throw error;
      }
      
      console.log("SYNC_SUCCESS:", data);
      alert("Mission Requested! Waiting for Admin Approval.");
      setRequestModalOpen(false);
      setRequestForm({ title: '', description: '', reward_amount: '', requirements: '' });
      
      // Refresh current data
      if (auth.currentUser?.email) {
        await fetchBrandData(auth.currentUser.email);
      }
    } catch (err: any) {
      console.error("SYNC_CRITICAL_FAILURE:", err);
      alert("Failed: " + (err.message || "Unknown transmission error. Check Console."));
    } finally {
      setIsRequesting(false);
    }
  };

  const fetchBrandData = async (email: string) => {
    if (!supabase) return;
    try {
      const { data: brandData, error: bError } = await supabase
        .from('partner_brands')
        .select('*, reelcoins')
        .ilike('brand_email', email)
        .single();

      if (bError) throw bError;
      setBrand(brandData);

      const [missionsRes, rewardsRes] = await Promise.all([
        supabase.from('missions').select('*').eq('brand_id', brandData.id).neq('status', 'pending_approval').order('created_at', { ascending: false }),
        supabase.from('rewards').select('*').eq('brand_id', brandData.id).order('created_at', { ascending: false })
      ]);

      setActiveMissions(missionsRes.data || []);
      setActiveRewards(rewardsRes.data || []);
    } catch (err) {
      console.error("DATA_FETCH_ERROR:", err);
    }
  };

  const fetchMissionSubmissions = async (missionId: string) => {
    if (!supabase) return;
    setModalLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(*)')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissionSubmissions(data || []);
    } catch (err) {
      console.error("SUBMISSION_FETCH_ERROR:", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user?.email || !supabase) {
        setLoading(false);
        return;
      }
      await fetchBrandData(user.email);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-[#ffde59]" size={64} strokeWidth={4} />
        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-black animate-pulse">Syncing Alliance...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-6">
        <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] max-w-lg text-center space-y-6">
          <Building2 size={64} className="mx-auto text-[#ffde59]" />
          <h2 className="text-3xl font-black italic uppercase font-display text-black">Access Denied</h2>
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest leading-relaxed">
            No Partner account found for {auth.currentUser?.email}.
          </p>
          <button onClick={handleLogout} className="w-full bg-black text-white py-5 font-black uppercase text-xs tracking-widest border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59]">Return to Studio</button>
        </div>
      </div>
    );
  }

  const renderHub = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-[#ffde59] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-black">
          <div className="flex justify-between items-start mb-2">
            <Wallet size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-black/10 px-1">VAULT</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{brand.reelcoins?.toLocaleString() || "0"}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">RC Balance</p>
        </div>
        <div className="bg-[#834bf1] p-4 sm:p-6 border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] text-white">
          <div className="flex justify-between items-start mb-2">
            <Zap size={18} className="opacity-50" />
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest bg-white/20 px-1">GRID</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black italic font-display leading-none">{activeMissions.length}</h3>
          <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-1">Active Ops</p>
        </div>
      </div>

      <div className="bg-white border-[3px] sm:border-4 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
        <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 flex items-center gap-2 text-black">
          <History size={14} /> Alliance History
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-3 sm:gap-4 border-b-2 border-slate-50 pb-4 last:border-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center shrink-0 bg-[#ffde59]">
              <Target size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black uppercase truncate">Yield Protocol Active</p>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Operational node v4.5</p>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-600">ONLINE</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 border-b-2 border-slate-50 pb-4 last:border-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center shrink-0 bg-[#834bf1] text-white">
              <Plus size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black uppercase truncate">Grid Expansion Node</p>
              <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">New mission capacity available</p>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#834bf1]">READY</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-[3px] sm:border-4 border-black p-6 shadow-[6px_6px_0px_0px_#ffde59] text-black">
        <h4 className="text-lg font-black italic uppercase font-display flex items-center gap-3 mb-4">
          <Flame size={18} className="text-[#834bf1] fill-current" /> Alliance Intel
        </h4>
        <p className="text-xs font-bold leading-relaxed tracking-tight italic border-l-4 border-[#834bf1] pl-4">
          "Performance metrics indicate peak creator activity in Sector 7. Deploying additional incentive modules recommended for Q4 coverage."
        </p>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
          <Zap className="text-[#ffde59]" size={18} /> Mission Control
        </h3>
      </div>
      <div className="space-y-4 sm:space-y-6">
        {activeMissions.length === 0 ? (
          <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">GRID_SILENT</div>
        ) : (
          activeMissions.map(m => (
            <div 
              key={m.id} 
              className="bg-white border-[3px] sm:border-[4px] border-black p-5 sm:p-6 shadow-[4px_4px_0px_0px] sm:shadow-[6px_6px_0px_0px] shadow-black relative overflow-hidden flex flex-col transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-black text-[#ffde59] px-2 py-1 font-black text-[7px] sm:text-[9px] border-[2px] border-black shadow-[2px_2px_0px_0px_#834bf1]">
                  +{m.reward_amount} RC
                </div>
                <div className="bg-slate-50 border-2 border-black px-2 py-1 font-black text-[7px] uppercase tracking-widest">
                  SYNC_NODE_OK
                </div>
              </div>
              
              <h4 className="text-base sm:text-lg font-black uppercase italic font-display leading-tight text-black relative z-10">
                {m.title}
              </h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-black/50 uppercase leading-relaxed mt-2 line-clamp-2 relative z-10">
                {m.description}
              </p>
              
              <button 
                onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
                className="w-full py-4 mt-6 border-[3px] border-black bg-[#ffde59] text-black font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
              >
                SYNC APPLICANTS
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <h3 className="text-lg sm:text-xl font-black uppercase italic font-display flex items-center gap-3 text-black">
        <Inbox size={20} className="text-[#ffde59]" /> Signal Log
      </h3>
      <div className="space-y-4">
        {activeMissions.length === 0 ? (
          <div className="py-20 text-center opacity-10 italic border-4 border-dashed border-black">LOG_EMPTY</div>
        ) : (
          activeMissions.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b-[3px] border-slate-100 pb-5 px-1 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black text-[#ffde59] border-2 border-black shadow-[3px_3px_0px_0px_#834bf1] flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase italic truncate text-black">{m.title}</p>
                  <p className="text-[8px] font-bold text-[#834bf1] uppercase tracking-widest mt-1 italic">Authorized Signal Waiting</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
                className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-5 duration-500 pb-20">
       <div className="bg-white border-[3px] sm:border-[4px] border-black p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-[6px_6px_0px_0px_#000]">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#ffde59] border-[2px] sm:border-[3px] border-black overflow-hidden shadow-[2px_2px_0px_0px_#834bf1] sm:shadow-[3px_3px_0px_0px_#834bf1] p-1 flex items-center justify-center">
            <img src={brand.logo_url} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="min-w-0">
             <h3 className="text-lg sm:text-xl font-black uppercase italic text-black truncate">{brand.name}</h3>
             <p className="text-[8px] sm:text-[10px] font-bold text-black/40 uppercase tracking-widest truncate">{brand.brand_email}</p>
          </div>
       </div>

       <div className="space-y-3 sm:space-y-4">
          <button className="w-full bg-white border-[3px] border-black p-4 sm:p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[9px] sm:text-[10px] tracking-widest group text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
             <div className="flex items-center gap-3 sm:gap-4">
               <Wallet size={18} className="text-[#ffde59]" /> Funding Portal
             </div>
             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full bg-white border-[3px] border-black p-4 sm:p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[9px] sm:text-[10px] tracking-widest group text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
             <div className="flex items-center gap-3 sm:gap-4">
               <Target size={18} className="text-[#ffde59]" /> Authorized Syncs
             </div>
             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
       </div>

       <button 
          onClick={handleLogout}
          className="w-full bg-rose-500 text-white border-[3px] sm:border-[4px] border-black py-5 sm:py-6 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4"
        >
          <LogOut size={18} strokeWidth={3} />
          <span>TERMINATE SESSION</span>
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-32 font-lexend">
      {/* FAB Button */}
      {activeTab === 'campaigns' && (
        <button 
          onClick={() => setRequestModalOpen(true)}
          className="fixed bottom-24 right-6 sm:bottom-32 sm:right-10 z-[110] bg-black text-white p-4 border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-90 transition-all"
        >
          <Plus size={32} strokeWidth={4} />
        </button>
      )}

      {/* Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] p-8 md:p-12 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setRequestModalOpen(false)} className="absolute top-6 right-6 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors shadow-[4px_4px_0px_0px_#000]">
              <X size={20} strokeWidth={4} />
            </button>
            <h2 className="text-3xl font-black italic uppercase font-display mb-8">Request Mission</h2>
            
            <form onSubmit={handleRequestMission} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">Protocol Title</label>
                <input required type="text" placeholder="e.g. VISUAL CAPTURE: MENU" 
                       className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all"
                       value={requestForm.title} onChange={e => setRequestForm({...requestForm, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">Reward Amount (RC)</label>
                  <input required type="number" placeholder="500" 
                         className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all"
                         value={requestForm.reward_amount} onChange={e => setRequestForm({...requestForm, reward_amount: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">Requirements</label>
                  <input required type="text" placeholder="Tag @brand, 1 Reel" 
                         className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all"
                         value={requestForm.requirements} onChange={e => setRequestForm({...requestForm, requirements: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">Briefing Details</label>
                <textarea required rows={4} placeholder="Define mission parameters..." 
                          className="w-full bg-slate-50 border-[3px] border-black p-4 font-bold text-sm focus:bg-[#ffde59] focus:outline-none transition-all resize-none"
                          value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} />
              </div>

              <button 
                disabled={isRequesting}
                className="w-full bg-black text-white py-5 border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black uppercase text-xs tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4"
              >
                {isRequesting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                SYNC REQUEST
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Sync Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-[1000] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col">
          <header className="bg-[#ffde59] p-6 text-black border-b-[6px] border-black flex justify-between items-center sticky top-0">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-1 text-black/50">Applicant Sync Node</p>
              <h2 className="text-xl font-black italic uppercase font-display leading-tight truncate max-w-[250px]">{selectedMission.title}</h2>
            </div>
            <button onClick={() => setSelectedMission(null)} className="bg-black text-white p-2 border-2 border-white shadow-[4px_4px_0px_0px_#834bf1]">
              <X size={24} strokeWidth={4} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#ffde59]" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Applicant Feed...</p>
              </div>
            ) : missionSubmissions.length === 0 ? (
              <div className="py-20 text-center border-4 border-dashed border-black/10">
                <Users size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-xs font-black uppercase tracking-widest text-black/20 text-center">No Signals Detected.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {missionSubmissions.map(sub => (
                  <div key={sub.id} className={`bg-white border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_#000] flex items-center justify-between ${sub.status === 'approved' ? 'bg-emerald-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border-2 border-black shadow-[3px_3px_0px_0px_#ffde59] overflow-hidden bg-slate-100 shrink-0">
                        <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub.id}`} className="w-full h-full object-cover" alt="Agent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs uppercase italic text-black truncate">{sub.profiles?.display_name || 'Agent ID'}</p>
                        <p className="text-[8px] font-bold text-[#834bf1] uppercase mt-0.5">@{sub.profiles?.handle || 'unlinked'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        {sub.link && (
                            <a href={sub.link} target="_blank" rel="noreferrer" className="p-2 bg-black text-white border-2 border-black hover:bg-[#ffde59] hover:text-black transition-colors">
                                <ExternalLink size={16} />
                            </a>
                        )}
                        {sub.status === 'approved' && <CheckCircle2 className="text-emerald-500 mt-1" size={20} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <header className="bg-white border-b-[3px] sm:border-b-4 border-black p-3 sm:p-4 sticky top-0 z-[100] flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-[#ffde59] flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#834bf1] rotate-3 shrink-0">
            <Terminal size={18} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black italic uppercase font-display leading-none text-black">REELY<span className="text-[#834bf1]">ALLIANCE</span></h1>
            <p className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-30">Partner Node v4.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#ffde59] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black uppercase text-black">ALLIANCE_LINK_OK</span>
          </div>
          <button className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
            <Bell size={18} />
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-2xl mx-auto">
        {activeTab === 'hub' && renderHub()}
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'inbox' && renderInbox()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-md bg-black border-[3px] sm:border-4 border-white p-1 sm:p-2 flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
        {[
          { id: 'hub', icon: Home, label: 'HUB' },
          { id: 'campaigns', icon: Zap, label: 'MISSIONS' },
          { id: 'inbox', icon: Activity, label: 'INBOX' },
          { id: 'profile', icon: User, label: 'PROFILE' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#ffde59] scale-110' : 'text-white/40'}`}>
            <tab.icon size={18} strokeWidth={tab.id === activeTab ? 3 : 2} />
            <span className="text-[6px] sm:text-[7px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      
      <footer className="text-center pt-8 sm:pt-10 pb-24 sm:pb-20 opacity-10">
        <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-black">PRODUCTION_NODE_v4.5.0 • ENCRYPTED</p>
      </footer>
    </div>
  );
};
