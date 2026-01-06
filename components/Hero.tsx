import React, { useState } from 'react';
import { Play, ArrowRight, Zap, Sparkles, Calendar } from 'lucide-react';
import { supabase } from '../lib/clients';
import { auth } from '../lib/firebase';

interface HeroProps {
  onAuthClick: () => void;
  onDashboardClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthClick, onDashboardClick }) => {
  const [isPending, setIsPending] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApply = async () => {
    if (!auth.currentUser) {
      alert("Please log in to apply.");
      onAuthClick(); // Redirect to login if not authenticated
      return;
    }

    console.log("🔥 Sending request to Supabase...");
    setIsPending(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ card_status: 'pending' })
        .eq('firebase_uid', auth.currentUser.uid);

      if (error) {
        console.error("❌ Error:", error);
        alert("Error: " + error.message);
      } else {
        console.log("✅ Success!");
        alert("Application Sent Successfully! Check the Admin Panel.");
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      alert("Error: " + (err.message || "Unknown error"));
    } finally {
      setIsPending(false);
    }
  };

  const VIDEO_URL = "https://izz9qoicna213xwc.public.blob.vercel-storage.com/Untitled%20design%20%282%29.mp4";

  return (
    <section className="relative min-h-[100svh] flex items-center pt-32 pb-24 overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
            
            <div className="inline-flex items-center space-x-3 bg-black border-[3px] border-black px-6 py-2.5 rounded-none text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[6px_6px_0px_0px_#834bf1]">
              <Zap size={14} className="text-[#ffde59] animate-pulse" />
              <span>Intelligence-First Brand Engineering</span>
            </div>

            <div className="space-y-4">
              <h1 className="flex flex-col text-6xl md:text-8xl lg:text-[120px] font-black text-black dark:text-white leading-[0.8] tracking-tighter font-display uppercase italic">
                <span>Scale</span>
                <span className="mt-2 text-[#834bf1] drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[4px_4px_0px_#fff]">Automate</span>
                <span className="mt-2">Dominate</span>
              </h1>
              <div className="flex items-center space-x-6 pt-6">
                <div className="h-[4px] w-24 bg-[#ffde59]"></div>
                <p className="text-lg md:text-xl text-black/60 dark:text-white/60 font-black uppercase italic tracking-tight">
                  For the high-performance SME
                </p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-black dark:text-white font-bold leading-relaxed max-w-2xl tracking-tight border-l-[8px] border-black dark:border-[#834bf1] pl-8">
              We engineer dynamic brand ecosystems through the synergy of Human Creativity and AI Precision. Scaling SMEs with surgical efficiency.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 pt-8">
              {/* PRIMARY CTA: Apply for card (Replaces Enter Creator Hub for conversion focus) */}
              <button 
                onClick={handleApply}
                disabled={isPending}
                className="group w-full sm:w-auto bg-[#834bf1] text-white px-12 py-8 rounded-none font-black text-sm lg:text-base transition-all flex items-center justify-between sm:justify-center space-x-10 border-[4px] border-black shadow-[10px_10px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 disabled:opacity-50"
              >
                <span>{isPending ? "Processing..." : "Apply for Creator Card"}</span>
                <Calendar size={22} className="group-hover:rotate-12 transition-transform" />
              </button>
              
              <button 
                onClick={onDashboardClick}
                className="w-full sm:w-auto bg-white text-black px-12 py-8 rounded-none font-black text-sm lg:text-base transition-all flex items-center justify-center space-x-8 border-[4px] border-black shadow-[10px_10px_0px_0px_#ffde59] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2 group"
              >
                <span>Enter Creator Hub</span>
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-4 relative items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative w-full aspect-[4/5] max-w-[400px] overflow-hidden border-[6px] border-black shadow-[24px_24px_0px_0px_#834bf1] bg-black group cursor-crosshair transition-all">
              <video src={VIDEO_URL} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-8 left-8 right-8 z-20">
                 <div className="bg-white text-black p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_#ffde59] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                   <p className="font-black text-[10px] uppercase tracking-widest text-[#834bf1] mb-1">Live Experiment</p>
                   <p className="font-black text-sm uppercase italic">High-Fidelity Assets</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .font-display { font-family: 'Archivo Black', sans-serif; }
      `}</style>
    </section>
  );
};