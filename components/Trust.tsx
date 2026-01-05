
import React, { useState, useEffect, useRef } from 'react';
import LogoLoop, { LogoItem } from './LogoLoop';
import { Sparkles, Activity, ArrowUpRight } from 'lucide-react';

interface CountUpProps {
  value: string;
  duration?: number;
}

const CountUp: React.FC<CountUpProps> = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  const numericMatch = value.match(/(\d+\.?\d*)/);
  const targetValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const suffix = value.replace(numericMatch ? numericMatch[0] : '', '');
  const decimals = (numericMatch?.[0].split('.')[1] || '').length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(progress * targetValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, targetValue, duration]);

  return (
    <span ref={elementRef}>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const Trust: React.FC = () => {
  const metrics = [
    { value: "4.5X", label: "ROAS", desc: "AVERAGE RETURN ON AD SPEND FOR ACTIVE CAMPAIGNS.", color: "bg-[#834bf1]", textColor: "text-white" },
    { value: "18%", label: "AOV LIFT", desc: "AVERAGE ORDER VALUE LIFT THROUGH UPSELL FUNNELS.", color: "bg-[#ffde59]", textColor: "text-black" },
    { value: "450%", label: "VISIBILITY", desc: "INCREASE IN GOOGLE MAPS & LOCAL DISCOVERY.", color: "bg-white", textColor: "text-black" },
    { value: "20+", label: "PROJECTS", desc: "HIGH-IMPACT BRAND ECOSYSTEMS DELIVERED.", color: "bg-black", textColor: "text-white" }
  ];

  const brandLogos: LogoItem[] = [
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">F&B LEADERS</span>, title: "F&B" },
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">PREMIUM D2C</span>, title: "D2C" },
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">FINTECH TOP</span>, title: "Fintech" },
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">E-COMMERCE</span>, title: "E-com" },
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">GLOBAL REACH</span>, title: "Global" },
    { node: <span className="text-lg sm:text-2xl font-black italic tracking-tighter">SME HUB</span>, title: "SME" },
  ];

  return (
    <section className="py-20 sm:py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden border-t-[4px] sm:border-t-[6px] border-black dark:border-white transition-colors duration-500 relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:32px_32px] dark:bg-[radial-gradient(#fff_2px,transparent_2px)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 sm:mb-24 gap-8 lg:gap-12">
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-none text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-[4px_4px_0px_0px_#ffde59] sm:shadow-[6px_6px_0px_0px_#ffde59]">
              <Activity size={14} className="text-[#ffde59] animate-pulse" />
              <span>Performance Sync</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black text-black dark:text-white leading-[0.85] tracking-tighter font-display uppercase italic">
              Concrete <br />
              <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#000] sm:drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[3px_3px_0px_#fff] sm:dark:drop-shadow-[4px_4px_0px_#fff]">Metrics</span>
            </h2>
          </div>
          <div className="lg:max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
            <p className="text-black dark:text-white/70 text-base sm:text-lg lg:text-xl font-black leading-tight tracking-tight uppercase italic border-l-[6px] border-[#ffde59] pl-6 sm:pl-8">
              MEASURABLE SCALABILITY DELIVERED THROUGH PROPRIETARY AI ARCHITECTURE. WE ENGINEER RESULTS, NOT JUST REPORTS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((stat, i) => (
            <div 
              key={i} 
              className={`group relative p-8 sm:p-10 ${stat.color} border-[4px] sm:border-[5px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 sm:hover:-translate-x-2 sm:hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#834bf1] sm:hover:shadow-[20px_20px_0px_0px_#834bf1] animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col justify-between`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex justify-between items-start mb-10 sm:mb-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-[3px] border-black flex items-center justify-center text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                  <Sparkles size={18} sm:size={20} />
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.textColor} border-[2px] sm:border-[3px] border-black flex items-center justify-center`}>
                  <ArrowUpRight size={20} sm:size={24} strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-4">
                <p className={`text-5xl sm:text-6xl md:text-7xl font-black ${stat.textColor} tracking-tighter font-display italic drop-shadow-[3px_3px_0px_rgba(0,0,0,0.2)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] leading-none`}>
                  <CountUp value={stat.value} />
                </p>
                <div className="space-y-3">
                  <div className={`inline-block px-3 py-1 border-[2px] sm:border-[3px] border-black ${stat.textColor === 'text-white' ? 'bg-white text-black' : 'bg-black text-white'} font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    {stat.label}
                  </div>
                  <p className={`${stat.textColor} text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-tight opacity-80`}>
                    {stat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-24 sm:mt-40 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block relative mb-12 sm:mb-16">
            <p className="relative text-black dark:text-white font-black uppercase text-[10px] sm:text-[12px] tracking-[0.4em] sm:tracking-[0.6em] bg-white dark:bg-[#0a0a0a] px-6 sm:px-10 py-3 sm:py-4 border-[3px] sm:border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#ffde59] sm:shadow-[8px_8px_0px_0px_#ffde59] italic">
              Trusted Ecosystem
            </p>
          </div>
          
          <div className="mt-8 border-y-[4px] sm:border-y-[6px] border-black dark:border-white py-10 sm:py-14 bg-white dark:bg-[#0a0a0a] transition-all duration-700">
            <LogoLoop
              logos={brandLogos}
              speed={35}
              direction="left"
              logoHeight={30}
              gap={120}
              hoverSpeed={5}
              scaleOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Client categories and sectors"
              className="font-black text-black dark:text-white italic tracking-tighter font-display"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
