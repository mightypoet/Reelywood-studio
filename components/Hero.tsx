
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Calendar, Sparkles, Bot } from 'lucide-react';
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
      if (user) {
        onDashboardClick();
      }
    });
    return () => unsubscribe();
  }, [onDashboardClick]);

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
      const maxShapes = isMobileRef.current ? 15 : 40;
      const newShape: PhysicalShape = {
        x, y,
        vx: (Math.random() - 0.5) * (isBurst ? 15 : 8),
        vy: isBurst ? (Math.random() - 0.5) * 15 : (Math.random() * -5),
        size: isMobileRef.current ? Math.random() * 15 + 10 : Math.random() * 25 + 15,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.1,
        opacity: 0.9
      };
      shapesRef.current.push(newShape);
      if (shapesRef.current.length > maxShapes) shapesRef.current.shift();
    };

    const autoSpawnInterval = setInterval(() => {
      if (isMobileRef.current) spawnShape(Math.random() * canvas.width, -50);
    }, 800);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gravity = 0.2;
      const friction = 0.99;
      const bounce = 0.6;

      shapesRef.current.forEach((s) => {
        s.vy += gravity; s.vx *= friction; s.vy *= friction;
        s.x += s.vx; s.y += s.vy; s.rotation += s.rv;
        if (s.y + s.size > canvas.height) { s.y = canvas.height - s.size; s.vy *= -bounce; }
        if (s.x - s.size < 0) { s.x = s.size; s.vx *= -bounce; } 
        else if (s.x + s.size > canvas.width) { s.x = canvas.width - s.size; s.vx *= -bounce; }
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rotation); ctx.globalAlpha = s.opacity; ctx.fillStyle = s.color; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath();
        if (s.type === 'circle') ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        else if (s.type === 'square') ctx.rect(-s.size, -s.size, s.size * 2, s.size * 2);
        else if (s.type === 'triangle') { ctx.moveTo(0, -s.size); ctx.lineTo(s.size, s.size); ctx.lineTo(-s.size, s.size); ctx.closePath(); }
        ctx.fill(); ctx.stroke(); ctx.restore();
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(requestRef.current); window.removeEventListener('resize', handleResize); window.removeEventListener('resize', checkMobile); clearInterval(autoSpawnInterval); };
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    shapesRef.current.forEach(s => {
      const dx = s.x - x; const dy = s.y - y; const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) { const force = (300 - dist) / 15; const angle = Math.atan2(dy, dx); s.vx += Math.cos(angle) * force; s.vy += Math.sin(angle) * force; }
    });
  };

  const handleEnterClick = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative min-h-screen flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors overflow-x-hidden"
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="flex-1 flex items-center relative z-10 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl space-y-12">
            <div className="inline-flex items-center space-x-4 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <Zap size={14} className="text-[#ffde59] animate-pulse" />
              <span>High-Performance Brand Systems</span>
            </div>

            <div className="space-y-4">
              <h1 className="flex flex-col text-7xl md:text-9xl lg:text-[140px] font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
                <span>Scale</span>
                <span className="text-[#834bf1]">Automate</span>
                <div className="flex items-center">
                  <span>Dominate</span>
                  <Sparkles className="ml-4 text-[#ffde59] hidden md:block" size={48} />
                </div>
              </h1>
              
              <div className="flex items-start pt-8 max-w-2xl relative">
                <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-[#ffde59] border-l-[3px] border-black"></div>
                <div className="ml-8 flex gap-6">
                  <div className="shrink-0 w-16 h-16 bg-[#834bf1] border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white">
                    <Bot size={32} strokeWidth={2.5} />
                  </div>
                  <p className="text-lg md:text-xl text-black/70 dark:text-white/70 font-black uppercase italic tracking-tight leading-tight">
                    Architecting digital dominance through human-AI synergy. Surgical execution for the modern SME.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-8">
              <button onClick={handleEnterClick} className="group w-full sm:w-auto bg-[#834bf1] text-white px-12 py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2">
                <span className="italic font-display">Enter Reelywood →</span>
              </button>
              <button onClick={onDashboardClick} className="w-full sm:w-auto bg-white text-black px-12 py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group">
                <span>Enter Hub</span> <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full mt-auto">
        <PartnerBrands />
      </div>
    </section>
  );
};
