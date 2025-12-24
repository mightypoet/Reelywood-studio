
import React from 'react';
import { ChevronRight, Circle, Cpu, Network, Zap, Target, TrendingUp } from 'lucide-react';

export const Engagement: React.FC = () => {
  const steps = [
    { name: "Consultation", icon: <Network size={20} />, desc: "Deep-dive analysis" },
    { name: "Strategy", icon: <Target size={20} />, desc: "Neural mapping" },
    { name: "Setup", icon: <Cpu size={20} />, desc: "Architecture build" },
    { name: "Execution", icon: <Zap size={20} />, desc: "Live integration" },
    { name: "Scale", icon: <TrendingUp size={20} />, desc: "Exponential growth" }
  ];

  return (
    <section className="py-32 bg-[#05070a] overflow-hidden relative border-y border-white/5">
      {/* Background Neural Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/3 left-3/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
            <Network size={14} />
            <span>Operational Logic</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-none tracking-tight">
            Your Brand's <span className="text-indigo-500">Growth Journey</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm lg:text-base">
            Our multi-stage deployment framework leverages collaborative intelligence to scale your market presence.
          </p>
        </div>

        {/* Infographic Container */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent">
            <div className="absolute top-0 left-0 h-full w-20 bg-indigo-400 blur-sm animate-data-flow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center group">
                {/* Node */}
                <div className="w-24 h-24 mb-8 relative">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-indigo-500/50 transition-colors duration-500 group-hover:scale-110"></div>
                  {/* Glass Circle */}
                  <div className="absolute inset-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:text-indigo-400 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                    {step.icon}
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#05070a]">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
                  <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">
                    {step.name}
                  </h3>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-none">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Connector */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden mt-12 w-[1px] h-12 bg-gradient-to-b from-indigo-500/50 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 text-center">
          <button className="relative px-10 py-5 group">
            <div className="absolute inset-0 bg-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white text-slate-900 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:bg-indigo-600 hover:text-white transform active:scale-95">
              Initiate Consultation
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes data-flow {
          0% { left: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-data-flow {
          animation: data-flow 3s linear infinite;
        }
      `}</style>
    </section>
  );
};
