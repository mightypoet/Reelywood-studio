
import React from 'react';
import { ArrowLeft, BookOpen, Target, Zap, Rocket, CheckCircle2 } from 'lucide-react';

interface AcademyViewProps {
  onBack: () => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#05070a] text-white font-['Plus_Jakarta_Sans'] selection:bg-indigo-500/30">
      {/* Header */}
      <nav className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-3 text-white/50 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Studio</span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <span className="font-bold text-[11px] tracking-[0.4em] uppercase text-white/80">ACADEMY</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]">
              <Rocket size={14} className="animate-bounce" />
              <span>Growth Fast-Track</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tighter uppercase">
                Want to fast-track <br className="hidden sm:block" /> 
                your way to 1K <br className="hidden sm:block" />
                and get this card?
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                Join our Academy and learn the exact steps to turn your profile into a brand-magnet.
              </p>
            </div>

            <div className="space-y-8 pt-8">
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">Algorithm Mastery</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Master the narrative hooks and technical triggers that force platforms to push your content.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-2">Authority Building</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Stop posting, start positioning. Build the visual authority brands actually want to pay for.</p>
                </div>
              </div>
            </div>

            <button className="w-full sm:w-auto bg-white text-black px-14 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 transition-transform shadow-2xl shadow-white/10 flex items-center justify-center space-x-4">
              <span>Enroll for course</span>
              <BookOpen size={18} />
            </button>
          </div>

          <div className="relative">
             <div className="absolute -inset-12 bg-indigo-600/20 blur-[120px] rounded-full"></div>
             
             <div className="relative bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 lg:p-16 backdrop-blur-3xl overflow-hidden">
                <div className="space-y-8 relative z-10">
                   <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Play the Game. Win the Brand.</h2>
                   </div>
                   
                   <p className="text-slate-400 text-lg leading-relaxed font-medium">
                      Think of your card as your dashboard. Once approved, you’ll see "Missions" pop up based on your style. Finish a task, get paid, and watch your creator level rise. It’s influencer marketing, gamified.
                   </p>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                         <div className="text-indigo-400 font-black text-2xl mb-1">LEVEL 01</div>
                         <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Current Status</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                         <div className="text-emerald-400 font-black text-2xl mb-1">+₹5k/Task</div>
                         <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Average Reward</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                         <span>Academy Progress</span>
                         <span>0%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-600 w-0 transition-all duration-1000"></div>
                      </div>
                   </div>

                   <div className="flex flex-col space-y-3">
                      {[
                        "Hook & Retention Blueprint",
                        "Niche Authority Framework",
                        "Monetization Node Setup",
                        "Brand Negotiation Protocol"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 text-white/60">
                           <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                           <span className="text-sm font-bold">{item}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.6em]">REELYWOOD ACADEMY • THE NEW CREATOR STANDARD</p>
      </footer>
    </div>
  );
};
