import React, { useState } from 'react';
import { supabase } from '../lib/clients';
import { auth } from '../lib/firebase';
import { Calendar, Zap, Sparkles, TrendingUp } from 'lucide-react';
import CurvedLoop from './CurvedLoop';

export const CTA: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    // 1. Check Login
    if (!auth.currentUser) {
      alert("Please log in first to apply for a Creator Card.");
      return;
    }

    setLoading(true);
    console.log("🔥 Sending request to Supabase...");

    try {
      // 2. Send Update to Supabase
      // Assuming 'profiles' table has 'card_status' column and 'firebase_uid' for matching
      const { error } = await supabase
        .from('profiles')
        .update({ card_status: 'pending' })
        .eq('firebase_uid', auth.currentUser.uid);

      if (error) throw error;

      // 3. Success!
      alert("✅ Application Sent! Your status is now PENDING.");
      console.log("✅ Success! Database updated.");
      
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-48 px-6 scroll-mt-24 overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-7xl mx-auto bg-[#ffde59] border-[6px] border-black relative shadow-[24px_24px_0px_0px_#000000] dark:shadow-[24px_24px_0px_0px_#834bf1] p-12 lg:p-32 overflow-hidden group transition-all duration-500">
        
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:20px_20px]"></div>

        {/* Dynamic Curved Loop Marquee */}
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
              Ready to Claim Your <br /> 
              <span className="text-[#834bf1] drop-shadow-[6px_6px_0px_#fff]">Creator Card?</span>
            </h2>
            <p className="text-black text-xl md:text-2xl max-w-3xl mx-auto font-black uppercase italic tracking-tight border-l-[8px] border-black dark:border-white pl-8 py-4 bg-white/10 backdrop-blur-sm">
              Stop guessing. Start Scaling. Join the exclusive network of creators monetizing their influence.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            {/* NO <form> tags. Simple button as requested. */}
            <button 
              onClick={handleApply}
              disabled={loading}
              className="w-full sm:w-auto bg-[#834bf1] text-white px-14 py-8 border-[5px] border-black shadow-[10px_10px_0px_0px_#000000] font-black text-sm uppercase tracking-[0.4em] transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[20px_20px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center space-x-5 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar size={22} className="group-hover/btn:rotate-12 transition-transform" />
              <span className="italic font-display">
                {loading ? "Processing..." : "Apply for Card Now"}
              </span>
            </button>
          </div>
          
          <div className="pt-12 flex flex-col items-center space-y-6">
            <div className="flex -space-x-5">
               {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-14 h-14 border-[4px] border-black bg-white overflow-hidden shadow-[4px_4px_0px_#000] transition-transform hover:scale-110 hover:z-20 cursor-help">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=partner${i + 40}`} alt="Partner" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="bg-black text-white px-6 py-2 border-[2px] border-black font-black uppercase text-[10px] tracking-[0.6em] italic">
              ✦ 100% Secure Production Node ✦
            </div>
          </div>
        </div>

        {/* Decorative Sparkles */}
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
