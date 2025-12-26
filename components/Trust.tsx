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
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((stat, i) => (
            <div 
              key={i} 
              className="text-center p-8 bg-indigo-50/20 rounded-[2.5rem] border border-indigo-50/50 hover:bg-white hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <p className="text-4xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform">
                <CountUp value={stat.value} />
              </p>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase opacity-0 animate-in fade-in duration-1000 delay-500 fill-mode-forwards">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em] mb-8 animate-in fade-in duration-1000 delay-700">Trusted by</p>
          
          <div className="opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <LogoLoop
              logos={brandLogos}
              speed={60}
              direction="left"
              logoHeight={32}
              gap={80}
              hoverSpeed={10}
              scaleOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Client categories and sectors"
            />
          </div>
        </div>
      </div>
    </section>
  );
};