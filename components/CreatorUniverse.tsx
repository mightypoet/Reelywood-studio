
import React, { useRef, useEffect } from 'react';
import { Play, Instagram, Sparkles, TrendingUp } from 'lucide-react';

interface VideoItem {
  id: number;
  url: string;
  thumbnail: string;
  category: string;
}

const videos: VideoItem[] = [
  { id: 1, url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-dancing-40030-large.mp4", thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", category: "Fashion" },
  { id: 2, url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-in-the-gym-23450-large.mp4", thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48", category: "Fitness" },
  { id: 3, url: "https://assets.mixkit.co/videos/preview/mixkit-coffee-being-poured-into-a-cup-34537-large.mp4", thumbnail: "https://images.unsplash.com/photo-1509042239860-f550ce710b93", category: "Lifestyle" },
  { id: 4, url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-with-his-dog-in-the-park-34444-large.mp4", thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9", category: "Pets" },
  { id: 5, url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-typing-on-a-laptop-40348-large.mp4", thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643", category: "Tech" },
  { id: 6, url: "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-to-her-face-in-front-of-a-39843-large.mp4", thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9", category: "Beauty" },
  { id: 7, url: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-with-light-trails-34458-large.mp4", thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df", category: "Travel" },
  { id: 8, url: "https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-salad-in-the-kitchen-40432-large.mp4", thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d", category: "Food" },
  { id: 9, url: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-a-grand-piano-40018-large.mp4", thumbnail: "https://images.unsplash.com/photo-1520529612663-95e28a5848e0", category: "Music" },
  { id: 10, url: "https://assets.mixkit.co/videos/preview/mixkit-man-skateboarding-on-a-sunny-day-34453-large.mp4", thumbnail: "https://images.unsplash.com/photo-1547444801-997428987fd4", category: "Sport" },
  { id: 11, url: "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-smiling-34442-large.mp4", thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", category: "Brand" },
  { id: 12, url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-at-a-coffee-shop-34447-large.mp4", thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085", category: "Retail" },
];

export const CreatorUniverse: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vids = entry.target.querySelectorAll('video');
          if (entry.isIntersecting) {
            vids.forEach(v => v.play().catch(() => {}));
          } else {
            vids.forEach(v => v.pause());
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="creators" className="py-32 bg-slate-950 overflow-hidden scroll-mt-24 relative">
      {/* Background Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-purple-400 font-black text-[10px] uppercase tracking-[0.4em] backdrop-blur-md">
              <Sparkles size={14} className="animate-pulse" />
              <span>Influence Engineering</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tighter leading-[0.9]">
              Creator <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Universe</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
              We don't just find influencers; we engineer virality. Our proprietary AI tools analyze engagement patterns to pair your brand with creators that convert.
            </p>
          </div>
          <div className="flex flex-col items-end space-y-4">
             <div className="flex items-center space-x-4 bg-white/5 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl">
                <TrendingUp className="text-pink-500" />
                <div className="text-right">
                   <p className="text-white font-black text-xl leading-none">12.4M+</p>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Reach Monthly</p>
                </div>
             </div>
             <button className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-colors flex items-center space-x-3">
               <span>Join the Network</span>
               <Instagram size={14} />
             </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {videos.map((vid, idx) => (
            <div 
              key={vid.id}
              className="group relative aspect-[9/16] bg-slate-900 rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-700 hover:-translate-y-2 shadow-2xl"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10 pointer-events-none"></div>
              
              {/* Category Tag */}
              <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                  {vid.category}
                </span>
              </div>

              {/* Play Icon Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-500">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white">
                  <Play size={24} fill="white" className="ml-1" />
                </div>
              </div>

              {/* Video Element */}
              <video
                src={vid.url}
                poster={vid.thumbnail}
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />

              {/* Content Description */}
              <div className="absolute bottom-6 left-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                 <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Impact V{idx + 1}</p>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 w-1/3 group-hover:w-full transition-all duration-[7000ms] linear"></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
           <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em] mb-10">High Performance. Limitless Reach. Built for Gen Z.</p>
           <div className="flex justify-center">
              <div className="w-24 h-24 border-2 border-white/5 rounded-full flex items-center justify-center animate-spin-slow cursor-pointer hover:bg-white/5 transition-colors group">
                 <Instagram className="text-white/20 group-hover:text-white transition-colors" size={32} />
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};
