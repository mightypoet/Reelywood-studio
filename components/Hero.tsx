
import React from 'react';
import { ArrowRight, Sparkles, Play, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full gradient-blur pointer-events-none"></div>
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-violet-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-600 font-bold text-sm uppercase tracking-wider animate-bounce-subtle">
              <Sparkles size={16} />
              <span>Future of SME Growth</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Marketing</span> & Growth for SMEs
            </h1>

            <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
              Transform your brand with next-gen AI automation, expert creative strategy, and performance-driven content creation. Scale faster, smarter.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2">
                <span>Start Your Journey</span>
                <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                <Play size={20} className="fill-slate-900" />
                <span>See Our Work</span>
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://picsum.photos/seed/${i + 10}/100/100`} 
                    alt="Client" 
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900">500+ SMEs Scaled</p>
                <p className="text-slate-500">Average 4.8x ROI growth</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Visual Representation of Dashboard/AI */}
            <div className="relative z-10 glass-card p-4 lg:p-6 rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-float">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-indigo-50 rounded-2xl h-64 overflow-hidden relative">
                   <img src="https://picsum.photos/seed/reely/800/600" className="w-full h-full object-cover opacity-80" alt="Dashboard" />
                   <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent"></div>
                   <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">Live Campaign</div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-8 bg-white/40 rounded-full"></div>
                        <div className="w-2 h-12 bg-white/60 rounded-full"></div>
                        <div className="w-2 h-10 bg-white rounded-full"></div>
                      </div>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <Zap size={16} className="text-green-600" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Efficiency</p>
                  <p className="text-xl font-bold text-slate-900">+82%</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                    <Zap size={16} className="text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Reach</p>
                  <p className="text-xl font-bold text-slate-900">1.2M+</p>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 z-20 bg-white p-4 rounded-2xl shadow-xl border animate-bounce-slow">
               <div className="flex items-center space-x-3">
                 <div className="bg-amber-100 p-2 rounded-xl">
                    <Sparkles size={20} className="text-amber-600" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-500">AI Score</p>
                   <p className="text-sm font-bold">98/100</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
