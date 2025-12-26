
import React, { useRef, useEffect, useState } from 'react';
import { Heart, MessageCircle, Share2, Instagram, CheckCircle2 } from 'lucide-react';
import SimpleMarquee from './SimpleMarquee';

// Specific Google Drive direct link for high-impact video content
const SHARED_VIDEO_SRC = "https://drive.google.com/uc?export=download&id=1b-yO5ydbjTzLHI0oESHMEPd6JLOeNv6A";
const INSTAGRAM_REEL_URL = "https://www.instagram.com/reels/DJbaSdKhzFw/";

const CREATOR_DATA = [
  { user: "reelywood_studio", likes: "12.4K", comments: "152", caption: "Engineering virality through AI-driven content architecture. 🚀" },
  { user: "dorky_intel", likes: "8.8K", comments: "84", caption: "Automating lead generation with surgical precision. #SMEGrowth" },
  { user: "impact_loops", likes: "15.1K", comments: "210", caption: "The future of branding is human-AI synergy. #Innovation" },
  { user: "growth_engine", likes: "9.2K", comments: "45", caption: "Scaling brands beyond boundaries. 🌍" },
  { user: "visionary_ads", likes: "11.5K", comments: "98", caption: "Data-driven creative that converts. #ROI" }
];

const MarqueeItem: React.FC<{ index: number; rowIndex: number }> = ({ index, rowIndex }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dataIdx = (index + rowIndex) % CREATOR_DATA.length;
  const data = CREATOR_DATA[dataIdx];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        video.defaultMuted = true;
        await video.play();
      } catch (err) {
        console.debug("Autoplay pending interaction", err);
      }
    };

    // Slight staggered delay for performance
    const timer = setTimeout(attemptPlay, 100 + index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // Synchronized 5-second high-retention loop
    if (e.currentTarget.currentTime >= 5) {
      e.currentTarget.currentTime = 0;
      e.currentTarget.play().catch(() => {});
    }
  };

  return (
    <a 
      href={INSTAGRAM_REEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block mx-3 sm:mx-4 md:mx-6 hover:scale-[1.02] cursor-pointer transition-all duration-700 ease-out group"
    >
      <div className="relative overflow-hidden aspect-[9/16] w-40 sm:w-56 md:w-64 lg:w-72 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl bg-black group-hover:border-indigo-500/50 transition-colors">
         {/* Background Video Content */}
         <video
           ref={videoRef}
           autoPlay
           loop
           muted
           playsInline
           preload="metadata"
           onTimeUpdate={handleTimeUpdate}
           className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-50 group-hover:opacity-100 pointer-events-none"
         >
           <source src={SHARED_VIDEO_SRC} type="video/mp4" />
         </video>

         {/* Instagram Overlay UI Layer */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/30 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
            {/* Top Bar - Identity */}
            <div className="flex justify-between items-start">
               <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md p-1 pr-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px]">
                     <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user}`} alt="Avatar" className="w-full h-full" />
                     </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] sm:text-[10px] text-white font-black tracking-tight">{data.user}</span>
                    <CheckCircle2 size={10} className="text-blue-400 fill-blue-400/20" />
                  </div>
               </div>
               <Instagram size={16} className="text-white/40 group-hover:text-white/90 transition-colors" />
            </div>

            {/* Bottom Content Area */}
            <div className="space-y-3 sm:space-y-4">
               {/* Vertical Actions */}
               <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-1 border border-white/10 hover:bg-rose-500/20 transition-colors">
                      <Heart size={20} className="text-white fill-transparent group-hover:fill-rose-500 group-hover:text-rose-500 transition-all" />
                    </div>
                    <span className="text-[9px] text-white font-black">{data.likes}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-1 border border-white/10">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <span className="text-[9px] text-white font-black">{data.comments}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-1 border border-white/10">
                      <Share2 size={20} className="text-white" />
                    </div>
                  </div>
               </div>

               {/* Caption and Metrics */}
               <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-relaxed max-w-[85%]">
                    {data.caption}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                     <div className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                        <span className="text-[8px] text-indigo-300 font-black uppercase tracking-widest">Growth Engine Active</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </a>
  );
};

export const CreatorVerse: React.FC = () => {
  const cardCountPerRow = 5;
  const indices = Array.from({ length: cardCountPerRow }, (_, i) => i);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const videos = entry.target.querySelectorAll('video');
          if (entry.isIntersecting) {
            videos.forEach(v => v.play().catch(() => {}));
          } else {
            videos.forEach(v => v.pause());
          }
        });
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="creators"
      className="w-full min-h-screen relative flex flex-col justify-center items-center bg-[#050505] overflow-hidden py-32 scroll-mt-24"
      ref={containerRef}
    >
      {/* Background depth effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_75%)] pointer-events-none"></div>

      {/* Section Heading */}
      <div className="relative z-10 text-center mb-24 px-6">
        <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em] mb-4 animate-pulse">
          Performance Network
        </h4>
        <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white font-black tracking-tighter leading-[0.8] mb-8">
          Creator <span className="text-indigo-600">Verse</span>
        </h2>
        <h3 className="text-white/40 font-black text-sm uppercase tracking-[0.4em] mt-[-1rem] mb-10">High-Retention Content Loops</h3>
        <p className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed opacity-70">
          We don't just create; we engineer Influence. Explore our verified <br className="hidden md:block" /> 
          network of data-driven creators.
        </p>
      </div>

      {/* Marquee Video Tracks */}
      <div className="w-full flex flex-col space-y-8 md:space-y-12 relative">
        <SimpleMarquee
          className="w-full"
          baseVelocity={1.2}
          repeat={3}
          direction="left"
        >
          {indices.map((i) => (
            <MarqueeItem key={`row1-${i}`} index={i} rowIndex={0} />
          ))}
        </SimpleMarquee>

        <SimpleMarquee
          className="w-full"
          baseVelocity={1.6}
          repeat={3}
          direction="right"
        >
          {indices.map((i) => (
            <MarqueeItem key={`row2-${i}`} index={i} rowIndex={1} />
          ))}
        </SimpleMarquee>

        <SimpleMarquee
          className="w-full"
          baseVelocity={1.4}
          repeat={3}
          direction="left"
        >
          {indices.map((i) => (
            <MarqueeItem key={`row3-${i}`} index={i} rowIndex={2} />
          ))}
        </SimpleMarquee>
      </div>

      {/* Footer Decoration */}
      <div className="mt-32 relative z-10 flex flex-col items-center group">
         <div className="w-px h-32 bg-gradient-to-b from-indigo-600 via-indigo-400/20 to-transparent group-hover:h-40 transition-all duration-700"></div>
         <div className="mt-8 flex flex-col items-center">
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.8em] animate-pulse mb-2">
              Velocity Engine Active
            </p>
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">
              Synchronized 5S Impact Loops
            </p>
         </div>
      </div>
    </section>
  );
};
