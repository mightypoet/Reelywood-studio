
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const stats = [
    { label: "Lead Gain", value: "4.7X", desc: "Via full-funnel architecture", color: "text-indigo-500" },
    { label: "Conversion Rate", value: "2.5X", desc: "Via landing page overhaul", color: "text-emerald-500" },
    { label: "Support Time", value: "-20%", desc: "Reduction in manual tasks", color: "text-amber-500" },
    { label: "Onboarding", value: "+12%", desc: "Improvement in digital flow", color: "text-blue-500" }
  ];

  return (
    <section id="leaderboard" className="py-24 bg-slate-900 rounded-[4rem] mx-4 sm:mx-8 my-12 overflow-hidden relative scroll-mt-24">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em]">Performance Leaderboard</h4>
            <h2 className="text-5xl font-black text-white">Concrete Outcomes</h2>
          </div>
          <p className="text-slate-400 font-bold max-w-sm">We measure success in multipliers, not just percentages.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all group">
              <div className="flex justify-between items-start mb-6">
                 <p className={`text-6xl font-black ${stat.color} group-hover:scale-110 transition-transform tracking-tighter`}>{stat.value}</p>
                 <ArrowUpRight className="text-white/20 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white font-black text-sm uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
