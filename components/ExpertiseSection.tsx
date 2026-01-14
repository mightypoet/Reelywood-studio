
import React from 'react';
import { Gravity, MatterBody } from './Gravity';
import { MousePointer2, Sparkles, Binary, Cpu, Activity } from 'lucide-react';

export const ExpertiseSection: React.FC = () => {
  const capabilities = [
    { text: "Brand Strategy", color: "bg-[#834bf1]", textCol: "text-white" },
    { text: "Growth Marketing", color: "bg-[#ffde59]", textCol: "text-black" },
    { text: "Lead Intel", color: "bg-white", textCol: "text-black" },
    { text: "Content Forge", color: "bg-black", textCol: "text-white" },
    { text: "Influencer Sync", color: "bg-[#834bf1]", textCol: "text-white" },
    { text: "Web Architecture", color: "bg-[#ffde59]", textCol: "text-black" },
    { text: "App Development", color: "bg-white", textCol: "text-black" },
    { text: "Neural Analytics", color: "bg-black", textCol: "text-white" },
    { text: "Meta Scaling", color: "bg-[#834bf1]", textCol: "text-white" },
    { text: "Search Authority", color: "bg-[#ffde59]", textCol: "text-black" },
    { text: "CRM Automation", color: "bg-white", textCol: "text-black" },
    { text: "High Fidelity AI", color: "bg-black", textCol: "text-[#ffde59]" }
  ];

  return (
    <section className="py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 border-t-[6px] border-black dark:border-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-12">
          <div className="max-w-2xl space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <Binary size={14} className="text-[#ffde59] animate-pulse" />
              <span>Full System Roster</span>
            </div>
            <h2 className="text-7xl md:text-8xl lg:text-[100px] font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
              Technical <br />
              <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Stack</span>
            </h2>
            <p className="text-xl md:text-2xl text-black/60 dark:text-white/60 font-black uppercase italic tracking-tight border-l-[8px] border-[#ffde59] pl-8">
              Recursive capabilities engineered for high-velocity SMEs. Every node is optimized for maximum conversion and cultural impact.
            </p>
          </div>
          
          <div className="space-y-4">
             <div className="bg-black text-white px-10 py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-6 group">
                <MousePointer2 size={24} className="group-hover:rotate-12 transition-transform" />
                <span>Interact with Nodes</span>
             </div>
             <div className="bg-[#ffde59] text-black px-10 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] font-black text-[10px] uppercase tracking-widest text-center italic">
                Physics engine active v2.1
             </div>
          </div>
        </div>

        <div className="h-[700px] lg:h-[900px] bg-[#f0f0f0] dark:bg-[#111] border-[6px] border-black dark:border-white relative shadow-[20px_20px_0px_0px_#000000] dark:shadow-[20px_20px_0px_0px_#ffffff] overflow-hidden cursor-crosshair transition-colors duration-500">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>
          
          <Gravity 
            gravity={{ x: 0, y: 0.9 }} 
            className="w-full h-full"
          >
            {capabilities.map((cap, i) => (
              <MatterBody
                key={i}
                matterBodyOptions={{ 
                  friction: 0.002, 
                  restitution: 0.85,
                  frictionAir: 0.015,
                  density: 0.02
                }}
                x={`${15 + (Math.random() * 70)}%`}
                y={`${10 + (Math.random() * 25)}%`}
                angle={Math.random() * 360}
              >
                <div 
                  className={`
                    ${cap.color} ${cap.textCol} 
                    font-black border-[4px] border-black dark:border-white px-12 py-6 lg:px-16 lg:py-8 
                    whitespace-nowrap shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] 
                    hover:translate-x-1 hover:translate-y-1 hover:shadow-none
                    select-none flex items-center justify-center font-display uppercase italic text-lg lg:text-3xl
                    active:scale-90 duration-150 transition-all cursor-grab active:cursor-grabbing
                  `}
                >
                  <Cpu size={24} className="mr-4 opacity-30" />
                  {cap.text}
                </div>
              </MatterBody>
            ))}
          </Gravity>

          {/* Console Overlay Decor */}
          <div className="absolute bottom-10 left-10 pointer-events-none opacity-40">
             <div className="bg-black text-white p-4 border-[2px] border-white font-mono text-[8px] uppercase tracking-widest leading-relaxed">
                SYSTEM_LOG: <br />
                NODES_INITIALIZED... OK <br />
                PHYSICS_LAYER... OK <br />
                READY_FOR_DEPLOYMENT
             </div>
          </div>
          <div className="absolute top-10 right-10 pointer-events-none opacity-40">
             <Activity className="text-black dark:text-white animate-pulse" size={48} />
          </div>
        </div>
      </div>
    </section>
  );
};
