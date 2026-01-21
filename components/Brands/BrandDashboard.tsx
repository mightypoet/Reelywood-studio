
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
  Plus
} from 'lucide-react';

interface BrandDashboardProps {
  onBack?: () => void;
}

type TabType = 'overview' | 'campaigns' | 'inbox' | 'profile';

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

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Wallet Card */}
      <div className="bg-[#0047AB] text-white p-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#00ffcc] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="bg-white/20 px-2 py-1 border border-white/30 text-[8px] font-black uppercase tracking-widest">Master Node</div>
            <Building2 size={24} className="text-[#00ffcc]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00ffcc] mb-2 italic">Available Brand Balance (RC)</p>
          <h3 className="text-5xl font-black italic font-display tracking-tighter">
            {brand.reelcoins?.toLocaleString() || "0"}
          </h3>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5">
            <Target size={140} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
            { label: 'Active Ops', val: stats.activeMissionsCount, icon: Zap, color: '#0047AB' },
            { label: 'RC Deployed', val: stats.rcDistributed, icon: Wallet, color: '#00ffcc' },
            { label: 'Network Signals', val: stats.engagement, icon: Users, color: '#000000' },
            { label: 'Growth Lift', val: '14.2%', icon: TrendingUp, color: '#0047AB' }
        ].map((item, i) => (
            <div key={i} className="bg-white p-5 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                <item.icon size={18} style={{ color: item.color }} strokeWidth={3} className="mb-3" />
                <h4 className="text-2xl font-black italic font-display text-black leading-none">{item.val}</h4>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">{item.label}</p>
            </div>
        ))}
      </div>

      <div className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#0047AB] text-black">
        <h4 className="text-lg font-black italic uppercase font-display flex items-center gap-3 mb-4">
          <Flame size={18} className="text-[#00ffcc] fill-current" /> System Intel
        </h4>
        <p className="text-xs font-bold leading-relaxed tracking-tight italic border-l-4 border-[#00ffcc] pl-4">
          "Performance metrics indicate peak creator activity in Sector 7. Deploying additional incentive modules recommended for Q4 coverage."
        </p>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase italic font-display">Campaign Grid</h3>
        <button className="bg-[#0047AB] text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_#00ffcc]">
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {activeMissions.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-black/10 opacity-30 italic font-black uppercase text-xs">Grid Silent.</div>
        ) : (
          activeMissions.map((m) => (
            <div key={m.id} className="bg-white border-[3px] border-black p-5 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-black text-white px-2 py-0.5 text-[7px] font-black uppercase border border-black italic">DEPLOYED_SYNC</div>
                <span className="text-[#0047AB] font-black text-sm italic">+{m.reward_amount} RC Pool</span>
              </div>
              <h4 className="font-black text-sm uppercase italic mb-2 leading-tight">{m.title}</h4>
              <p className="text-[9px] font-bold text-black/40 uppercase mb-5 line-clamp-2">{m.description}</p>
              <button 
                onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
                className="w-full bg-[#0047AB] text-white py-3 border-[2px] border-black shadow-[3px_3px_0px_0px_#00ffcc] font-black uppercase text-[10px] tracking-widest active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Sync Applicants
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <h3 className="text-xl font-black uppercase italic font-display flex items-center gap-3">
        <Inbox size={20} className="text-[#0047AB]" /> Transmission Log
      </h3>
      <div className="space-y-4">
        {activeMissions.map((m) => (
          <div key={m.id} className="flex items-center justify-between border-b-[3px] border-slate-100 pb-5 px-1 hover:bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-[#00ffcc] border-2 border-black shadow-[3px_3px_0px_0px_#0047AB] flex items-center justify-center shrink-0">
                <Activity size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase italic truncate text-black">{m.title}</p>
                <p className="text-[8px] font-bold text-[#0047AB] uppercase tracking-widest mt-1 italic">Authorized Signal Waiting</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedMission(m); fetchMissionSubmissions(m.id); }}
              className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]"
            >
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
        {activeMissions.length === 0 && <p className="py-20 text-center opacity-20 italic text-xs font-black uppercase">No incoming transmissions.</p>}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-20">
      <div className="bg-white border-[4px] border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_#0047AB]">
        <div className="w-16 h-16 bg-white border-[3px] border-black shadow-[3px_3px_0px_0px_#00ffcc] overflow-hidden p-1 shrink-0">
          <img src={brand.logo_url} className="w-full h-full object-contain" alt="Logo" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-black uppercase italic text-black truncate">{brand.name}</h3>
          <p className="text-[8px] font-bold text-black/40 uppercase tracking-widest truncate">{brand.brand_email}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest active:translate-x-1 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <Wallet size={18} className="text-[#0047AB]" /> Funding Portal
          </div>
          <ChevronRight size={14} className="opacity-20" />
        </button>
        <button className="w-full bg-white border-[3px] border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_#000] font-black uppercase text-[10px] tracking-widest active:translate-x-1 active:shadow-none transition-all">
          <div className="flex items-center gap-4">
            <Target size={18} className="text-[#0047AB]" /> Authorized Syncs
          </div>
          <ChevronRight size={14} className="opacity-20" />
        </button>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-rose-500 text-white border-[4px] border-black py-6 shadow-[8px_8px_0px_0px_#000] font-black uppercase text-xs tracking-[0.4em] italic flex items-center justify-center gap-4 active:scale-95 transition-all"
      >
        <LogOut size={20} strokeWidth={3} />
        <span>Terminate Session</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24 font-lexend">
      {/* Modal - Full Screen Mobile Sheet */}
      {selectedMission && (
        <div className="fixed inset-0 z-[1000] bg-white animate-in slide-in-from-bottom duration-500 flex flex-col">
          <header className="bg-[#0047AB] p-6 text-white border-b-[6px] border-black flex justify-between items-center sticky top-0">
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-1 text-[#00ffcc]">Applicant Sync Node</p>
              <h2 className="text-xl font-black italic uppercase font-display leading-tight truncate max-w-[250px]">{selectedMission.title}</h2>
            </div>
            <button onClick={() => setSelectedMission(null)} className="bg-black text-white p-2 border-2 border-white shadow-[4px_4px_0px_0px_#000]">
              <X size={24} strokeWidth={4} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#0047AB]" size={48} />
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
                      <div className="w-12 h-12 border-2 border-black shadow-[3px_3px_0px_0px_#00ffcc] overflow-hidden bg-slate-100 shrink-0">
                        <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub.id}`} className="w-full h-full object-cover" alt="Agent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs uppercase italic text-black truncate">{sub.profiles?.display_name || 'Agent ID'}</p>
                        <p className="text-[8px] font-bold text-[#0047AB] uppercase mt-0.5">@{sub.profiles?.handle || 'unlinked'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                        {sub.link && (
                            <a href={sub.link} target="_blank" rel="noreferrer" className="p-2 bg-black text-white border-2 border-black hover:bg-[#00ffcc] hover:text-black transition-colors">
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
      <header className="bg-white border-b-[4px] border-black sticky top-0 z-50 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-black shadow-[2px_2px_0px_0px_#0047AB] p-1 bg-white overflow-hidden">
            <img src={brand.logo_url} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase italic leading-none">{brand.name}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[7px] font-black uppercase tracking-widest opacity-40">AUTHORIZED_ALLIANCE_NODE</span>
            </div>
          </div>
        </div>
        <button className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5">
          <Bell size={18} />
        </button>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-lg mx-auto">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'inbox' && renderInbox()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t-[4px] border-black px-4 py-2 pb-6 flex items-center justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'campaigns', icon: Zap, label: 'Campaigns' },
          { id: 'inbox', icon: Activity, label: 'Inbox' },
          { id: 'profile', icon: Building2, label: 'Profile' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === tab.id ? 'text-[#0047AB]' : 'text-black/30'}`}
          >
            <div className={`p-2 rounded-none border-2 transition-colors ${activeTab === tab.id ? 'bg-[#00ffcc] border-black shadow-[2px_2px_0px_0px_#000]' : 'border-transparent'}`}>
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 3 : 2} />
            </div>
            <span className="text-[7px] font-black uppercase mt-1.5 tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <footer className="text-center pt-8 pb-32 opacity-10">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Alliance Network v4.5 • Partner Portal</p>
      </footer>
    </div>
  );
};
