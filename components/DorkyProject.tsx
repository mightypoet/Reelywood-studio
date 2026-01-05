
import React from 'react';
import { Sparkles, Search, Zap, ArrowRight, Brain } from 'lucide-react';

export const DorkyProject: React.FC = () => {
  return (
    <section id="explore" className="py-32 px-4 lg:px-6 bg-white dark:bg-[#0a0a0a] scroll-mt-24 transition-colors duration-500 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white dark:bg-[#111] border-[6px] border-black dark:border-white p-8 lg:p-20 relative overflow-hidden shadow-[20px_20px_0px_0px_#ffde59] dark:shadow-[20px_20px_0px_0px_#834bf1]">
          
          {/* Decorative Corner Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#834bf1] border-l-[6px] border-b-[6px] border-black dark:border-white translate-x-12 -translate-y-12 rotate-45"></div>

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-12">
              <div className="inline-flex items-center space-x-3 bg-[#834bf1] border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-left-4">
                <Brain size={16} className="text-[#ffde59] animate-pulse" />
                <span>Proprietary Labs Experiment</span>
              </div>

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-7xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase font-display italic leading-none">
                  Dorky.<span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">ai</span>
                </h2>
                <p className="text-xl text-black/70 dark:text-white/70 leading-tight font-black uppercase italic border-l-[6px] border-[#ffde59] pl-8 max-w-lg">
                  Advanced internet dorking and lead intelligence for the modern SME. <span className="bg-[#ffde59] text-black px-2">Autonomous Discovery</span> at scale.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="group p-8 bg-[#ffde59] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] transition-all hover:-translate-y-2 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_#000] cursor-default animate-in fade-in zoom-in duration-700 delay-100">
                  <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:rotate-6 transition-transform">
                    <Search className="text-[#834bf1]" size={24} strokeWidth={3} />
                  </div>
                  <h4 className="text-black font-black text-xs uppercase tracking-[0.2em] mb-2">Deep Dorking</h4>
                  <p className="text-black/60 text-[10px] font-black uppercase tracking-widest leading-none">Automated intelligence gathering protocol.</p>
                </div>

                <div className="group p-8 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#000] transition-all hover:-translate-y-2 hover:translate-x-1 hover:shadow-[12px_12px_0px_0px_#834bf1] cursor-default animate-in fade-in zoom-in duration-700 delay-200">
                  <div className="w-12 h-12 bg-[#834bf1] border-[3px] border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000] group-hover:-rotate-6 transition-transform">
                    <Zap className="text-[#ffde59]" size={24} strokeWidth={3} />
                  </div>
                  <h4 className="text-black font-black text-xs uppercase tracking-[0.2em] mb-2">Real-time</h4>
                  <p className="text-black/60 text-[10px] font-black uppercase tracking-widest leading-none">Instant surface of high-intent opportunities.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-4">
                <button disabled className="w-full sm:w-auto bg-black/10 text-black/30 px-12 py-6 border-[3px] border-black font-black text-[10px] uppercase tracking-[0.4em] cursor-not-allowed transition-all">
                  <span>Protocol: Pending</span>
                </button>
                <button className="group text-black dark:text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center space-x-3 hover:text-[#834bf1] transition-colors">
                  <span className="border-b-[3px] border-black dark:border-white group-hover:border-[#834bf1]">Archive Documentation</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="flex justify-center animate-in fade-in zoom-in duration-1000">
              <div className="w-full max-w-[420px] aspect-square bg-white dark:bg-black border-[6px] border-black dark:border-white shadow-[16px_16px_0px_0px_#834bf1] flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                 <div className="text-[140px] group-hover:scale-110 transition-transform cursor-default select-none drop-shadow-[8px_8px_0px_#ffde59]">🤓</div>
                 
                 {/* Floating Neobrutalist Data Tags */}
                 <div className="absolute top-10 right-10 animate-bounce">
                    <div className="bg-[#ffde59] text-black px-6 py-3 border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      Leads: +4.2k
                    </div>
                 </div>

                 <div className="absolute bottom-10 left-10">
                    <div className="bg-[#834bf1] text-white px-6 py-3 border-[3px] border-black font-black uppercase text-[10px] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      Sync: Active
                    </div>
                 </div>

                 <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-black/10 dark:bg-white/10 group-hover:bg-[#ffde59]/20 transition-colors"></div>
                 <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-[2px] bg-black/10 dark:bg-white/10 group-hover:bg-[#834bf1]/20 transition-colors"></div>
                 
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-3 border-[2px] border-white font-black text-[9px] uppercase tracking-[0.5em] shadow-[4px_4px_0px_0px_#ffde59]">
                    Experiment v1.2
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
