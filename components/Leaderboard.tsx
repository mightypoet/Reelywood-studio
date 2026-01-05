
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, TrendingUp, Users, Zap, Target, Activity, Sparkles } from 'lucide-react';

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
  const prefix = value.startsWith('-') || value.startsWith('+') ? value[0] : '';
  const pureSuffix = suffix.replace(/^[+-]/, '');
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
      {prefix}
      {count.toFixed(decimals)}
      {pureSuffix}
    </span>
  );
};

export const Leaderboard: React.FC = () => {
  const [activeStat, setActiveStat] = useState<number | null>(null);

  const stats = [
    { 
      label: "Lead Gain", 
      value: "4.7X", 
      desc: "Via full-funnel architecture", 
      bg: "bg-[#834bf1]",
      textColor: "text-white",
      icon: <TrendingUp size={24} strokeWidth={3} />
    },
    { 
      label: "Conversion", 
      value: "2.5X", 
      desc: "Via landing page overhaul", 
      bg: "bg-[#ffde59]",
      textColor: "text-black",
      icon: <Target size={24} strokeWidth={3} />
    },
    { 
      label: "Support Time", 
      value: "-20%", 
      desc: "Reduction in manual tasks", 
      bg: "bg-black",
      textColor: "text-white",
      icon: <Zap size={24} strokeWidth={3} />
    },
    { 
      label: "Onboarding", 
      value: "+12%", 
      desc: "Improvement in digital flow", 
      bg: "bg-white",
      textColor: "text-black",
      icon: <Users size={24} strokeWidth={3} />
    }
  ];

  return (
    <section id="leaderboard" className="py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 transition-colors duration-500 relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:32px_32px] dark:bg-[radial-gradient(#fff_2px,transparent_2px)]"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <Activity size={14} className="animate-pulse text-[#ffde59]" />
              <span>Real-time Multipliers</span>
            </div>
            <h2 className="text-6xl md:text-8xl lg:text-[100px] font-black text-black dark:text-white leading-[0.85] tracking-tighter font-display uppercase italic">
              Concrete <br /> 
              <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Outcomes</span>
            </h2>
          </div>
          <div className="lg:max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
            <p className="text-black dark:text-white/70 text-lg lg:text-xl font-black leading-tight tracking-tight uppercase italic border-l-[6px] border-[#ffde59] pl-8">
              We translate marketing efforts into tangible performance metrics. Every strategy is calibrated for maximum ROI and seamless scalability.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              onMouseEnter={() => setActiveStat(i)}
              onMouseLeave={() => setActiveStat(null)}
              className={`group relative bg-white dark:bg-[#111] border-[4px] border-black dark:border-white p-10 transition-all duration-300 hover:-translate-y-4 hover:translate-x-2 shadow-[12px_12px_0px_0px_#000000] dark:shadow-[12px_12px_0px_0px_#ffffff] hover:shadow-[20px_20px_0px_0px_#834bf1] cursor-pointer flex flex-col justify-between h-full animate-in fade-in slide-in-from-bottom-8 duration-700`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-12">
                <div className={`w-16 h-16 ${stat.bg} ${stat.textColor} border-[3px] border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0px_0px_#000] transition-transform group-hover:scale-110 group-hover:-rotate-3`}>
                  {stat.icon}
                </div>
                <div className="w-12 h-12 bg-white dark:bg-black border-[3px] border-black dark:border-white flex items-center justify-center text-black dark:text-white transition-all group-hover:bg-[#ffde59] group-hover:text-black shadow-[4px_4px_0px_0px_#000]">
                  <ArrowUpRight size={20} strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-4">
                <p className={`text-6xl md:text-7xl font-black text-black dark:text-white tracking-tighter leading-none font-display uppercase italic`}>
                  <CountUp value={stat.value} />
                </p>
                <div className="space-y-2">
                  <p className="text-black dark:text-white font-black text-sm uppercase tracking-[0.2em] bg-[#ffde59] dark:bg-[#834bf1] inline-block px-2 border-[2px] border-black dark:border-white">{stat.label}</p>
                  <p className="text-black/60 dark:text-white/40 text-[10px] font-black uppercase tracking-widest leading-tight">
                    {stat.desc}
                  </p>
                </div>
              </div>

              {/* Neobrutalist Progress Indicator */}
              <div className="mt-10 h-4 w-full bg-[#f0f0f0] dark:bg-white/5 border-[3px] border-black dark:border-white overflow-hidden shadow-[4px_4px_0px_0px_#000]">
                <div 
                  className={`h-full ${stat.bg} transition-all duration-1000 ease-out`}
                  style={{ width: activeStat === i ? '100%' : '25%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 pt-16 border-t-[4px] border-black dark:border-white flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center space-x-6 bg-white dark:bg-black border-[3px] border-black dark:border-white p-4 shadow-[8px_8px_0px_0px_#ffde59]">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-none border-[3px] border-black bg-white overflow-hidden shadow-[2px_2px_0px_#000] hover:translate-y-1 transition-transform">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i}`} alt="Partner" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-black dark:text-white text-xs font-black uppercase tracking-[0.3em]">
              Join <span className="bg-[#834bf1] text-white px-2 italic">50+</span> data-driven brands
            </p>
          </div>
          
          <button className="group bg-black text-white px-10 py-6 border-[3px] border-black shadow-[8px_8px_0px_0px_#834bf1] font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 flex items-center space-x-4">
            <span className="italic font-display">View Mission Archive</span>
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform text-[#ffde59]" />
          </button>
        </div>
      </div>
    </section>
  );
};
