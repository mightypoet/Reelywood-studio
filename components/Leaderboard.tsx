import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, TrendingUp, Users, Zap, Target, Activity } from 'lucide-react';

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
      color: "from-indigo-500 to-blue-500",
      glow: "rgba(99, 102, 241, 0.15)",
      icon: <TrendingUp size={20} />
    },
    { 
      label: "Conversion Rate", 
      value: "2.5X", 
      desc: "Via landing page overhaul", 
      color: "from-emerald-500 to-teal-500",
      glow: "rgba(16, 185, 129, 0.15)",
      icon: <Target size={20} />
    },
    { 
      label: "Support Time", 
      value: "-20%", 
      desc: "Reduction in manual tasks", 
      color: "from-amber-500 to-orange-500",
      glow: "rgba(245, 158, 11, 0.15)",
      icon: <Zap size={20} />
    },
    { 
      label: "Onboarding", 
      value: "+12%", 
      desc: "Improvement in digital flow", 
      color: "from-blue-500 to-cyan-500",
      glow: "rgba(59, 130, 246, 0.15)",
      icon: <Users size={20} />
    }
  ];

  return (
    <section id="leaderboard" className="py-32 bg-[#05070a] rounded-[4rem] mx-4 sm:mx-8 my-12 overflow-hidden relative scroll-mt-24 border border-white/5">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-[180px] transition-all duration-700 pointer-events-none opacity-30"
          style={{ 
            background: activeStat !== null ? stats[activeStat].glow : 'rgba(79, 70, 229, 0.1)'
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
              <Activity size={14} className="animate-pulse" />
              <span>Real-time Multipliers</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[0.9]">
              Concrete <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Outcomes</span>
            </h2>
          </div>
          <div className="lg:max-w-md">
            <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed border-l-2 border-indigo-500/30 pl-8">
              We translate marketing efforts into tangible performance metrics. Every strategy is calibrated for maximum ROI and seamless scalability.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              onMouseEnter={() => setActiveStat(i)}
              onMouseLeave={() => setActiveStat(null)}
              className="group relative bg-white/[0.02] border border-white/10 p-10 rounded-[3.5rem] transition-all duration-500 hover:bg-white/[0.05] hover:border-white/20 hover:-translate-y-3 cursor-pointer overflow-hidden shadow-2xl"
            >
              {/* Card Corner Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`}></div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500`}>
                  {stat.icon}
                </div>
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white/30 transition-all">
                  <ArrowUpRight size={18} />
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <p className={`text-6xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent group-hover:scale-105 transition-transform origin-left tracking-tighter`}>
                  <CountUp value={stat.value} />
                </p>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </div>

              {/* Interactive Progress Line */}
              <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                  style={{ width: activeStat === i ? '100%' : '30%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#05070a] bg-slate-800 overflow-hidden shadow-xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i}`} alt="Partner" />
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
              Join <span className="text-white">50+</span> data-driven brands
            </p>
          </div>
          
          <button className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-colors flex items-center space-x-3">
            <span>View Full Case Study Archive</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
