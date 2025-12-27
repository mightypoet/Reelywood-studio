
import React from 'react';
import { Gravity, MatterBody } from './Gravity';
import { MousePointer2, Sparkles } from 'lucide-react';

export const ExpertiseSection: React.FC = () => {
  const capabilities = [
    { text: "Brand Strategy", color: "bg-[#0015ff]" },
    { text: "Growth Marketing", color: "bg-[#e794da]" },
    { text: "Lead Generation", color: "bg-[#1f464d]" },
    { text: "Content Creation", color: "bg-[#ff5941]" },
    { text: "Influencer Strategy", color: "bg-[#f97316]" },
    { text: "Web Solutions", color: "bg-[#ffd726]" },
    { text: "App Development", color: "bg-[#6366f1]" },
    { text: "Analytics", color: "bg-[#10b981]" },
    { text: "Meta Ads", color: "bg-[#ef4444]" },
    { text: "Google Ads", color: "bg-[#3b82f6]" },
    { text: "CRM Setup", color: "bg-[#8b5cf6]" },
    { text: "AI Automation", color: "bg-slate-900" }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden scroll-mt-24 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-1.5 rounded-full text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <Sparkles size={12} className="animate-pulse" />
              <span>Interactive Playground</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">Our Mastered Capabilities</h2>
            <p className="text-lg text-slate-500 font-medium">
              We cover the entire digital spectrum. Toss our services around and see how they fit into your growth strategy.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest animate-bounce shadow-xl shadow-indigo-200">
            <MousePointer2 size={16} />
            <span>Grab and Fling</span>
          </div>
        </div>

        <div className="h-[600px] lg:h-[750px] bg-slate-50 rounded-[4rem] border border-slate-100 relative shadow-inner overflow-hidden cursor-crosshair">
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
                    text-base sm:text-lg lg:text-2xl ${cap.color} text-white font-black 
                    hover:cursor-grab active:cursor-grabbing px-10 py-5 lg:px-12 lg:py-6 
                    whitespace-nowrap shadow-xl border border-white/20 transition-all 
                    hover:scale-105 select-none flex items-center justify-center 
                    rounded-[50px] active:scale-95 duration-200
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
