
import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

export const CTA: React.FC = () => {
  return (
    <section id="contact" className="py-24 px-6 scroll-mt-24">
      <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] overflow-hidden relative shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
        <div className="relative z-10 text-center p-12 lg:p-24 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
              Ready to automate <br /> your brand's growth?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
              Partner with the best. Design the future now. Schedule your free consultation audit.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-600/30">
              <Calendar size={18} />
              <span>Book a Consultation</span>
            </button>
            <button className="w-full sm:w-auto bg-white/5 text-white border border-white/10 px-10 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center space-x-3">
              <span>Read Case Studies</span>
              <ArrowRight size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">100% Trusted • High Impact • ROI Driven</p>
        </div>
      </div>
    </section>
  );
};
