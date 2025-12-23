
import React from 'react';
import { Sparkles, Laugh, Zap, Ghost, ArrowRight, MessageCircleCode } from 'lucide-react';

export const DorkyProject: React.FC = () => {
  const projectUrl = "https://ai.studio/apps/drive/1ADN_-Zboj_qC7A9xIddpin-IK_QXNaoT";

  return (
    <section className="py-24 relative bg-slate-900 overflow-hidden rounded-[3rem] mx-4 sm:mx-8 my-12">
      {/* Animated Glow Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full text-amber-500 font-bold text-xs uppercase tracking-[0.2em]">
              <Laugh size={14} />
              <span>Agency Spotlight Project</span>
            </div>

            <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight">
              Meet <a 
                href={projectUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 hover:scale-105 transition-transform inline-block"
              >
                Dorky.ai
              </a>
            </h2>

            <p className="text-slate-400 text-xl leading-relaxed">
              Why settle for a boring "Corporate AI"? We built Dorky.ai to inject humor, personality, and human-like wit into your customer interactions. It's the AI that your customers will actually <span className="text-white italic">want</span> to talk to.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group">
                <Ghost className="text-amber-400 mb-4 group-hover:animate-bounce" size={28} />
                <h4 className="text-white font-bold mb-2 text-lg">Anti-Corporate Tone</h4>
                <p className="text-slate-500 text-sm">Perfect for lifestyle brands, startups, and gen-z audiences.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group">
                <MessageCircleCode className="text-indigo-400 mb-4 group-hover:animate-pulse" size={28} />
                <h4 className="text-white font-bold mb-2 text-lg">Smart Roasting</h4>
                <p className="text-slate-500 text-sm">Playful engagement that creates viral, shareable brand moments.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a 
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 px-8 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <span>Try Dorky.ai Now</span>
                <ArrowRight size={20} />
              </a>
              <div className="flex items-center space-x-3 text-slate-400 font-medium">
                <div className="flex -space-x-2">
                   <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-white">🔥</div>
                   <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-white">✨</div>
                </div>
                <span>Available for Integration</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <a 
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group cursor-pointer"
            >
              {/* The "Dorky" Visual Character Container */}
              <div className="w-80 h-80 lg:w-[450px] lg:h-[450px] bg-gradient-to-br from-amber-500 to-indigo-600 rounded-[4rem] flex items-center justify-center relative shadow-2xl animate-pulse-subtle group-hover:scale-[1.02] transition-transform">
                <div className="absolute inset-4 bg-slate-900 rounded-[3rem] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                   <div className="text-8xl mb-6 transform group-hover:rotate-12 transition-transform select-none">🤓</div>
                   <div className="space-y-2">
                      <div className="h-4 w-32 bg-white/10 rounded-full mx-auto animate-pulse"></div>
                      <div className="h-4 w-24 bg-white/5 rounded-full mx-auto"></div>
                   </div>
                   
                   {/* Chat Bubble Simulation */}
                   <div className="absolute top-10 right-0 bg-white p-4 rounded-2xl rounded-tr-none shadow-xl transform rotate-3 animate-float-slow">
                      <p className="text-slate-900 text-xs font-black">"I'm not a regular AI, I'm a cool AI."</p>
                   </div>
                   
                   <div className="absolute bottom-10 left-0 bg-indigo-500 p-4 rounded-2xl rounded-bl-none shadow-xl transform -rotate-3 animate-float-medium">
                      <p className="text-white text-xs font-bold">Error 404: Social skills not found.</p>
                   </div>
                </div>
              </div>
              
              {/* Decorative Floating Elements */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center animate-bounce-slow">
                 <Zap className="text-amber-400" size={32} />
              </div>
              
              <div className="absolute -bottom-4 right-1/2 translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Click to Open App
              </div>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.01); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 5s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
};
