
import React from 'react';
import { ChevronRight, Circle, Cpu, Network, Zap, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export const Engagement: React.FC = () => {
  const steps = [
    { name: "Consultation", icon: <Network size={24} strokeWidth={3} />, desc: "Deep-dive analysis", color: "bg-[#834bf1]", textColor: "text-white" },
    { name: "Strategy", icon: <Target size={24} strokeWidth={3} />, desc: "Neural mapping", color: "bg-[#ffde59]", textColor: "text-black" },
    { name: "Setup", icon: <Cpu size={24} strokeWidth={3} />, desc: "Architecture build", color: "bg-white", textColor: "text-black" },
    { name: "Execution", icon: <Zap size={24} strokeWidth={3} />, desc: "Live integration", color: "bg-black", textColor: "text-white" },
    { name: "Scale", icon: <TrendingUp size={24} strokeWidth={3} />, desc: "Exponential growth", color: "bg-[#834bf1]", textColor: "text-white" }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden relative border-t-[4px] border-black dark:border-white transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-black border-[3px] border-black dark:border-white px-6 py-2 rounded-none text-black dark:text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#ffde59]">
            <Sparkles size={14} className="text-[#834bf1]" />
            <span>Operational Logic</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter leading-none uppercase font-display italic">
            Your Brand's <br className="md:hidden" />
            <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Growth Journey</span>
          </h2>
          
          <p className="text-black/60 dark:text-white/60 font-black uppercase tracking-[0.2em] max-w-2xl mx-auto text-xs md:text-sm italic">
            Our multi-stage deployment framework leverages collaborative intelligence to scale your market presence with surgical precision.
          </p>
        </div>

        {/* Infographic Container */}
        <div className="relative py-12">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[84px] left-[5%] right-[5%] h-[4px] bg-black dark:bg-white z-0">
            <div className="absolute top-0 left-0 h-full w-32 bg-[#ffde59] border-x-[2px] border-black animate-data-flow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="relative flex flex-col items-center group animate-in fade-in zoom-in duration-700"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Node - Neobrutalist Square */}
                <div className="relative z-10 mb-10">
                  <div className={`w-24 h-24 ${step.color} ${step.textColor} border-[4px] border-black dark:border-white flex items-center justify-center shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] transition-all duration-300 group-hover:-translate-y-3 group-hover:translate-x-1 group-hover:shadow-[16px_16px_0px_0px_#834bf1] group-hover:rotate-3`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#ffde59] text-black border-[3px] border-black font-black text-xs flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110 group-hover:-translate-y-1">
                    0{i + 1}
                  </div>
                </div>

                {/* Content Card */}
                <div className="text-center space-y-3 bg-white dark:bg-[#111] border-[3px] border-black dark:border-white p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] group-hover:shadow-[10px_10px_0px_0px_#ffde59] transition-all duration-300 w-full max-w-[200px] hover:-translate-y-1">
                  <h3 className="text-black dark:text-white font-black text-sm uppercase tracking-[0.1em] font-display italic leading-none">
                    {step.name}
                  </h3>
                  <div className="h-[2px] w-8 bg-[#834bf1] mx-auto"></div>
                  <p className="text-black/60 dark:text-white/40 text-[9px] font-black uppercase tracking-widest leading-tight">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Connector */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden mt-12 w-[4px] h-12 bg-black dark:bg-white shadow-[3px_0px_0px_#ffde59]"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 text-center animate-in fade-in slide-in-from-top-8 duration-700">
           <button className="group relative inline-flex items-center space-x-6 bg-[#ffde59] text-black px-12 py-6 border-[4px] border-black shadow-[10px_10px_0px_0px_#000] dark:shadow-[10px_10px_0px_0px_#fff] font-black text-xs uppercase tracking-[0.4em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2">
              <span className="relative z-10 italic font-display">Initiate Consultation</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
           </button>
           <p className="mt-10 text-[10px] font-black uppercase tracking-[0.6em] text-black/30 dark:text-white/20">
             Mission Control • Deployment Stage: Ready
           </p>
        </div>
      </div>

      <style>{`
        @keyframes data-flow {
          0% { left: 0%; transform: translateX(-100%); }
          100% { left: 100%; transform: translateX(0%); }
        }
        .animate-data-flow {
          animation: data-flow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
};
