
import React from 'react';
import { Target, Calendar, ArrowRight, Zap, CheckCircle2, Clock, MapPin, Instagram } from 'lucide-react';

interface RightPanelProps {
  status: 'none' | 'pending' | 'approved' | 'rejected';
}

export const RightPanel: React.FC<RightPanelProps> = ({ status }) => {
  const missions = [
    {
      id: 1,
      title: "Collab with Cabin17A",
      brand: "Cabin17A",
      desc: "Produce 1 Instagram Reel showcasing the vibe and decor of Cabin17A for our upcoming launch campaign.",
      reward: 500,
      deadline: "Oct 25, 2024",
      status: "Assigned",
      icon: <Instagram size={20} />,
      color: "border-indigo-500/20 bg-indigo-50/30"
    },
    {
      id: 2,
      title: "Reelywood App Awareness",
      brand: "Reelywood Labs",
      desc: "Create a tutorial Reel + Story showing how creators can use the Dorky.ai tool for lead generation.",
      reward: 250,
      deadline: "Oct 28, 2024",
      status: "Accepted",
      icon: <Zap size={20} />,
      color: "border-purple-500/20 bg-purple-50/30"
    },
    {
      id: 3,
      title: "Kolkata Café Feature",
      brand: "Flurys x Reelywood",
      desc: "Short 15-30s Reel capturing the breakfast heritage. Focus on lighting and slow-pan shots.",
      reward: 150,
      deadline: "Nov 02, 2024",
      status: "Completed",
      icon: <MapPin size={20} />,
      color: "border-emerald-500/20 bg-emerald-50/30"
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">
            <Target size={14} />
            <span>Operational Center</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Missions Control</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex items-center space-x-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">3 Active Modules</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className={`group bg-white dark:bg-white/[0.03] rounded-[2.5rem] border-2 border-slate-200 dark:border-white/5 p-8 transition-all hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden ${status !== 'approved' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {mission.icon}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-500 dark:text-white/40">{mission.brand}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                      mission.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                      mission.status === 'Accepted' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{mission.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
                    {mission.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 mb-1">Reward</p>
                  <p className="text-2xl font-black text-amber-500">+{mission.reward} RC</p>
                </div>
                <div className="h-10 w-px bg-slate-100 dark:bg-white/10 lg:hidden"></div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20 mb-1">Deadline</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{mission.deadline}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-slate-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i}`} alt="Creator" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">12 Creators Assigned</span>
              </div>
              
              <button className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                <span>View Brief</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {status !== 'approved' && (
          <div className="bg-slate-100 dark:bg-white/5 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10">
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Missions Locked</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Missions and rewards will become available once your Identity Node is approved.</p>
          </div>
        )}
      </div>
    </div>
  );
};
