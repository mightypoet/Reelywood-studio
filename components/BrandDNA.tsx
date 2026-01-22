
import React from 'react';
import { Cpu, Zap, Fingerprint, Network, Sparkles, Binary } from 'lucide-react';

export const BrandDNA: React.FC = () => {
  const pillars = [
    {
      id: "neural",
      title: "Neural Mapping",
      icon: <Network className="text-white" />,
      desc: "We map your brand's narrative DNA into our proprietary AI nodes for consistent content generation.",
      bg: "bg-[#834bf1]"
    },
    {
      id: "human",
      title: "Human Edge",
      icon: <Fingerprint className="text-black" />,
      desc: "Our creative directors oversee every AI output, ensuring the soul of your brand is never lost.",
      bg: "bg-[#ffde59]"
    },
    {
      id: "velocity",
      title: "Market Velocity",
      icon: <Zap className="text-white" />,
      desc: "Deploy campaigns at 10x speed. We bridge the gap between creative concept and market saturation.",
      bg: "bg-black"
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative border-t-[4px] border-black dark:border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-center">
          <div className="lg:col-span-5 space-y-8 md:space-y-12 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-5 py-2 rounded-none text-white font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#ffde59]">
              <Binary size={14} className="text-[#ffde59] animate-pulse" />
              <span>Brand DNA Protocol</span>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white leading-[0.9] md:leading-none tracking-tighter font-display uppercase italic">
                Synthetic <br />
                <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#000] md:drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[3px_3px_0px_#fff]">Symmetry</span>
              </h2>
              <p className="text-lg md:text-xl text-black/60 dark:text-white/60 font-black uppercase italic tracking-tight border-l-[6px] md:border-l-[8px] border-black dark:border-white pl-6 md:pl-8 text-left">
                Where high-fidelity creativity meets algorithmic precision. We don't just market; we engineer brand dominance.
              </p>
            </div>

            <div className="space-y-3 md:space-y-4 text-left">
               {[
                 "Autonomous Asset Production",
                 "Surgical Market Analysis",
                 "Empathy-Driven AI Training"
               ].map((item, i) => (
                 <div key={i} className="flex items-center space-x-3 md:space-x-4 group">
                    <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] border-black bg-[#ffde59] flex items-center justify-center shadow-[3px_3px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] group-hover:rotate-12 transition-transform shrink-0">
                       <Sparkles size={14} className="md:w-4 md:h-4" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black dark:text-white">{item}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {pillars.map((pillar, i) => (
              <div 
                key={pillar.id}
                className={`${pillar.bg} border-[4px] border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_#000] md:shadow-[10px_10px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#834bf1] group hover:-translate-x-1 hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[280px] md:h-[320px] ${i === 2 ? 'md:col-span-2' : ''}`}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] md:shadow-[4px_4px_0px_0px_#000] group-hover:scale-110 transition-transform">
                   {/* @ts-ignore */}
                   {React.cloneElement(pillar.icon as React.ReactElement, { className: "text-black w-6 h-6 md:w-8 md:h-8" } as any)}
                </div>
                <div className="space-y-3 md:space-y-4">
                   <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight italic font-display ${pillar.bg === 'bg-[#ffde59]' ? 'text-black' : 'text-white'}`}>
                    {pillar.title}
                   </h3>
                   <p className={`text-[10px] md:text-[11px] font-bold uppercase tracking-widest leading-relaxed ${pillar.bg === 'bg-[#ffde59]' ? 'text-black/60' : 'text-white/60'}`}>
                    {pillar.desc}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
