
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Calendar, Sparkles, Bot, TrendingUp } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { PartnerBrands } from './PartnerBrands';

interface HeroProps {
  onAuthClick: () => void;
  onDashboardClick: () => void;
}

interface PhysicalShape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'circle' | 'square' | 'triangle';
  color: string;
  rotation: number;
  rv: number;
  opacity: number;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick, onDashboardClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<PhysicalShape[]>([]);
  const requestRef = useRef<number>(0);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Logic for auto-redirect can be handled by parent if needed, 
      // but keeping it minimal here to avoid infinite loops
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const colors = ['#834bf1', '#ffde59', '#000000', '#ffffff'];
    const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

    const spawnShape = (x: number, y: number, isBurst = false) => {
      const maxShapes = isMobileRef.current ? 20 : 50;
      const newShape: PhysicalShape = {
        x, y,
        vx: (Math.random() - 0.5) * (isBurst ? 20 : 10),
        vy: isBurst ? (Math.random() - 0.5) * 20 : (Math.random() * -6),
        size: isMobileRef.current ? Math.random() * 15 + 10 : Math.random() * 30 + 15,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.15,
        opacity: 0.95
      };
      shapesRef.current.push(newShape);
      if (shapesRef.current.length > maxShapes) shapesRef.current.shift();
    };

    const autoSpawnInterval = setInterval(() => {
      spawnShape(Math.random() * canvas.width, -50);
    }, 1200);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gravity = 0.25;
      const friction = 0.98;
      const bounce = 0.65;

      shapesRef.current.forEach((s) => {
        s.vy += gravity; s.vx *= friction; s.vy *= friction;
        s.x += s.vx; s.y += s.vy; s.rotation += s.rv;
        
        if (s.y + s.size > canvas.height) { 
          s.y = canvas.height - s.size; 
          s.vy *= -bounce; 
        }
        if (s.x - s.size < 0) { 
          s.x = s.size; 
          s.vx *= -bounce; 
        } else if (s.x + s.size > canvas.width) { 
          s.x = canvas.width - s.size; 
          s.vx *= -bounce; 
        }

        ctx.save(); 
        ctx.translate(s.x, s.y); 
        ctx.rotate(s.rotation); 
        ctx.globalAlpha = s.opacity; 
        ctx.fillStyle = s.color; 
        ctx.strokeStyle = '#000000'; 
        ctx.lineWidth = 3; 
        ctx.beginPath();
        if (s.type === 'circle') ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        else if (s.type === 'square') ctx.rect(-s.size, -s.size, s.size * 2, s.size * 2);
        else if (s.type === 'triangle') { 
          ctx.moveTo(0, -s.size); 
          ctx.lineTo(s.size, s.size); 
          ctx.lineTo(-s.size, s.size); 
          ctx.closePath(); 
        }
        ctx.fill(); 
        ctx.stroke(); 
        ctx.restore();
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => { 
      cancelAnimationFrame(requestRef.current); 
      window.removeEventListener('resize', handleResize); 
      window.removeEventListener('resize', checkMobile); 
      clearInterval(autoSpawnInterval); 
    };
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    shapesRef.current.forEach(s => {
      const dx = s.x - x; 
      const dy = s.y - y; 
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 350) { 
        const force = (350 - dist) / 10; 
        const angle = Math.atan2(dy, dx); 
        s.vx += Math.cos(angle) * force; 
        s.vy += Math.sin(angle) * force; 
      }
    });
  };

  return (
    <section 
      id="home"
      className="relative min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors overflow-hidden"
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="flex-1 flex items-center relative z-10 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-5xl space-y-12">
            <div className="inline-flex items-center space-x-4 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1] animate-in fade-in slide-in-from-left-4 duration-500">
              <Zap size={14} className="text-[#ffde59] animate-pulse" />
              <span>Identity Node 001: REELYWOOD_STUDIO</span>
            </div>

            <div className="space-y-6">
              <h1 className="flex flex-col text-7xl md:text-9xl lg:text-[150px] font-black text-black dark:text-white leading-[0.75] tracking-tighter font-display uppercase italic">
                <span className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">SCALE</span>
                <span className="text-[#834bf1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">AUTOMATE</span>
                <div className="flex items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                  <span>DOMINATE</span>
                  <Sparkles className="ml-6 text-[#ffde59] hidden md:block animate-bounce" size={64} />
                </div>
              </h1>
              
              <div className="flex items-start pt-12 max-w-2xl relative animate-in fade-in duration-1000 delay-500">
                <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-[#ffde59] border-l-[4px] border-black shadow-[4px_0px_0px_0px_rgba(131,75,241,1)]"></div>
                <div className="ml-10 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="shrink-0 w-20 h-20 bg-[#834bf1] border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white rotate-[-3deg] hover:rotate-0 transition-transform">
                      <Bot size={40} strokeWidth={2.5} />
                    </div>
                    <div className="bg-black text-white px-4 py-2 border-[2px] border-white font-black text-[10px] uppercase tracking-widest italic">
                      Neural Strategy Active
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl text-black/80 dark:text-white/80 font-black uppercase italic tracking-tight leading-tight">
                    Architecting digital dominance through high-fidelity human-AI synergy. <span className="bg-[#ffde59] dark:bg-[#834bf1] text-black dark:text-white px-2 border-2 border-black">Surgical execution</span> for modern brands.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
              <button 
                onClick={onDashboardClick} 
                className="group w-full sm:w-auto bg-[#834bf1] text-white px-14 py-8 border-[5px] border-black shadow-[10px_10px_0px_0px_#000] font-black text-xs uppercase tracking-[0.4em] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0px_0px_#ffde59] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-6"
              >
                <span className="italic font-display">Claim Creator ID</span> 
                <Calendar size={24} className="group-hover:rotate-12 transition-transform" />
              </button>
              
              <button 
                onClick={onAuthClick} 
                className="group w-full sm:w-auto bg-white text-black px-14 py-8 border-[5px] border-black shadow-[10px_10px_0px_0px_#ffde59] font-black text-xs uppercase tracking-[0.4em] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[18px_18px_0px_0px_#834bf1] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-6"
              >
                <span className="italic font-display">Mission Hub</span> 
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="flex items-center space-x-4 px-6 py-2 border-l-4 border-black/10 dark:border-white/10">
                 <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-none border-[3px] border-black bg-white overflow-hidden shadow-[2px_2px_0px_0px_#000]">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i+20}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#834bf1]">50+ Brands</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 leading-none">Synchronized</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full mt-auto border-t-[6px] border-black">
        <div className="bg-[#ffde59] border-b-[4px] border-black py-3 flex justify-center items-center space-x-8 overflow-hidden">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="flex items-center space-x-3 shrink-0">
               <TrendingUp size={14} className="text-black" />
               <span className="font-black text-[9px] uppercase tracking-[0.4em] text-black italic">Performance Node: Active ✦</span>
             </div>
           ))}
        </div>
        <PartnerBrands />
      </div>
    </section>
  );
};
