import React from 'react';
import { Gravity, MatterBody } from './Gravity';
import { MousePointer2 } from 'lucide-react';

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
            <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Interactive Playground</h4>
            <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">Our Mastered Capabilities</h2>
            <p className="text-lg text-slate-500 font-medium">
              We cover the entire digital spectrum. Toss our services around and see how they fit into your growth strategy.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-bounce">
            <MousePointer2 size={16} />
            <span>Click and Drag to Play</span>
          </div>
        </div>

        <div className="h-[500px] lg:h-[600px] bg-slate-50 rounded-[3rem] border border-slate-100 relative shadow-inner overflow-hidden">
          <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
            {capabilities.map((cap, i) => (
              <MatterBody
                key={i}
                matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                x={`${20 + (Math.random() * 60)}%`}
                y={`${10 + (Math.random() * 20)}%`}
                angle={Math.random() * 45}
              >
                <div className={`text-sm sm:text-base lg:text-lg ${cap.color} text-white font-bold rounded-full hover:cursor-grab active:cursor-grabbing px-6 py-3 whitespace-nowrap shadow-lg`}>
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