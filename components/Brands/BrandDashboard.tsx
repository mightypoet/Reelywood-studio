
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/clients';
import { auth } from '../../lib/firebase';
import { 
  LogOut, 
  LayoutDashboard, 
  Target, 
  Gift, 
  Users, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  Loader2,
  Building2,
  Activity,
  CheckCircle2,
  Maximize2,
  Flame,
  /* Added Zap icon import to fix the "Cannot find name 'Zap'" error */
  Zap
} from 'lucide-react';

interface BrandDashboardProps {
  onBack?: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<any>(null);
  const [stats, setStats] = useState({
    activeMissions: 0,
    totalMissions: 0,
    redeemedVouchers: 0,
    rcDistributed: 0,
    engagement: 0,
    mediaValue: "₹0"
  });

  const handleLogout = async () => {
    await auth.signOut();
    if (onBack) onBack();
  };

  useEffect(() => {
    const fetchBrandGrid = async () => {
      const user = auth.currentUser;
      if (!user?.email || !supabase) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Brand Profile
        const { data: brandData, error: bError } = await supabase
          .from('partner_brands')
          .select('*')
          .eq('brand_email', user.email)
          .single();

        if (bError) throw bError;
        setBrand(brandData);

        // 2. Fetch Missions & Rewards
        const [missionsRes, rewardsRes] = await Promise.all([
          supabase.from('missions').select('*').eq('brand_id', brandData.id),
          supabase.from('rewards').select('*').eq('brand_id', brandData.id)
        ]);

        const missions = missionsRes.data || [];
        const rewards = rewardsRes.data || [];

        // 3. Calculate Operational Stats
        const activeMissions = missions.filter(m => m.status === 'active' || !m.status).length;
        const totalDist = rewards.length * 500; // Mock calculation as requested
        const engagementScore = missions.length * 12; // Mock logic as requested
        const estMediaValue = (engagementScore * 1250).toLocaleString();

        setStats({
          activeMissions,
          totalMissions: missions.length,
          redeemedVouchers: rewards.length,
          rcDistributed: totalDist,
          engagement: engagementScore,
          mediaValue: `₹${estMediaValue}`
        });

      } catch (err) {
        console.error("BRAND_PORTAL_SYNC_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandGrid();
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
            Your credentials are not linked to a verified Brand Identity Node. Please contact Reelywood Terminal support.
          </p>
          <button onClick={handleLogout} className="w-full bg-black text-white py-5 font-black uppercase text-xs tracking-widest border-[4px] border-black shadow-[6px_6px_0px_0px_#ffde59]">Return to Studio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-lexend">
      {/* STICKY HEADER */}
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
        {/* OVERVIEW HERO */}
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
             <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-4 italic">Est. Media Value</p>
             <h3 className="text-6xl font-black italic font-display text-[#ffde59] tracking-tighter">{stats.mediaValue}</h3>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-[#ffde59] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-transform">
              <Zap size={24} strokeWidth={3} className="text-black" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">Active Missions</p>
            <h3 className="text-4xl font-black italic font-display">{stats.activeMissions} <span className="text-xs opacity-30 text-black">/ {stats.totalMissions}</span></h3>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-[#834bf1] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:-rotate-6 transition-transform text-white">
              <Wallet size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">RC Distributed</p>
            <h3 className="text-4xl font-black italic font-display">{stats.rcDistributed.toLocaleString()}</h3>
          </div>

          <div className="bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-black border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#834bf1] group-hover:scale-110 transition-transform text-white">
              <Users size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-2 italic">Verified Agents</p>
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

        {/* LOGS & ACTIONS */}
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 bg-white border-[6px] border-black p-10 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black italic uppercase font-display flex items-center gap-4">
                <Activity size={28} className="text-[#834bf1]" /> Mission Activity Log
              </h3>
              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 border-2 border-black italic">Recent Signals</span>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b-4 border-slate-50 pb-6 last:border-0 hover:bg-slate-50 transition-colors px-4 -mx-4 group/row">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden group-hover/row:rotate-3 transition-transform">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i + 42}`} className="w-full h-full object-cover" alt="Agent" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase italic tracking-tight">Agent Submission Verified</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase text-[#834bf1] tracking-widest">GRID_NODE_A{i}09</span>
                        <div className="w-1 h-1 bg-black/20 rounded-full"></div>
                        <span className="text-[9px] font-bold text-black/40 uppercase">{i * 2}h ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 italic">+500 RC</p>
                      <p className="text-[7px] font-bold uppercase opacity-30">Payout</p>
                    </div>
                    <button className="p-3 bg-black text-white border-[3px] border-black hover:bg-[#ffde59] hover:text-black transition-all shadow-[3px_3px_0px_0px_#834bf1] group-hover/row:translate-x-1">
                      <Maximize2 size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
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
                  <ArrowUpRight size={14} className="group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                </button>
                <button className="flex items-center justify-between w-full bg-slate-50 border-[3px] border-black p-4 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors text-left group/action">
                  <span>Asset Repository</span>
                  <ArrowUpRight size={14} className="group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
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
