
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
  Home,
  LayoutGrid,
  Bell,
  ChevronRight,
  Settings,
  // Added missing Plus icon import
  Plus
} from 'lucide-react';

interface BrandDashboardProps {
  onBack?: () => void;
}

type TabType = 'overview' | 'missions' | 'activity' | 'profile';

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [brand, setBrand] = useState<any>(null);
  const [activeMissions, setActiveMissions] = useState<any[]>([]);
  const [activeRewards, setActiveRewards] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [missionSubmissions, setMissionSubmissions] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

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

      try {
        const { data: brandData, error: bError } = await supabase
          .from('partner_brands')
          .select('*, reelcoins')
          .ilike('brand_email', user.email)
          .single();

        if (bError) {
          console.error("BRAND_LOOKUP_ERROR:", bError);
          setLoading(false);
          return;
        }

        setBrand(brandData);

        const [missionsRes, rewardsRes] = await Promise.all([
          supabase.from('missions').select('*').eq('brand_id', brandData.id).order('created_at', { ascending: false }),
          supabase.from('rewards').select('*').eq('brand_id', brandData.id).order('created_at', { ascending: false })
        ]);

        const missions = missionsRes.data || [];
        const rewards = rewardsRes.data || [];
        
        setActiveMissions(missions);
        setActiveRewards(rewards);

        let totalDistributed = 0;
        const missionIds = missions.map(m => m.id);

        if (missionIds.length > 0) {
          const { data: approvedSubmissions, error: sError } = await supabase
            .from('submissions')
            .select('mission_id')
            .in('mission_id', missionIds)
            .eq('status', 'approved');

          if (!sError && approvedSubmissions) {
            approvedSubmissions.forEach(sub => {
              const mission = missions.find(m => m.id === sub.mission_id);
              if (mission) {
                totalDistributed += (mission.reward_amount || 0);
              }
            });
          }
        }

        const activeCount = missions.filter(m => m.status === 'active' || !m.status).length;
        const engagementScore = missions.length * 12;
        const estMediaValue = (engagementScore * 1250).toLocaleString();

        setStats({
          activeMissionsCount: activeCount,
          totalMissionsCount: missions.length,
          rcDistributed: totalDistributed,
          engagement: engagementScore,
          mediaValue: `₹${estMediaValue}`
        });

      } catch (err) {
        console.error("BRAND_PORTAL_SYNC_ERROR:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-[#0047AB]" size={64} strokeWidth={3} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Syncing Alliance Node...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-6">
        <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] max-w-lg text-center space-y-6">
          <Building2 size={64} className="mx-auto text-[#0047AB]" />
          <h2 className="text-3xl font-black italic uppercase font-display text-black">Access Denied</h2>
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only. No Brand account found for {auth.currentUser?.email}.
          </p>
          <button onClick={handleLogout} className="w-full bg-black text-white py-5 font-black uppercase text-xs tracking-widest border-[4px] border-black shadow-[6px_6px_0px_0px_#00ffcc]">Return to Studio</button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Brand Wallet Card */}
      <div className="bg-[#0047AB] p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Building2 size={80} />
        </div>
        <div className="relative z-10">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#00ffcc] mb-4 italic">Alliance Credit Node</p>
          <div className="flex flex-col mb-8">
            <h3 className="text-5xl font-black italic font-display tracking-tighter">
              {brand.reelcoins?.toLocaleString() || "0"}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60 italic">Available Balance (RC)</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-[9px] font-black uppercase tracking-widest bg-black/20 px-2 py-1">NODE_ID: {brand.id.slice(0, 8)}</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00ffcc] rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black uppercase">Active Ledger</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
          <Zap size={16} className="text-[#0047AB] mb-3" strokeWidth={3} />
          <h4 className="text-2xl font-black italic font-display text-black leading-none">{stats.activeMissionsCount}</h4>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">Active Missions</p>
        </div>
        <div className="bg-white p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
          <Wallet size={16} className="text-[#00ffcc] mb-3" strokeWidth={3} />
          <h4 className="text-2xl font-black italic font-display text-black leading-none">{stats.rcDistributed.toLocaleString()}</h4>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">RC Deployed</p>
        </div>
        <div className="bg-white p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
          <Users size={16} className="text-black mb-3" strokeWidth={3} />
          <h4 className="text-2xl font-black italic font-display text-black leading-none">{stats.engagement}</h4>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">Signals</p>
        </div>
        <div className="bg-white p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
          <TrendingUp size={16} className="text-[#0047AB] mb-3" strokeWidth={3} />
          <h4 className="text-2xl font-black italic font-display text-black leading-none">14.2%</h4>
          <p className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">Yield Lift</p>
        </div>
      </div>

      {/* Brief message */}
      <div className="bg-[#00ffcc] border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] text-black">
        <h4 className="text-lg font-black italic uppercase font-display flex items-center gap-3 mb-4">
          <Flame size={18} className="animate-pulse" /> Alliance Brief
        </h4>
        <p className="text-xs font-bold leading-relaxed tracking-tight italic border-l-4 border-black pl-4">
          "Engagement velocity is trending high in F&B nodes. Deploying visual symmetry modules recommended for Q4 conversion spikes."
        </p>
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase italic font-display">Mission Nodes</h3>
        <button className="bg-black text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_#0047AB]">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        {activeMissions.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-black/10 opacity-30 italic font-black uppercase text-xs">No active transmissions.</div>
        ) : (
          activeMissions.map((m) => (
            <div key={m.id} className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-widest border border-black">SYNC_OK</div>
                <div className="text-right">
                  <span className="text-[#0047AB] font-black text-sm italic">+{m.reward_amount} RC</span>
                </div>
              </div>
              <h4 className="font-black text-sm uppercase italic mb-2 text-black">{m.title}</h4>
              <p className="text-[9px] font-bold text-black/40 uppercase mb-5 line-clamp-2">{m.description}</p>
              <button 
                onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
                className="w-full bg-[#0047AB] text-white py-3 border-[2px] border-black shadow-[3px_3px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Sync Applicants
              </button>
            </div>
          ))
        )}
      </div>

      {activeRewards.length > 0 && (
        <div className="pt-8 border-t-[3px] border-black/10">
          <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-30">
            <Gift size={14} /> Reward Hubs
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {activeRewards.map(r => (
              <div key={r.id} className="bg-slate-50 border-2 border-black p-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase italic truncate text-black">{r.title}</span>
                <span className="text-[8px] font-bold text-emerald-600 bg-white px-2 border border-black italic">ACTIVE_NODE</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-3">
          <Activity size={20} className="text-[#0047AB]" /> Signal Log
        </h3>
        <span className="text-[8px] font-black uppercase bg-black text-white px-2 py-0.5">REAL_TIME</span>
      </div>

      <div className="space-y-4">
        {activeMissions.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b-[3px] border-slate-100 pb-5 hover:bg-slate-50 transition-colors px-2 -mx-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-[#00ffcc] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center">
                <Zap size={18} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase italic truncate text-black">{m.title}</p>
                <p className="text-[8px] font-bold text-[#0047AB] uppercase tracking-widest mt-1">SIGNAL_WAITING</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
              className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:bg-slate-100"
            >
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
        {activeMissions.length === 0 && <p className="py-20 text-center opacity-20 italic text-xs uppercase font-black">Archive Silent.</p>}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white border-[4px] border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_#000]">
        <div className="w-16 h-16 bg-[#0047AB] border-[3px] border-black shadow-[3px_3px_0px_0px_#00ffcc] overflow-hidden p-1 shrink-0">
          <img src={brand.logo_url} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black uppercase italic text-black truncate">{brand.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest truncate">{brand.brand_email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30 mb-4 px-1">Grid Control Panel</p>
        <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <Target size={18} className="text-[#0047AB]" /> Authorize Payouts
          </div>
          <Maximize2 size={14} className="opacity-20" />
        </button>
        <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <LayoutGrid size={18} className="text-[#0047AB]" /> Campaign Assets
          </div>
          <Maximize2 size={14} className="opacity-20" />
        </button>
        <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <Settings size={18} className="text-[#0047AB]" /> Node Settings
          </div>
          <Maximize2 size={14} className="opacity-20" />
        </button>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-rose-500 text-white border-[4px] border-black py-6 shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xs tracking-[0.4em] italic hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all flex items-center justify-center gap-4"
      >
        <LogOut size={20} strokeWidth={3} />
        <span>Terminate Session</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-32">
      {/* Modal Overlay Preserved */}
      {selectedMission && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg max-h-[80vh] border-[6px] border-black shadow-[16px_16px_0px_0px_#0047AB] relative flex flex-col overflow-hidden animate-in zoom-in-95">
            <button 
              onClick={() => setSelectedMission(null)}
              className="absolute top-4 right-4 z-50 bg-black text-white p-2 border-2 border-white hover:bg-rose-500 transition-colors"
            >
              <X size={20} strokeWidth={4} />
            </button>
            <div className="bg-[#0047AB] p-8 text-white border-b-[6px] border-black">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-1 text-[#00ffcc]">Applicant Sync</p>
              <h2 className="text-2xl font-black italic uppercase font-display leading-tight">{selectedMission.title}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#f0f0f0]">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-[#0047AB]" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Roster...</p>
                </div>
              ) : missionSubmissions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-black/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/20">No transmissions detected.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {missionSubmissions.map(sub => (
                    <div key={sub.id} className={`bg-white border-[3px] border-black p-4 flex items-center justify-between ${sub.status === 'approved' ? 'bg-emerald-50/50 opacity-60' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-2 border-black overflow-hidden bg-slate-100">
                          <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub.id}`} className="w-full h-full object-cover" alt="Agent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[10px] uppercase italic text-black truncate">{sub.profiles?.display_name || 'Agent'}</p>
                          <p className="text-[8px] font-bold text-[#0047AB] uppercase mt-0.5">@{sub.profiles?.handle || 'unlinked'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {sub.link && (
                          <a href={sub.link} target="_blank" rel="noreferrer" className="p-2 bg-black text-white border-2 border-black hover:bg-[#00ffcc] hover:text-black">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {sub.status === 'approved' && <CheckCircle2 size={18} className="text-emerald-500 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <header className="bg-white border-b-[4px] border-black sticky top-0 z-[100] px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 border-[2px] border-black shadow-[2px_2px_0px_0px_#0047AB] overflow-hidden p-1 bg-white">
            <img src={brand.logo_url} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase italic leading-none">{brand.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[7px] font-black uppercase tracking-widest opacity-40">NODE_v4.2_ONLINE</span>
            </div>
          </div>
        </div>
        <button className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
          <Bell size={18} />
        </button>
      </header>

      {/* Main View Port */}
      <main className="p-6 max-w-md mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'activity' && renderActivity()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t-[4px] border-black px-4 py-2 pb-6 sm:pb-2 flex items-center justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {[
          { id: 'overview', icon: Home, label: 'Hub' },
          { id: 'missions', icon: Zap, label: 'Missions' },
          { id: 'activity', icon: Activity, label: 'Activity' },
          { id: 'profile', icon: Building2, label: 'Profile' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center flex-1 py-2 min-h-[48px] transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#0047AB] scale-110' : 'text-black/30'}`}
          >
            <div className={`p-1.5 rounded-none border-2 transition-colors ${activeTab === tab.id ? 'bg-[#00ffcc] border-black shadow-[2px_2px_0px_0px_#000]' : 'border-transparent'}`}>
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
            </div>
            <span className="text-[7px] font-black uppercase mt-1.5 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* PWA Label Footer */}
      <footer className="text-center pt-8 pb-32 opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Alliance Network v4.2.0 • Mobile Node</p>
      </footer>
    </div>
  );
};
