
import React from 'react';
import { Sparkles, Search, Zap, ArrowRight } from 'lucide-react';

export const DorkyProject: React.FC = () => {
  return (
    <section id="explore" className="py-32 px-4 lg:px-6 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#FEEFC3] rounded-[48px] lg:rounded-[64px] p-8 lg:p-20 relative overflow-hidden border border-[#FDDDC8] shadow-sm">
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-10">
              <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-[#202124] font-bold text-[10px] uppercase tracking-[0.3em] shadow-sm">
                <Sparkles size={14} className="text-amber-600" />
                <span>Labs Experiment</span>
              </div>

              <div className="space-y-6">
                <h2 className="text-6xl font-black text-[#202124] tracking-tighter">Dorky.ai</h2>
                <p className="text-lg text-[#5F6368] leading-relaxed max-w-lg font-medium">
                  An internally developed AI tool by Reelywood, crafted specifically for SMEs. <span className="text-[#202124] font-bold">Dorky.ai</span> enables intelligent internet dorking and lead generation.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-[28px] border border-white/40 shadow-sm">
                  <Search className="text-[#1A73E8] mb-3" size={24} />
                  <h4 className="text-[#202124] font-bold text-xs uppercase tracking-widest">Deep Dorking</h4>
                  <p className="text-[#5F6368] text-[10px] font-bold uppercase mt-1">Discover leads without manual research.</p>
                </div>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-[28px] border border-white/40 shadow-sm">
                  <Zap className="text-[#1A73E8] mb-3" size={24} />
                  <h4 className="text-[#202124] font-bold text-xs uppercase tracking-widest">Real-time</h4>
                  <p className="text-[#5F6368] text-[10px] font-bold uppercase mt-1">Surface opportunities instantly.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button disabled className="w-full sm:w-auto bg-slate-200 text-slate-500 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest cursor-not-allowed shadow-sm border border-slate-300 flex items-center justify-center space-x-2">
                  <span>Coming Soon</span>
                </button>
                <button className="text-[#5F6368] font-bold text-xs uppercase tracking-widest hover:text-[#202124] transition-colors">
                  Tool Log Documentation
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[400px] aspect-square bg-white rounded-[40px] shadow-xl border border-white/60 flex flex-col items-center justify-center relative overflow-hidden group">
                 <div className="text-9xl group-hover:scale-110 transition-transform cursor-default">🤓</div>
                 <div className="absolute top-8 right-8 animate-bounce">
                    <div className="bg-[#CCF6E4] text-[#202124] px-4 py-2 rounded-2xl rounded-tr-none text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Leads Found: +42
                    </div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#202124] text-white px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">
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
