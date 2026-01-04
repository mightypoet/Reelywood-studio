
import React, { useState } from 'react';
import { 
  Briefcase, Clock, Zap, ArrowRight, CheckCircle2, 
  MapPin, Gift, Timer, Users, TrendingUp 
} from 'lucide-react';

interface Mission {
  id: string;
  brand: string;
  task: string;
  reward: number;
  deadline: string;
  status: 'available' | 'accepted' | 'completed';
  location?: string;
}

const DEMO_MISSIONS: Mission[] = [
  {
    id: 'm1',
    brand: 'Cabin17A',
    task: 'Create 1 Instagram Reel highlighting the coffee aesthetics.',
    reward: 500,
    deadline: '7 Days',
    status: 'available',
    location: 'Ballygunge, Kolkata'
  },
  {
    id: 'm2',
    brand: 'Reelywood Studio',
    task: 'App Awareness Campaign - 1 Reel + 2 Story sequences.',
    reward: 250,
    deadline: '14 Days',
    status: 'accepted',
  },
  {
    id: 'm3',
    brand: 'Local Brews',
    task: 'Short 15s Cinematic B-roll for TikTok/Reels.',
    reward: 150,
    deadline: '2 Days',
    status: 'available',
    location: 'Park Street'
  }
];

export const MissionsPanel: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>(DEMO_MISSIONS);

  const handleAction = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        if (m.status === 'available') return { ...m, status: 'accepted' };
        if (m.status === 'accepted') return { ...m, status: 'completed' };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 text-purple font-black text-[10px] uppercase tracking-[0.5em]">
            <Zap size={14} className="animate-pulse" />
            <span>Active Deployments</span>
          </div>
          <h2 className="text-5xl font-black uppercase tracking-tighter">Your Missions</h2>
        </div>
        <div className="flex items-center space-x-3 bg-black text-white px-6 py-4 border-[3px] border-black">
           <Gift className="text-[#ffde59]" />
           <div className="flex flex-col">
              <span className="text-xl font-black leading-none">1,250</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Total ReelCoins</span>
           </div>
        </div>
      </div>

      <div className="grid gap-8">
        {missions.map((mission) => (
          <div 
            key={mission.id}
            className={`
              relative group border-[4px] border-black p-8 lg:p-10 transition-all
              ${mission.status === 'completed' ? 'bg-slate-50 border-black/20' : 'bg-white shadow-[12px_12px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}
            `}
          >
            {mission.status === 'completed' && (
              <div className="absolute top-8 right-8 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-slate-100 border-[3px] border-black flex items-center justify-center">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase leading-none">{mission.brand}</h3>
                    <div className="flex items-center space-x-3 mt-2">
                       {mission.location && (
                        <span className="flex items-center space-x-1 text-[10px] font-black text-black/40 uppercase tracking-widest">
                          <MapPin size={10} />
                          <span>{mission.location}</span>
                        </span>
                       )}
                       <span className={`text-[10px] font-black uppercase tracking-widest ${mission.status === 'accepted' ? 'text-amber-500' : 'text-purple'}`}>
                         • {mission.status}
                       </span>
                    </div>
                  </div>
                </div>

                <p className="text-lg font-bold text-black/70 leading-relaxed">
                  {mission.task}
                </p>

                <div className="flex flex-wrap items-center gap-8 pt-4">
                  <div className="flex items-center space-x-3">
                    <Timer size={18} className="text-black/40" />
                    <div>
                      <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Deadline</p>
                      <p className="text-sm font-black uppercase">{mission.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp size={18} className="text-black/40" />
                    <div>
                      <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Reward</p>
                      <p className="text-sm font-black uppercase text-purple">{mission.reward} ReelCoins</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-end lg:w-64">
                {mission.status !== 'completed' && (
                  <button 
                    onClick={() => handleAction(mission.id)}
                    className={`
                      w-full py-5 border-[3px] border-black font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-3
                      ${mission.status === 'accepted' ? 'bg-[#ffde59] text-black shadow-[6px_6px_0px_#000]' : 'bg-black text-white shadow-[6px_6px_0px_#834bf1]'}
                      active:translate-x-1 active:translate-y-1 active:shadow-none
                    `}
                  >
                    <span>{mission.status === 'available' ? 'Accept Mission' : 'Submit Works'}</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t-[4px] border-black flex items-center justify-between">
         <p className="text-xs font-black uppercase tracking-[0.4em] text-black/30">Protocol v4.0 Active</p>
         <button className="text-[10px] font-black uppercase tracking-widest hover:text-purple transition-colors">Archive Deployments</button>
      </div>
    </div>
  );
};
