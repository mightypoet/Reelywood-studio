import React, { useState } from 'react';
import { Calendar, ArrowRight, Zap, Sparkles, TrendingUp } from 'lucide-react';
import CurvedLoop from './CurvedLoop';
import { supabase } from '../lib/clients';
import { auth } from '../lib/firebase';

export const CTA: React.FC = () => {
  const [isPending, setIsPending] = useState(false);

  const handleApply = async () => {
    // STEP 1: Aggressive Debugging Log
    console.log("🔴 Button Clicked: Apply for Creator Card initiated.");

    // SAFETY CHECK: Ensure supabase client is available before any operation
    if (!supabase) {
      console.error("❌ SUPABASE MISSING: Database client not initialized.");
      alert("Database connection error. Please try again later.");
      return;
    }

    try {
      // STEP 2: Check for Authenticated User
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.warn("⚠️ AUTH CHECK: No user session detected.");
        alert("Please log in to apply for your Creator Card!");
        return;
      }

      console.log("🟢 User Authenticated:", currentUser.email, "UID:", currentUser.uid);

      // STEP 3: Execute Database Update
      setIsPending(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ card_status: 'pending' })
        .eq('firebase_uid', currentUser.uid);

      if (error) {
        console.error("❌ SUPABASE ERROR:", error.message, error);
        alert("Database Error: " + error.message);
        setIsPending(false);
        return;
      }

      // STEP 4: Success Protocol
      console.log("✅ SYNC SUCCESS: card_status set to 'pending' in Supabase.");
      alert("Application Sent! Your status is now PENDING. Check back later.");
      
    } catch (err: any) {
      console.error("☢️ CRITICAL FAILURE:", err);
      alert("Application Failed: " + (err.message || "Unknown error"));
      setIsPending(false);
    }
  };

  return (
    <section id="contact" className="py-48 px-6 scroll-mt-24 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto bg-[#ffde59] border-[6px] border-black relative shadow-[24px_24px_0px_0px_#000000] dark:shadow-[24px_24px_0px_0px_#834bf1] p-12 lg:p-32 overflow-hidden group transition-all duration-500">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:20px_20px]"></div>

        {/* Dynamic Curved Loop Backgrounds */}
        <div className="absolute top-0 left-0 w-full opacity-5 pointer-events-none transform -translate-y-12 z-0">
          <CurvedLoop 
            marqueeText="SCALE ✦ AUTOMATE ✦ DOMINATE ✦ REELYWOOD ✦"
            speed={1}
            curveAmount={100}
            interactive={false}
            className="text-black italic font-black text-8xl"
          />
        </div>

        <div className="relative z-10 text-center space-y-14">
          <div className="inline-flex items-center space-x-4 bg-black border-[3px] border-black px-8 py-3 rounded-none text-white font-black text-[11px] uppercase tracking-[0.5em] shadow-[8px_8px_0px_0px_#834bf1] animate-in fade-in slide-in-from-top-4 duration-700">
            <TrendingUp size={16} className="text-[#ffde59] animate-pulse" />
            <span>Deployment Protocol Ready</span>
          </div>

          <div className="space-y-8">
            <h2 className="text-6xl md:text-8xl lg:text-[110px] font-black text-black leading-[0.85] tracking-tighter font-display uppercase italic drop-shadow-[6px_6px_0px_rgba(0,0,0,0.05)]">
              Ready to automate <br /> 
              your brand's <span className="text-[#834bf1] drop-shadow-[6px_6px_0px_#fff]">growth</span>?
            </h2>
            <p className="text-black text-xl md:text-2xl max-w-3xl mx-auto font-black uppercase italic tracking-tight opacity-90 border-l-[8px] border-black pl-8 py-4 bg-white/10 backdrop-blur-sm">
              Stop guessing. Start Scaling. Partner with the agency that engineers virality through data.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            <button 
              onClick={handleApply}
              className="w-full sm:w-auto bg-[#834bf1] text-white px-14 py-8 border-[5px] border-black shadow-[10px_10px_0px_0px_#000000] font-black text-xs uppercase tracking-[0.4em] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[20px_20px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-5 group/btn"
            >
              <Calendar size={22} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="italic font-display">{isPending ? "Pending..." : "Apply for creator card"}</span>
            </button>
            
            <button className="w-full sm:w-auto bg-white text-black border-[5px] border-black px-14 py-8 shadow-[10px_10px_0px_0px_#000000] font-black text-xs uppercase tracking-[0.4em] hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[20px_20px_0px_0px_#834bf1] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-5 group/btn2">
              <span className="italic font-display">View Mission Archive</span>
              <ArrowRight size={22} strokeWidth={3} className="group-hover/btn2:translate-x-2 transition-transform" />
            </button>
          </div>
          
          <div className="pt-12 flex flex-col items-center space-y-6">
            <div className="flex -space-x-5">
               {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-14 h-14 border-[4px] border-black bg-white overflow-hidden shadow-[4px_4px_0px_#000] transition-transform hover:scale-110 hover:z-20 cursor-help">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i + 20}`} alt="Partner" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="bg-black text-white px-6 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-[0.6em] italic">
              ✦ 100% Performance Guarantee ✦
            </div>
          </div>
        </div>

        {/* Corner Sparkle Decorations */}
        <div className="absolute top-12 left-12 text-black animate-bounce hidden lg:block opacity-40">
          <Sparkles size={64} />
        </div>
        <div className="absolute bottom-12 right-12 text-[#834bf1] animate-pulse hidden lg:block">
          <Sparkles size={48} />
        </div>
        <div className="absolute top-1/2 right-12 text-black animate-spin-slow hidden lg:block opacity-20">
          <Zap size={80} fill="currentColor" />
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};