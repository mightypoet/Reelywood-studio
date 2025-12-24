
import React from 'react';

export const Trust: React.FC = () => {
  const metrics = [
    { value: "4.5X", label: "ROAS", desc: "Average Return on Ad Spend for active campaigns." },
    { value: "18%", label: "AOV Increase", desc: "Average Order Value lift through upsell funnels." },
    { value: "450%", label: "Visibility", desc: "Increase in Google Maps & local search discovery." },
    { value: "20+", label: "Projects", desc: "High-impact brand ecosystems delivered globally." }
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((stat, i) => (
            <div key={i} className="text-center p-8 bg-indigo-50/20 rounded-[2.5rem] border border-indigo-50/50 hover:bg-white hover:shadow-xl transition-all group">
              <p className="text-4xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform">{stat.value}</p>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">{stat.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] mb-8">Trusted by</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
             <span className="text-xl font-black italic tracking-tighter">F&B LEADERS</span>
             <span className="text-xl font-black italic tracking-tighter">PREMIUM D2C</span>
             <span className="text-xl font-black italic tracking-tighter">FINTECH TOP</span>
             <span className="text-xl font-black italic tracking-tighter">E-COMMERCE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
