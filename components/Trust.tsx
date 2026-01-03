
import React, { useState, useEffect, useRef } from 'react';
import LogoLoop, { LogoItem } from './LogoLoop';

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
    { value: "4.5X", label: "ROAS", desc: "Average Return on Ad Spend for active campaigns." },
    { value: "18%", label: "AOV Increase", desc: "Average Order Value lift through upsell funnels." },
    { value: "450%", label: "Visibility", desc: "Increase in Google Maps & local search discovery." },
    { value: "20+", label: "Projects", desc: "High-impact brand ecosystems delivered globally." }
  ];

  const brandLogos: LogoItem[] = [
    { node: <span className="text-xl font-black italic tracking-tighter">F&B LEADERS</span>, title: "F&B" },
    { node: <span className="text-xl font-black italic tracking-tighter">PREMIUM D2C</span>, title: "D2C" },
    { node: <span className="text-xl font-black italic tracking-tighter">FINTECH TOP</span>, title: "Fintech" },
    { node: <span className="text-xl font-black italic tracking-tighter">E-COMMERCE</span>, title: "E-com" },
    { node: <span className="text-xl font-black italic tracking-tighter">GLOBAL REACH</span>, title: "Global" },
    { node: <span className="text-xl font-black italic tracking-tighter">SME HUB</span>, title: "SME" },
  ];

  return (
    <section className="py-48 bg-white dark:bg-[#0a0a0a] overflow-hidden border-t-4 border-black dark:border-white transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-16">
          {metrics.map((stat, i) => (
            <div 
              key={i} 
              className="text-center p-16 bg-[#f8fbff] dark:bg-[#151515] rounded-[3rem] border-2 border-slate-50 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <p className="text-6xl font-black text-[#5642ff] dark:text-[#834bf1] mb-4 font-display">
                <CountUp value={stat.value} />
              </p>
              <p className="text-sm font-black text-black dark:text-white uppercase tracking-[0.3em] mb-4">{stat.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed uppercase max-w-[240px] mx-auto">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-32 text-center">
          <p className="text-slate-200 dark:text-white/10 font-black uppercase text-[11px] tracking-[0.6em] mb-16">Trusted ecosystem</p>
          
          <div className="opacity-30 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <LogoLoop
              logos={brandLogos}
              speed={35}
              direction="left"
              logoHeight={28}
              gap={120}
              hoverSpeed={5}
              scaleOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Client categories and sectors"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
