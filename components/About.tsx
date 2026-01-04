
import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThreeDCard } from './ThreeDCard';

interface AboutProps {
  onApplyClick: () => void;
  onAcademyClick?: () => void;
}

export const About: React.FC<AboutProps> = ({ onApplyClick, onAcademyClick }) => {
  return (
    <section id="about" className="py-24 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 relative transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="space-y-10 order-2 lg:order-1 flex flex-col items-center lg:items-start">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-full text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                <span className="text-white font-black text-xs">+</span>
                <span>Visual Protocol</span>
              </div>
              <h2 className="text-5xl sm:text-7xl font-black text-black dark:text-white tracking-tighter leading-[0.9] uppercase font-display">
                Creator <br /> Card
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-bold max-w-xl mx-auto lg:mx-0">
                Unlock your digital potential. Post. Earn. Dominate.
              </p>
            </div>

            <div className="relative group w-full max-w-[450px] aspect-[3.5/5] bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_#000000] flex items-center justify-center p-6 cursor-crosshair transition-transform hover:-translate-y-2">
               <div className="w-full h-full relative z-10 flex items-center justify-center scale-90 sm:scale-100">
                <ThreeDCard name="Your Identity" handle="@handle" />
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 w-full space-y-12">
            <div className="bg-white border-[4px] border-black p-8 sm:p-12 shadow-[12px_12px_0px_0px_#000000] relative">
              <div className="absolute -top-6 -right-6 bg-[#ffde59] text-black border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_#000000] z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter font-display">Elite</h3>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-[#834bf1] border-[2px] border-black"></div>
                  <h3 className="text-3xl font-black text-black uppercase tracking-tight font-display">Join The network</h3>
                </div>
                <p className="text-slate-600 font-bold text-lg leading-relaxed">
                  Join the elite network of performance-driven creators. Apply for your unique Reelywood ID and start taking on missions from top-tier brands.
                </p>
                <button 
                  onClick={onApplyClick}
                  className="w-full bg-[#834bf1] text-white py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-black text-xs uppercase tracking-[0.4em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2"
                >
                  Start Application
                </button>
                <div className="flex items-center justify-center space-x-8 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-black leading-none">500+</p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-1">Verified</p>
                  </div>
                  <div className="w-px h-10 bg-black/10"></div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-black leading-none">₹2M+</p>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-1">Earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
