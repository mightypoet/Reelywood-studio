
import React from 'react';
import { Gravity, MatterBody } from './Gravity';
import { MousePointer2 } from 'lucide-react';

export const ExpertiseSection: React.FC = () => {
  const capabilities = [
    { text: "Brand Strategy", color: "bg-[#0015ff]", shapeIdx: 0 },
    { text: "Growth Marketing", color: "bg-[#e794da]", shapeIdx: 1 },
    { text: "Lead Generation", color: "bg-[#1f464d]", shapeIdx: 2 },
    { text: "Content Creation", color: "bg-[#ff5941]", shapeIdx: 3 },
    { text: "Influencer Strategy", color: "bg-[#f97316]", shapeIdx: 4 },
    { text: "Web Solutions", color: "bg-[#ffd726]", shapeIdx: 5 },
    { text: "App Development", color: "bg-[#6366f1]", shapeIdx: 6 },
    { text: "Analytics", color: "bg-[#10b981]", shapeIdx: 7 },
    { text: "Meta Ads", color: "bg-[#ef4444]", shapeIdx: 8 },
    { text: "Google Ads", color: "bg-[#3b82f6]", shapeIdx: 9 },
    { text: "CRM Setup", color: "bg-[#8b5cf6]", shapeIdx: 10 },
    { text: "AI Automation", color: "bg-slate-900", shapeIdx: 11 }
  ];

  // Distinct geometrical shapes using clip-path and border-radius
  const geoStyles = [
    // 0: Hexagon
    { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", borderRadius: "0" },
    // 1: Pill/Capsule
    { clipPath: "none", borderRadius: "9999px" },
    // 2: Octagon
    { clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)", borderRadius: "0" },
    // 3: Rounded Rectangle
    { clipPath: "none", borderRadius: "24px" },
    // 4: Diamond/Rhombus
    { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", borderRadius: "0" },
    // 5: Tag Shape
    { clipPath: "polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)", borderRadius: "0" },
    // 6: Beveled
    { clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)", borderRadius: "0" },
    // 7: Leaf Shape
    { clipPath: "none", borderRadius: "0 50% 0 50%" },
    // 8: Pentagon
    { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)", borderRadius: "0" },
    // 9: Trapezoid
    { clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)", borderRadius: "0" },
    // 10: Reverse Leaf
    { clipPath: "none", borderRadius: "50% 0 50% 0" },
    // 11: Parallelogram-ish
    { clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)", borderRadius: "0" }
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

        <div className="h-[600px] lg:h-[800px] bg-slate-50 rounded-[4rem] border border-slate-100 relative shadow-inner overflow-hidden">
          <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
            {capabilities.map((cap, i) => (
              <MatterBody
                key={i}
                matterBodyOptions={{ friction: 0.5, restitution: 0.2 }}
                x={`${15 + (Math.random() * 70)}%`}
                y={`${10 + (Math.random() * 20)}%`}
                angle={Math.random() * 30}
              >
                <div 
                  style={{ 
                    borderRadius: geoStyles[cap.shapeIdx].borderRadius,
                    clipPath: geoStyles[cap.shapeIdx].clipPath
                  }}
                  className={`text-2xl sm:text-3xl lg:text-5xl ${cap.color} text-white font-black hover:cursor-grab active:cursor-grabbing px-16 py-12 lg:px-20 lg:py-16 whitespace-nowrap shadow-2xl border-2 border-white/10 transition-transform hover:scale-105 select-none flex items-center justify-center`}
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
