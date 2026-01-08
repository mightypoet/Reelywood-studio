import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Calendar, Sparkles } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

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
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMobileRef = useRef(false);

  // --- AUTO-REDIRECT LOGIC START ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("⚡ Auto-Redirect: Authenticated User Detected. Routing to Hub...");
        onDashboardClick();
      }
    });
    return () => unsubscribe();
  }, [onDashboardClick]);
  // --- AUTO-REDIRECT LOGIC END ---

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
        x,
        y,
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
      if (shapesRef.current.length > maxShapes) {
        shapesRef.current.shift();
      }
    };

    // Auto-spawn for mobile
    const autoSpawnInterval = setInterval(() => {
      if (isMobileRef.current) {
        spawnShape(Math.random() * canvas.width, -50);
      }
    }, 800);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gravity = 0.2;
      const friction = 0.99;
      const bounce = 0.6;

      shapesRef.current.forEach((s) => {
        s.vy += gravity;
        s.vx *= friction;
        s.vy *= friction;
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rv;

        // Wall collisions
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
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (s.type === 'circle') {
          ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        } else if (s.type === 'square') {
          ctx.rect(-s.size, -s.size, s.size * 2, s.size * 2);
        } else if (s.type === 'triangle') {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobileRef.current) return;
    const dx = Math.abs(e.clientX - lastMousePos.current.x);
    const dy = Math.abs(e.clientY - lastMousePos.current.y);
    if (dx + dy > 50) {
      const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      const colors = ['#834bf1', '#ffde59', '#000000', '#ffffff'];
      const newShape: PhysicalShape = {
        x: e.clientX,
        y: e.clientY,
        vx: (e.clientX - lastMousePos.current.x) * 0.2,
        vy: (e.clientY - lastMousePos.current.y) * 0.2,
        size: Math.random() * 20 + 10,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.1,
        opacity: 0.9
      };
      shapesRef.current.push(newShape);
      if (shapesRef.current.length > 40) shapesRef.current.shift();
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e || e.type === 'mousedown') {
      if (isMobileRef.current) {
        for (let i = 0; i < 3; i++) {
          const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
          const colors = ['#834bf1', '#ffde59', '#000000', '#ffffff'];
          shapesRef.current.push({
            x, y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 15 + 10,
            type: types[Math.floor(Math.random() * types.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rv: (Math.random() - 0.5) * 0.2,
            opacity: 0.9
          });
        }
        if (shapesRef.current.length > 15) shapesRef.current = shapesRef.current.slice(-15);
      } else {
        shapesRef.current.forEach(s => {
          const dx = s.x - x;
          const dy = s.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const force = (300 - dist) / 15;
            const angle = Math.atan2(dy, dx);
            s.vx += Math.cos(angle) * force;
            s.vy += Math.sin(angle) * force;
          }
        });
      }
    }
  };

  return (
    <section 
      className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden bg-white dark:bg-[#0a0a0a]"
      onMouseMove={handleMouseMove}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* PHYSICS LAYER */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* CONTENT LAYER */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="max-w-4xl space-y-8 md:space-y-12">
          <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1] animate-in fade-in">
            <Zap size={14} className="text-[#ffde59] animate-pulse" />
            <span>High-Performance Brand Systems</span>
          </div>

          <div className="space-y-4 animate-in slide-in-from-left-8 duration-700">
            <h1 className="flex flex-col text-5xl md:text-8xl lg:text-[130px] font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
              <span>Scale</span>
              <span className="text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Automate</span>
              <span className="flex items-center">
                Dominate
                <Sparkles className="ml-4 text-[#ffde59] hidden md:block animate-bounce" size={48} />
              </span>
            </h1>
            <div className="pt-6">
              <p className="text-lg md:text-2xl text-black/70 dark:text-white/70 font-black uppercase italic tracking-tight border-l-[8px] md:border-l-[12px] border-[#ffde59] pl-6 md:pl-10 max-w-2xl leading-tight">
                Architecting digital dominance through the synergy of Human Creativity and AI Precision. Surgical execution for SMEs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-8 animate-in slide-in-from-bottom-8 duration-1000">
            <button 
              onClick={onDashboardClick}
              className="group w-full sm:w-auto bg-[#834bf1] text-white px-10 py-7 md:px-12 md:py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2"
            >
              <span>Claim & Create Card</span>
              <Calendar size={20} className="group-hover:rotate-12 transition-transform" />
            </button>
            
            <button 
              onClick={onDashboardClick}
              className="w-full sm:w-auto bg-white text-black px-10 py-7 md:px-12 md:py-8 rounded-none font-black text-sm transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[8px_8px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group"
            >
              <span>Enter Creator Hub</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          
          <div className="pt-8 opacity-60">
            <div className="flex items-center space-x-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-none border-2 border-black bg-white overflow-hidden shadow-[2px_2px_0px_#000]">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i+20}`} alt="Agent" />
                   </div>
                 ))}
               </div>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Active Nodes: 12.4k</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-[-1] opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
      
      <div className="absolute top-1/4 right-8 pointer-events-none hidden lg:flex flex-col items-end space-y-4">
         <div className="bg-black text-white px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#ffde59] font-black text-[9px] uppercase tracking-widest italic">
           v4.8 Stable Engine
         </div>
         <div className="bg-white text-black px-4 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#834bf1] font-black text-[9px] uppercase tracking-widest">
           Ping: 12ms
         </div>
      </div>
    </section>
  );
};