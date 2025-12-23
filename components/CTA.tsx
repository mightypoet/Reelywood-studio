
import React from 'react';
import { Send, Calendar } from 'lucide-react';

export const CTA: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[3rem] overflow-hidden relative shadow-2xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-20">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to automate your brand's growth?
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Schedule a 15-minute audit call with our team. We'll show you exactly where AI can save you time and boost your revenue.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center space-x-2">
                <Calendar size={20} />
                <span>Book Free Audit</span>
              </button>
              <button className="bg-indigo-700/50 text-white border border-indigo-400/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-800 transition-all flex items-center justify-center space-x-2">
                <Send size={20} />
                <span>Send Message</span>
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 bg-white/20 rounded"></div>
                      <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 bg-amber-400 p-6 rounded-full shadow-2xl animate-bounce-subtle">
              <p className="text-indigo-900 font-black text-2xl">ROI+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
