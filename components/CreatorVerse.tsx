
import React, { useRef, useEffect, useState } from 'react';
import { Play, Sparkles, TrendingUp, Instagram, CheckCircle2, Maximize2, Loader2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

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
    <section id="creators" className="py-24 sm:py-32 bg-white dark:bg-[#0a0a0a] overflow-hidden scroll-mt-24 relative border-t-[4px] border-black dark:border-white transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 sm:mb-20 space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-3 bg-[#ffde59] border-[3px] border-black px-4 sm:px-6 py-2 rounded-none text-black font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={14} className="animate-pulse" />
            <span>Narrative Engine v4.0</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[110px] font-black text-black dark:text-white tracking-tighter leading-[0.85] uppercase font-display italic">
            Creator <br />
            <span className="text-[#834bf1] drop-shadow-[3px_3px_0px_#000] sm:drop-shadow-[4px_4px_0px_#000] dark:drop-shadow-[3px_3px_0px_#fff] sm:dark:drop-shadow-[4px_4px_0px_#fff]">Verse</span>
          </h2>
          
          <p className="text-black/60 dark:text-white/60 text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.2em] max-w-2xl mx-auto">
            {useFallback ? "Alternate Reel Protocol" : "Direct Production Sync"} — Engineering Cinema-Grade Marketing Assets with Surgical Precision.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto group">
          {/* Main Neobrutalist Container */}
          <div className="relative aspect-video w-full p-1 lg:p-2 bg-white dark:bg-black border-[4px] sm:border-[6px] border-black dark:border-white shadow-[10px_10px_0px_0px_#834bf1] sm:shadow-[16px_16px_0px_0px_#834bf1] overflow-hidden transition-all duration-300 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-[6px_6px_0px_0px_#834bf1] sm:group-hover:shadow-[8px_8px_0px_0px_#834bf1]">
            <div className="relative h-full w-full overflow-hidden bg-black">
              
              {isLoading && !hasError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black">
                  <Loader2 className="animate-spin text-[#ffde59]" size={32} sm:size={48} strokeWidth={3} />
                  <p className="text-[#ffde59] font-black text-[8px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.5em] mt-4 animate-pulse text-center px-4">Syncing Production Assets...</p>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0a] p-4 sm:p-8 text-center">
                  <AlertCircle className="text-rose-500 mb-4" size={32} sm:size={48} strokeWidth={3} />
                  <h4 className="text-white font-black text-base sm:text-lg uppercase tracking-tight mb-2 italic font-display">Sync Interrupted</h4>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest max-w-xs mx-auto mb-6 sm:mb-8">Visual stream unavailable. Attempt reconnection protocol.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="flex items-center space-x-3 bg-[#ffde59] text-black px-6 sm:px-8 py-3 sm:py-4 border-[2px] sm:border-[3px] border-black font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <RefreshCw size={14} strokeWidth={3} />
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
                className={`w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ${isLoading ? 'opacity-0' : 'opacity-80'}`}
              />

              {/* Neobrutalist UI Overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none p-4 lg:p-10 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex justify-between items-start">
                  <div className="bg-[#834bf1] border-[2px] sm:border-[3px] border-black p-2 sm:p-4 flex items-center space-x-3 sm:space-x-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-[2px] border-black flex items-center justify-center">
                       <span className="text-black font-black text-[10px] sm:text-xs">R</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-[9px] sm:text-[12px] uppercase tracking-tighter leading-none italic font-display">REELYWOOD</span>
                      <span className="text-white/80 font-bold text-[7px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
                        {useFallback ? "BACKUP FEED" : "LIVE FEED"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#ffde59] border-[2px] sm:border-[3px] border-black p-2 sm:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Maximize2 size={16} sm:size={20} className="text-black" strokeWidth={3} />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-2 sm:space-y-4 bg-white border-[2px] sm:border-[3px] border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-xs sm:max-w-lg">
                    <div className="inline-flex items-center space-x-2 text-[#834bf1]">
                      <CheckCircle2 size={14} sm:size={16} strokeWidth={3} />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Verified Production</span>
                    </div>
                    <p className="text-black text-sm sm:text-xl lg:text-2xl font-black leading-tight tracking-tight uppercase font-display italic">
                      Cinematic dominance through visual authority.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 sm:space-x-8 bg-black border-[2px] sm:border-[3px] border-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_#834bf1] sm:shadow-[6px_6px_0px_0px_#834bf1] self-start lg:self-auto">
                     <div className="text-right">
                        <p className="text-lg sm:text-2xl font-black text-[#ffde59] leading-none">4.2M</p>
                        <p className="text-white/40 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">REACH</p>
                     </div>
                     <div className="h-8 sm:h-10 w-[1px] sm:w-[2px] bg-white/20"></div>
                     <div className="text-right">
                        <p className="text-lg sm:text-2xl font-black text-[#ffde59] leading-none">99%</p>
                        <p className="text-white/40 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">FIDELITY</p>
                     </div>
                  </div>
                </div>
              </div>

              {!isPlaying && !isLoading && !hasError && (
                <div 
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
                  onClick={handleManualPlay}
                >
                  <div className="w-16 h-16 sm:w-24 h-24 bg-[#ffde59] border-[3px] sm:border-[4px] border-black flex items-center justify-center text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-all">
                    <Play size={30} sm:size={40} fill="currentColor" className="ml-1 sm:ml-2" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 text-center">
           <button 
            onClick={onEnterUniverse}
            className="group relative inline-flex items-center space-x-4 sm:space-x-6 bg-[#834bf1] text-white px-8 sm:px-14 py-5 sm:py-8 border-[3px] sm:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] sm:dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] font-black text-xs sm:text-sm uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-x-2 active:translate-y-2"
          >
              <span className="relative z-10 italic font-display">Enter The Universe</span>
              <TrendingUp size={18} sm:size={20} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
           <p className="mt-8 sm:mt-10 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-black/30 dark:text-white/20">
             High Performance • built for Gen Z • ROI Focused
           </p>
        </div>
      </div>
    </section>
  );
};
