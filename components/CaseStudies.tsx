
import React, { useState } from 'react';
import { ArrowRight, BarChart3, Target, TrendingUp, Sparkles, ExternalLink, Play } from 'lucide-react';

interface CaseStudy {
  id: string;
  brand: string;
  title: string;
  result: string;
  metric: string;
  image: string;
  tags: string[];
  color: string;
}

const cases: CaseStudy[] = [
  {
    id: "cabin",
    brand: "Cabin 17A",
    title: "Viral Lifestyle Launch",
    result: "4.2M views across 12 influencer nodes in 48 hours.",
    metric: "450% ROI",
    image: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/5.png",
    tags: ["F&B", "Viral", "Influence"],
    color: "bg-[#834bf1]"
  },
  {
    id: "flurys",
    brand: "Flurys x Reelywood",
    title: "Heritage Re-Branding",
    result: "AOV lift by 18% through high-fidelity visual storytelling.",
    metric: "18% LIFT",
    image: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/6.png",
    tags: ["Heritage", "E-com", "Creative"],
    color: "bg-[#ffde59]"
  },
  {
    id: "d2c",
    brand: "Premium D2C",
    title: "Surgical Meta Funnel",
    result: "Achieved consistent 4.5X ROAS using AI-optimized creatives.",
    metric: "4.5X ROAS",
    image: "https://izz9qoicna213xwc.public.blob.vercel-storage.com/7.png",
    tags: ["D2C", "Performance", "AI"],
    color: "bg-black"
  }
];

export const CaseStudies: React.FC = () => {
  const [activeCase, setActiveCase] = useState<string>(cases[0].id);

  return (
    <section id="portfolio" className="py-48 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 transition-colors duration-500 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:32px_32px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <BarChart3 size={14} className="text-[#ffde59]" />
              <span>Evidence of Performance</span>
            </div>
            <h2 className="text-6xl md:text-8xl lg:text-[100px] font-black text-black dark:text-white leading-[0.85] tracking-tighter font-display uppercase italic">
              Case <br />
              <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Impact</span>
            </h2>
          </div>
          <div className="lg:max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
            <p className="text-black dark:text-white/70 text-lg lg:text-xl font-black leading-tight tracking-tight uppercase italic border-l-[6px] border-[#ffde59] pl-8">
              WE DON'T JUST PROMISE GROWTH. WE DEPLOY IT. ARCHITECTING DIGITAL DOMINANCE FOR SMEs THROUGH MEASURABLE INTERVENTIONS.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {cases.map((cs) => (
              <button
                key={cs.id}
                onClick={() => setActiveCase(cs.id)}
                className={`text-left p-8 border-[4px] border-black transition-all duration-300 relative group ${
                  activeCase === cs.id 
                  ? `${cs.color} ${cs.color === 'bg-black' ? 'text-white' : 'text-black'} shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff]` 
                  : 'bg-white text-black hover:translate-x-2'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${activeCase === cs.id ? 'opacity-100' : 'opacity-40'}`}>{cs.brand}</span>
                  {activeCase === cs.id && <Sparkles className="animate-pulse" size={16} />}
                </div>
                <h3 className="text-2xl font-black uppercase italic font-display tracking-tight leading-none mb-4">{cs.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {cs.tags.map(tag => (
                    <span key={tag} className={`text-[8px] font-black px-2 py-1 border-[1.5px] border-black ${activeCase === cs.id ? 'bg-white text-black' : 'bg-slate-100'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Active Case Display */}
          <div className="lg:col-span-8">
            {cases.map((cs) => cs.id === activeCase && (
              <div key={cs.id} className="bg-white dark:bg-[#111] border-[6px] border-black dark:border-white p-6 md:p-12 shadow-[20px_20px_0px_0px_#834bf1] animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
                <div className="grid md:grid-cols-2 gap-12 flex-1">
                  <div className="space-y-10 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="bg-[#ffde59] text-black border-[3px] border-black inline-block px-4 py-1 font-black text-xs uppercase tracking-widest italic">
                        The Yield
                      </div>
                      <h4 className="text-5xl md:text-6xl font-black text-[#834bf1] italic font-display tracking-tighter leading-none">
                        {cs.metric}
                      </h4>
                    </div>
                    
                    <p className="text-xl md:text-2xl font-black text-black dark:text-white uppercase italic leading-tight border-l-[10px] border-black dark:border-white pl-8">
                      {cs.result}
                    </p>

                    <div className="space-y-6">
                       <div className="flex items-center space-x-4 group">
                          <div className="w-12 h-12 bg-black text-white border-[3px] border-white flex items-center justify-center shadow-[4px_4px_0px_0px_#834bf1]">
                             <Target size={24} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Precision Targeting Node Active</span>
                       </div>
                       <div className="flex items-center space-x-4 group">
                          <div className="w-12 h-12 bg-[#ffde59] text-black border-[3px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                             <TrendingUp size={24} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Recursive Growth Model</span>
                       </div>
                    </div>

                    <button className="w-full bg-black text-white py-6 border-[4px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black text-xs uppercase tracking-[0.4em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 flex items-center justify-center space-x-4 group/btn">
                       <span className="italic font-display">Mission Archive</span>
                       <Play size={18} fill="currentColor" className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#834bf1] border-[4px] border-black translate-x-4 translate-y-4"></div>
                    <div className="relative aspect-[3/4] bg-white border-[4px] border-black overflow-hidden">
                       <img src={cs.image} alt={cs.brand} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-110" />
                       <div className="absolute top-6 right-6">
                         <div className="bg-black text-white p-3 border-[2px] border-white shadow-[4px_4px_0px_0px_#ffde59]">
                           <ExternalLink size={20} strokeWidth={3} />
                         </div>
                       </div>
                       <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border-[3px] border-black p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Deployment Alpha-12</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
