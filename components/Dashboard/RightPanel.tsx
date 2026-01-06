
import React from 'react';
import { Target, Calendar, ArrowRight, Zap, CheckCircle2, Clock, MapPin, Instagram, Sparkles } from 'lucide-react';

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
      color: "bg-[#834bf1]"
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
      color: "bg-[#ffde59]"
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
      color: "bg-white"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-3 bg-black border-[2px] border-black px-4 py-1.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#834bf1]">
            <Target size={14} className="text-[#ffde59]" />
            <span>Operational Grid</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter uppercase font-display italic leading-none">
            Mission <br className="sm:hidden" /> Control
          </h2>
        </div>
        
        <div className="bg-[#ffde59] border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_#000] flex items-center space-x-4">
          <div className="w-3 h-3 bg-red-600 border-[2px] border-black animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Live: 3 Modules</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className={`group bg-white dark:bg-[#111] border-[4px] border-black dark:border-white p-8 transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#834bf1] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] relative overflow-hidden ${status !== 'approved' ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
              <div className="flex items-start space-x-6">
                <div className={`w-16 h-16 ${mission.color} ${mission.brand === 'Reelywood Labs' ? 'text-black' : mission.color === 'bg-white' ? 'text-black' : 'text-white'} border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-all`}>
                  {mission.icon}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1 border border-black">{mission.brand}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border-[2px] border-black ${
                      mission.status === 'Completed' ? 'bg-emerald-500 text-white' : 
                      mission.status === 'Accepted' ? 'bg-[#834bf1] text-white' : 'bg-[#ffde59] text-black'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-black dark:text-white tracking-tight font-display italic uppercase">{mission.title}</h3>
                  <p className="text-black/60 dark:text-white/60 text-xs font-bold leading-relaxed max-w-lg uppercase tracking-tight">
                    {mission.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-8 bg-slate-50 dark:bg-white/5 border-[3px] border-black dark:border-white p-6 shadow-[4px_4px_0px_0px_#000]">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/30 mb-1">Incentive</p>
                  <p className="text-2xl font-black text-[#834bf1] italic">+{mission.reward} RC</p>
                </div>
                <div className="hidden lg:block w-full h-[2px] bg-black/10 dark:bg-white/10"></div>
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/30 mb-1">Cutoff</p>
                  <p className="text-xs font-black text-black dark:text-white uppercase tracking-widest">{mission.deadline}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t-[3px] border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 border-[3px] border-black bg-white overflow-hidden shadow-[3px_3px_0px_#000]">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=creator${i}`} alt="Creator" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 italic">+9 Active Agents</span>
              </div>
              
              <button className="flex items-center justify-center space-x-4 bg-black text-white px-8 py-5 border-[3px] border-black shadow-[6px_6px_0px_0px_#834bf1] font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 group/btn">
                <span>View Mission Brief</span>
                <ArrowRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        ))}

        {status !== 'approved' && (
          <div className="bg-[#ffde59] border-[4px] border-black p-12 text-center shadow-[12px_12px_0px_0px_#000]">
            <Sparkles size={48} className="text-black/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-black uppercase tracking-tight font-display italic">Missions Encrypted</h3>
            <p className="text-black/60 text-xs font-black uppercase tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">
              Assignments and rewards will authorize once your <span className="text-[#834bf1]">Identity Sync</span> is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
