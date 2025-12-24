
import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-slate-50 overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square bg-white rounded-[4rem] shadow-2xl overflow-hidden p-4 relative group">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" 
                className="w-full h-full object-cover rounded-[3rem]" 
                alt="Strategic Planning" 
              />
              <div className="absolute inset-0 bg-indigo-600/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl max-w-xs">
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">Human + AI</h3>
              <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-wider">The perfect symbiosis for modern brand growth.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">About Reelywood</h4>
              <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">Built for Growth. Engineered for Value.</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Reelywood is a lean, dynamic marketing company built on <span className="text-slate-900 font-bold">Human + AI collaboration</span>. We don't just execute tasks; we exist to serve value.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Founded by two dedicated co-founders with a singular focus: understanding how brands connect, engage, and convert. We dive deep into the psychology of your customers to build ecosystems that scale.
              </p>
            </div>
            
            <div className="pt-8 border-t border-slate-200">
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">R</div>
                  <div>
                    <p className="text-slate-900 font-black text-sm uppercase tracking-widest">REELYWOODSTUDIO</p>
                    <p className="text-slate-500 text-xs">Serving value beyond execution.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
