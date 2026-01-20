
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
  Gift
} from 'lucide-react';

interface BrandDashboardProps {
  onBack?: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
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
    // Listen for auth state changes to ensure we have the user context
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user?.email || !supabase) {
        setLoading(false);
        return;
      }

      try {
        console.log("Syncing Brand Node for:", user.email);

        // 1. Fetch Brand Data (Using ilike for case-insensitive match and explicitly selecting reelcoins)
        const { data: brandData, error: bError } = await supabase
          .from('partner_brands')
          .select('*, reelcoins')
          .ilike('brand_email', user.email)
          .single();

        if (bError) throw bError;
        setBrand(brandData);

        // 2. Fetch campaign data linked to this brand
        const [missionsRes, rewardsRes] = await Promise.all([
          supabase.from('missions').select('*').eq('brand_id', brandData.id).order('created_at', { ascending: false }),
          supabase.from('rewards').select('*').eq('brand_id', brandData.id).order('created_at', { ascending: false })
        ]);

        const missions = missionsRes.data || [];
        const rewards = rewardsRes.data || [];
        
        setActiveMissions(missions);
        setActiveRewards(rewards);

        const activeCount = missions.filter(m => m.status === 'active' || !m.status).length;
        const totalDist = (missions.length * 1000); // Simulated historical distribution
        const engagementScore = missions.length * 12;
        const estMediaValue = (engagementScore * 1250).toLocaleString();

        setStats({
          activeMissionsCount: activeCount,
          totalMissionsCount: missions.length,
          rcDistributed: totalDist,
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
        <Loader2 className="animate-spin text-[#834bf1]" size={64} strokeWidth={3} />
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-black animate-pulse">Syncing Alliance Node...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-6">
        <div className="bg-white border-[6px] border-black p-12 shadow-[20px_20px_0px_0px_#000] max-w-lg text-center space-y-6">
          <Building2 size={64} className="mx-auto text-[#834bf1]" />
          <h2 className="text-4xl font-black italic uppercase font-display">Access Denied</h2>
          <p className="text-xs font-bold text-black/40 uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only. Node synchronization failed for this account.
          </p>
          <button onClick={handleLogout} className="w-full bg-black text-white py-5 font-black uppercase text-xs tracking-widest border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59]">Return to Studio</button>
        </div>
      </div>
    );
  }

  // Handle nullish RC balance safely
  const balanceRC = brand?.reelcoins ?? 0;

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {/* MISSION DRILL-DOWN MODAL */}
      {selectedMission && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] relative flex flex-col overflow-hidden animate-in zoom-in-95">
            <button 
              onClick={() => setSelectedMission(null)}
              className="absolute top-6 right-6 z-50 bg-black text-white p-3 border-2 border-white hover:rotate-90 transition-transform shadow-[4px_4px_0px_0px_#000]"
            >
              <X size={24} strokeWidth={4} />
            </button>

            <div className="bg-[#834bf1] p-10 text-white border-b-[6px] border-black">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-[#ffde59]">Applicant Data Sync</p>
              <h2 className="text-4xl font-black italic uppercase font-display leading-tight">{selectedMission.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f0f0f0]">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-[#834bf1]" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Decrypting Applicant Roster...</p>
                </div>
              ) : missionSubmissions.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-black/10">
                  <Users size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-widest text-black/20">No transmissions received for this mission.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <Clock size={18} className="text-[#834bf1]" />
                      <h4 className="font-black text-xs uppercase tracking-widest">Pending Verification</h4>
                    </div>
                    <div className="space-y-4">
                      {missionSubmissions.filter(s => s.status === 'pending').map(sub => (
                        <div key={sub.id} className="bg-white border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000] flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 border-[3px] border-black shadow-[3px_3px_0px_0px_#ffde59] overflow-hidden bg-slate-100">
                              <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.id}`} className="w-full h-full object-cover" alt="Agent" />
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase italic">{sub.profiles?.display_name || 'Agent ID: ' + sub.profiles?.id.slice(0, 4)}</p>
                              <p className="text-[10px] font-bold text-[#834bf1] uppercase tracking-widest mt-1">@{sub.profiles?.handle || 'unlinked'}</p>
                            </div>
                          </div>
                          {sub.link && (
                            <a href={sub.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black text-white px-4 py-2 border-[2px] border-black text-[9px] font-black uppercase tracking-widest hover:bg-[#ffde59] hover:text-black transition-all">
                              <span>View Proof</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      <h4 className="font-black text-xs uppercase tracking-widest">Verified / Completed</h4>
                    </div>
                    <div className="space-y-4">
                      {missionSubmissions.filter(s => s.status === 'approved' || s.status === 'completed').map(sub => (
                        <div key={sub.id} className="bg-emerald-50/50 border-[4px] border-emerald-500 p-6 flex items-center justify-between opacity-80">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 border-[3px] border-emerald-500 grayscale overflow-hidden">
                              <img src={sub.profiles?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.id}`} className="w-full h-full object-cover" alt="Agent" />
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase italic text-emerald-900 line-through decoration-black decoration-2">{sub.profiles?.display_name}</p>
                              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Signal Synchronized</p>
                            </div>
                          </div>
                          <div className="bg-emerald-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] border-2 border-emerald-600">
                            RC CREDITED
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b-[6px] border-black sticky top-0 z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 border-[3px] border-black shadow-[3px_3px_0px_0px_#834bf1] overflow-hidden bg-white p-1">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-full h-full text-black" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black uppercase italic font-display leading-none">{brand.name}</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#834bf1] mt-1">Alliance Dashboard v4.2</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[#ffde59] border-[2px] border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Live Sync Active</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-rose-500 text-white p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <LogOut size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
        <div className="bg-white border-[6px] border-black p-10 shadow-[16px_16px_0px_0px_#000] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-6 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#834bf1] text-white px-4 py-1 border-[2px] border-black font-black text-[10px] uppercase tracking-widest italic">
              <Flame size={14} className="text-[#ffde59] animate-pulse" />
              Campaign Fidelity Status: High
            </div>
            <h2 className="text-6xl font-black italic uppercase font-display tracking-tighter leading-none">Campaign <br /><span className="text-[#834bf1]">Performance</span></h2>
            <p className="text-sm font-bold uppercase leading-relaxed text-black/50 max-w-md border-l-[6px] border-black pl-6 py-2">
              Real-time monitoring of your creative assets and creator network engagement levels.
            </p>
          </div>

          <div className="bg-black text-white p-10 border-[5px] border-black shadow-[10px_10px_0px_0px_#834bf1] text-center min-w-[280px]">
             {/* FIX: CORRECTLY RENDER BRAND BALANCE */}
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-4 italic">AVAILABLE BRAND BALANCE (RC)</p>
             <h3 className="text-6xl font-black italic font-display text-[#ffde59] tracking-tighter">
               {balanceRC.toLocaleString()}
             </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-[#ffde59] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-transform">
              <Zap size={24} strokeWidth={3} className="text-black" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">Active Missions</p>
            <h3 className="text-4xl font-black italic font-display">{stats.activeMissionsCount} <span className="text-xs opacity-30 text-black">/ {stats.totalMissionsCount}</span></h3>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-[#834bf1] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:-rotate-6 transition-transform text-white">
              <Wallet size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">RC Historical</p>
            <h3 className="text-4xl font-black italic font-display">{stats.rcDistributed.toLocaleString()}</h3>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#834bf1] group-hover:scale-110 transition-transform text-white">
              <Users size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">Creator Signals</p>
            <h3 className="text-4xl font-black italic font-display">{stats.engagement}</h3>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-white border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#ffde59] group-hover:translate-x-1 transition-transform">
              <TrendingUp size={24} strokeWidth={3} className="text-[#834bf1]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">Yield Lift</p>
            <h3 className="text-4xl font-black italic font-display">14.2%</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black italic uppercase font-display flex items-center gap-4">
                <Activity size={28} className="text-[#834bf1]" /> Mission Activity Log
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 border-2 border-black italic">Recent Signals</span>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                {activeMissions.length === 0 ? (
                  <p className="text-center py-10 opacity-20 font-black italic uppercase text-xs">Scanning Grid... No Missions Found.</p>
                ) : (
                  activeMissions.map((m) => (
                    <div key={m.id} className="flex items-center justify-between border-b-4 border-slate-50 pb-8 last:border-0 hover:bg-slate-50 transition-colors px-4 -mx-4 group/row">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-black text-[#ffde59] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center group-hover/row:rotate-3 transition-transform">
                          <Zap size={24} fill="currentColor" strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase italic tracking-tight">{m.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase text-[#834bf1] tracking-widest">BOUNTY: {m.reward_amount} RC</span>
                            <div className="w-1 h-1 bg-black/20 rounded-full"></div>
                            <span className="text-[9px] font-bold text-black/40 uppercase">LIVE PROTOCOL</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => {
                            setSelectedMission(m);
                            fetchMissionSubmissions(m.id);
                          }}
                          className="bg-black text-white px-5 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] font-black uppercase text-[9px] tracking-widest hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
                        >
                          VIEW APPLICANTS
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {activeRewards.length > 0 && (
                <div className="pt-8 border-t-[4px] border-black/10">
                   <div className="flex items-center gap-3 mb-8 opacity-40">
                      <Gift size={16} />
                      <h4 className="font-black text-[10px] uppercase tracking-widest">Active Voucher Nodes</h4>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeRewards.map(r => (
                        <div key={r.id} className="border-[3px] border-black p-4 bg-slate-50 flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase italic truncate max-w-[150px]">{r.title}</span>
                           <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 border-2 border-black">SYNCED</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="bg-[#ffde59] border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000] text-black">
              <h3 className="text-2xl font-black italic uppercase font-display mb-6">Alliance Brief</h3>
              <p className="text-sm font-bold uppercase leading-relaxed tracking-tight italic border-l-4 border-black pl-6 py-2">
                "Production metrics indicate high resonance for cinematic pan shots. Recommend deploying a new 'Symmetry Module' for Kolkata nodes to maximize evening traffic conversion."
              </p>
              <button className="w-full mt-10 bg-black text-[#ffde59] py-5 border-[3px] border-white shadow-[6px_6px_0px_0px_#000] font-black uppercase text-[10px] tracking-[0.2em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">Optimize Strategy</button>
            </div>

            <div className="bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#834bf1] space-y-6">
              <h4 className="text-xl font-black uppercase italic font-display flex items-center gap-3">
                <Target size={20} className="text-[#834bf1]" /> Grid Control
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-between w-full bg-slate-50 border-[3px] border-black p-4 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors text-left group/action">
                  <span>Authorize Payouts</span>
                  <Maximize2 size={14} className="group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                </button>
                <button className="flex items-center justify-between w-full bg-slate-50 border-[3px] border-black p-4 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors text-left group/action">
                  <span>Asset Repository</span>
                  <Maximize2 size={14} className="group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t-[4px] border-black/10 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-black/20">Alliance Network Control • Restricted Access Node • Reelywood Studio v4.2</p>
      </footer>
    </div>
  );
};
