
import React, { useRef, useEffect, useState } from 'react';
import { Play, Sparkles, TrendingUp, Instagram, CheckCircle2, Maximize2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface CreatorVerseProps {
  onEnterUniverse?: () => void;
}

export const CreatorVerse: React.FC<CreatorVerseProps> = ({ onEnterUniverse }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const primarySrc = "https://mc2szw5s8xk9lkkh.public.blob.vercel-storage.com/creator%20verse%201";
  const fallbackSrc = "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-dancing-40030-large.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      video.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch((error) => {
        console.warn("Autoplay interaction required:", error);
        setIsLoading(false);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay();
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [useFallback]);

  const handleVideoError = () => {
    console.error("Video source failed. Switching to fallback.");
    if (!useFallback) {
      setUseFallback(true);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleManualPlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section id="creators" className="py-32 bg-[#050505] overflow-hidden scroll-mt-24 relative border-y border-white/5">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] backdrop-blur-md">
            <Sparkles size={14} className="animate-pulse" />
            <span>Narrative Engine v4.0</span>
          </div>
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.8] uppercase">
            Creator <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 animate-gradient-x">Verse</span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto opacity-70">
            {useFallback ? "Streaming Alternate Reel" : "Direct Production Sync"} <br />
            Engineering Cinema-Grade Marketing Assets.
          </p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="relative aspect-video w-full rounded-[2.5rem] lg:rounded-[3.5rem] p-1.5 lg:p-2 bg-gradient-to-br from-white/20 to-transparent border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="relative h-full w-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-[#0a0a0a]">
              
              {isLoading && !hasError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                  <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                  <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Production Assets...</p>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 p-8 text-center">
                  <AlertCircle className="text-rose-500 mb-4" size={48} />
                  <h4 className="text-white font-black text-lg uppercase tracking-tight mb-2">Sync Interrupted</h4>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">The visual stream is temporarily unavailable. Our engineers are notified. Please refresh to attempt reconnection.</p>
                  <button onClick={() => window.location.reload()} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                    <RefreshCw size={14} />
                    <span>Attempt Re-Sync</span>
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                src={useFallback ? fallbackSrc : primarySrc}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => {
                  setIsLoading(false);
                  videoRef.current?.play().catch(e => console.log("Play error on load:", e));
                }}
                onError={handleVideoError}
                className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              />

              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 lg:p-12 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-2xl p-2 pr-5 rounded-full border border-white/10 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-700">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                       <span className="text-white font-black text-xs">R</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-[11px] uppercase tracking-tighter leading-none">REELYWOOD STUDIO</span>
                      <span className="text-indigo-400 font-bold text-[8px] uppercase tracking-[0.3em] mt-1.5 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping mr-1"></span>
                        {useFallback ? "BACKUP FEED" : "LIVE FEED 16:9"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 translate-x-[10px] group-hover:translate-x-0 transition-transform duration-700">
                    <Maximize2 size={20} className="text-white/60" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 translate-y-[20px] group-hover:translate-y-0 transition-transform duration-700">
                  <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-indigo-500/20 backdrop-blur-xl rounded-full border border-indigo-500/40">
                      <CheckCircle2 size={12} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-100 font-black uppercase tracking-[0.2em]">Verified High-Fidelity</span>
                    </div>
                    <p className="text-white text-2xl lg:text-4xl font-black leading-tight tracking-tight uppercase">
                      Cinematic dominance <br />
                      through visual authority.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-10 pb-4">
                     <div className="text-right">
                        <p className="text-3xl font-black text-white">4.2M</p>
                        <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1">TOTAL REACH</p>
                     </div>
                     <div className="h-12 w-px bg-white/20"></div>
                     <div className="text-right">
                        <p className="text-3xl font-black text-white">99%</p>
                        <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1">QUALITY</p>
                     </div>
                  </div>
                </div>
              </div>

              {!isPlaying && !isLoading && !hasError && (
                <div 
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer"
                  onClick={handleManualPlay}
                >
                  <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
                    <Play size={40} fill="currentColor" className="ml-2" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
           <button 
            onClick={onEnterUniverse}
            className="group relative inline-flex items-center space-x-5 bg-white text-slate-950 px-14 py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all hover:bg-indigo-50 hover:scale-[1.05] shadow-2xl shadow-white/5 border border-indigo-500/10"
          >
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">Enter The Universe</span>
              <TrendingUp size={20} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 12s ease infinite;
        }
      `}</style>
    </section>
  );
};
