
import React from 'react';
import { Gravity, MatterBody } from './Gravity';
import { MousePointer2, Sparkles } from 'lucide-react';

export const ExpertiseSection: React.FC = () => {
  const capabilities = [
    { text: "Brand Strategy", color: "bg-[#834bf1]" },
    { text: "Growth Marketing", color: "bg-[#ffde59]" },
    { text: "Lead Generation", color: "bg-white" },
    { text: "Content Creation", color: "bg-[#834bf1]" },
    { text: "Influencer Strategy", color: "bg-[#ffde59]" },
    { text: "Web Solutions", color: "bg-white" },
    { text: "App Development", color: "bg-[#834bf1]" },
    { text: "Analytics", color: "bg-[#ffde59]" },
    { text: "Meta Ads", color: "bg-white" },
    { text: "Google Ads", color: "bg-[#834bf1]" },
    { text: "CRM Setup", color: "bg-[#ffde59]" },
    { text: "AI Automation", color: "bg-black" }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 border-t-4 border-black dark:border-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-8">
          <div className="max-w-2xl space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-[#ffde59] border-2 border-black dark:border-white px-5 py-2 rounded-full text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff]">
              <Sparkles size={12} className="animate-pulse" />
              <span>Identity Node</span>
            </div>
            <h2 className="text-6xl font-black text-black dark:text-white leading-tight tracking-tighter font-display uppercase">Technical Stack</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-bold">
              Dynamic capabilities across the digital spectrum.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-black dark:bg-white text-white dark:text-black px-10 py-5 border-2 border-white dark:border-black rounded-none font-black text-[12px] uppercase tracking-[0.3em] shadow-[6px_6px_0px_0px_#834bf1] animate-bounce">
            <MousePointer2 size={18} />
            <span>Grab and Fling</span>
          </div>
        </div>

        <div className="h-[650px] lg:h-[800px] bg-white dark:bg-[#111] border-4 border-black dark:border-white relative shadow-[16px_16px_0px_0px_#000000] dark:shadow-[16px_16px_0px_0px_#ffffff] overflow-hidden cursor-crosshair transition-colors duration-500">
          <Gravity 
            gravity={{ x: 0, y: 0.8 }} 
            className="w-full h-full"
          >
            {capabilities.map((cap, i) => (
              <MatterBody
                key={i}
                matterBodyOptions={{ 
                  friction: 0.005, 
                  restitution: 0.8,
                  frictionAir: 0.02,
                  density: 0.01
                }}
                x={`${20 + (Math.random() * 60)}%`}
                y={`${10 + (Math.random() * 30)}%`}
                angle={Math.random() * 360}
              >
                <div 
                  className={`
                    text-base sm:text-lg lg:text-2xl ${cap.color} ${cap.color === 'bg-black' ? 'text-white' : 'text-black'} 
                    font-black border-4 border-black dark:border-white px-10 py-5 lg:px-14 lg:py-7 
                    whitespace-nowrap shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:scale-105 
                    select-none flex items-center justify-center font-display uppercase
                    active:scale-95 duration-200
                  `}
                >
                  {cap.text}
                </div>
              </MatterBody>
            ))}
          </Gravity>
        </div>
      </div>
    </section>
  );
};
